"use client";

import {
  Check,
  ChevronDown,
  Info,
  Minus,
  Plus,
  TriangleAlert,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import AddDepartmentDialog from "@/components/features/dashboard/departments/AddDepartmentDialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useHasAccess } from "@/lib/access-control";
import { cn } from "@/lib/utils";
import {
  createAsset,
  CreateAssetPayload,
  updateAsset,
} from "@/services/assetService";
import { fetchDepartments } from "@/services/departmentService";
import { fetchLocations } from "@/services/locationService";
import { fetchAdmins } from "@/services/userServices";

import {
  Asset,
  AssetCondition,
  ASSET_CATEGORIES,
  ASSET_RISKS,
  ASSET_STATUSES,
  MAINTENANCE_FREQUENCIES,
} from "./data";

// Sentinel value for the "Add new department" option at the end of the
// Department dropdown - it opens the create dialog instead of being selected.
const ADD_DEPARTMENT_VALUE = "__add_department__";

// Ownership is stored in the asset's existing free-text `owner` field as a
// Readable string ("Church-owned", "Borrowed from X", "Leased from X"), so it
// Displays correctly anywhere the owner is shown without a schema change.
type Ownership = "church" | "borrowed" | "leased";

const OWNERSHIP_OPTIONS: {
  value: Ownership;
  label: string;
  nameLabel?: string;
}[] = [
  { value: "church", label: "Church-owned" },
  { value: "borrowed", label: "Borrowed", nameLabel: "Borrowed from" },
  { value: "leased", label: "Leased", nameLabel: "Leased from" },
];

function parseOwner(owner: string | undefined): {
  ownership: Ownership;
  ownerName: string;
} {
  const match = owner?.trim().match(/^(borrowed|leased) from (.+)$/i);
  if (match) {
    return {
      ownership: match[1].toLowerCase() as Ownership,
      ownerName: match[2].trim(),
    };
  }
  // Empty, "Church-owned", or a legacy free-text value.
  return { ownership: "church", ownerName: "" };
}

function formatOwner(ownership: Ownership, ownerName: string): string {
  if (ownership === "church") {
    return "Church-owned";
  }
  const option = OWNERSHIP_OPTIONS.find((o) => {
    return o.value === ownership;
  });
  return `${option?.nameLabel} ${ownerName.trim()}`;
}

export type AssetModalMode = "create" | "edit" | "view";

export interface AddAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: AssetModalMode;
  asset?: Asset | null;
  onSaved: (asset: Asset, mode: Exclude<AssetModalMode, "view">) => void;
}

interface UnitForm {
  id?: string;
  serial: string;
  condition: AssetCondition;
  conditionNote: string;
  purchaseDate: string;
  value: string;
}

interface FormState {
  name: string;
  tag: string;
  description: string;
  category: string;
  department: string;
  ownership: Ownership;
  ownerName: string;
  // True once the user changes ownership, so editing an asset with a legacy
  // Free-text owner doesn't overwrite it unless they actually touch it.
  ownerTouched: boolean;
  responsibleMode: "system" | "manual";
  assignee: string;
  manualName: string;
  manualEmail: string;
  risk: string;
  location: string;
  status: string;
  maintenanceEnabled: boolean;
  frequency: string;
  lastService: string;
  lastReview: string;
  remarks: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  tag: "",
  description: "",
  category: "Other",
  department: "",
  ownership: "church",
  ownerName: "",
  ownerTouched: false,
  responsibleMode: "system",
  assignee: "",
  manualName: "",
  manualEmail: "",
  risk: "Low",
  location: "",
  status: "Active",
  maintenanceEnabled: true,
  frequency: "Quarterly",
  lastService: "",
  lastReview: "",
  remarks: "",
};

const newUnit = (condition: AssetCondition = "Good"): UnitForm => {
  return {
    serial: "",
    condition,
    conditionNote: "",
    purchaseDate: "",
    value: "",
  };
};

const MAX_UNITS = 200;

const STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "People & place" },
  { id: 3, label: "Items" },
  { id: 4, label: "Review" },
] as const;

const CONDITION_OPTIONS: {
  value: AssetCondition;
  label: string;
  active: string;
  dot: string;
}[] = [
  {
    value: "Good",
    label: "Good",
    active: "border-green-500 bg-green-50 text-green-700",
    dot: "bg-green-500",
  },
  {
    value: "Fair",
    label: "Fair",
    active: "border-blue-500 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  {
    value: "Repair",
    label: "Needs repair",
    active: "border-orange-500 bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  {
    value: "Damaged",
    label: "Damaged",
    active: "border-red-500 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
];

const conditionLabel = (condition: AssetCondition) => {
  return (
    CONDITION_OPTIONS.find((o) => {
      return o.value === condition;
    })?.label ?? condition
  );
};

const controlClass =
  "h-9 rounded-lg border-gray-300 bg-white text-sm text-gray-900 shadow-none";

/** Best-effort conversion from a display date ("Apr 28, 2026") back to the
 * yyyy-MM-dd shape a date input needs. Returns "" when it can't be parsed. */
function toInputDate(display: string | undefined) {
  if (!display) {
    return "";
  }
  const parsed = new Date(display);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString().slice(0, 10);
}

function unitsFromAsset(asset: Asset): UnitForm[] {
  if (asset.units?.length) {
    return asset.units.map((unit) => {
      return {
        id: unit.id,
        serial: unit.serial,
        condition: unit.condition,
        conditionNote: unit.conditionNote,
        purchaseDate: unit.purchaseDate,
        value:
          unit.value === null || unit.value === undefined
            ? ""
            : String(unit.value),
      };
    });
  }

  // Older responses only carried condition counts.
  const out: UnitForm[] = [];
  const counts: [AssetCondition, number][] = [
    ["Good", asset.conditions.good],
    ["Fair", asset.conditions.fair],
    ["Repair", asset.conditions.repair],
    ["Damaged", asset.conditions.damaged],
  ];
  for (const [condition, count] of counts) {
    for (let i = 0; i < count; i++) {
      out.push(newUnit(condition));
    }
  }
  return out.length ? out : [newUnit()];
}

function FieldLabel({
  htmlFor,
  children,
  required,
  className,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn(
        "block text-[13px] font-medium leading-none text-gray-700",
        className,
      )}
    >
      {children}
      {required && <span className="ml-0.5 align-super text-red-500">*</span>}
    </Label>
  );
}

function Fieldset({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function ConditionPicker({
  value,
  onChange,
  disabled,
}: {
  value: AssetCondition;
  onChange: (value: AssetCondition) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
      {CONDITION_OPTIONS.map((option) => {
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            disabled={disabled}
            onClick={() => {
              return onChange(option.value);
            }}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed",
              value === option.value
                ? option.active
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", option.dot)} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface UnitCardProps {
  index: number;
  unit: UnitForm;
  duplicateSerial: boolean;
  readOnly: boolean;
  onChange: (patch: Partial<UnitForm>) => void;
}

function UnitCard({
  index,
  unit,
  duplicateSerial,
  readOnly,
  onChange,
}: UnitCardProps) {
  const [showMore, setShowMore] = useState(
    Boolean(unit.purchaseDate || unit.value),
  );
  const needsNote = unit.condition === "Repair" || unit.condition === "Damaged";

  return (
    <div
      className={cn(
        "rounded-xl border p-3.5",
        needsNote
          ? "border-orange-200 bg-orange-50/40"
          : "border-gray-200 bg-white",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-400 text-xs font-semibold text-white">
          {index + 1}
        </span>
        <Input
          aria-label={`Serial or tag for item ${index + 1}`}
          disabled={readOnly}
          value={unit.serial}
          onChange={(e) => {
            return onChange({ serial: e.target.value });
          }}
          placeholder="Serial / tag (optional)"
          className={cn(
            controlClass,
            "flex-1",
            duplicateSerial && "border-red-400",
          )}
        />
      </div>
      {duplicateSerial && (
        <p className="mt-1 pl-10 text-xs text-red-600">
          Another item here has the same serial or tag.
        </p>
      )}

      <div className="mt-3">
        <ConditionPicker
          value={unit.condition}
          disabled={readOnly}
          onChange={(condition) => {
            return onChange({ condition });
          }}
        />
      </div>

      {needsNote && (
        <div className="mt-3">
          <Textarea
            aria-label={`What is wrong with item ${index + 1}`}
            disabled={readOnly}
            value={unit.conditionNote}
            onChange={(e) => {
              return onChange({ conditionNote: e.target.value });
            }}
            placeholder="What's wrong? e.g. cracked screen, won't power on"
            rows={2}
            className={cn(controlClass, "h-auto resize-none py-2")}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          return setShowMore((v) => {
            return !v;
          });
        }}
        className="mt-3 flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            showMore && "rotate-180",
          )}
        />
        {showMore ? "Hide details" : "More details"}
      </button>

      {showMore && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <FieldLabel>Purchase date</FieldLabel>
            <DatePicker
              disabled={readOnly}
              value={unit.purchaseDate}
              onChange={(value) => {
                return onChange({ purchaseDate: value });
              }}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Value</FieldLabel>
            <Input
              type="number"
              min={0}
              disabled={readOnly}
              value={unit.value}
              onChange={(e) => {
                return onChange({ value: e.target.value });
              }}
              placeholder="0"
              className={controlClass}
            />
          </div>
          {!needsNote && (
            <div className="col-span-2 space-y-1.5">
              <FieldLabel>Note</FieldLabel>
              <Input
                disabled={readOnly}
                value={unit.conditionNote}
                onChange={(e) => {
                  return onChange({ conditionNote: e.target.value });
                }}
                placeholder="Anything worth remembering about this item"
                className={controlClass}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AddAssetModal({
  open,
  onOpenChange,
  mode = "create",
  asset,
  onSaved,
}: AddAssetModalProps) {
  const { toast } = useToast();
  const readOnly = mode === "view";
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [units, setUnits] = useState<UnitForm[]>([newUnit()]);
  const [step, setStep] = useState(1);
  const [reached, setReached] = useState(1);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [admins, setAdmins] = useState<{ id: string; fullName: string }[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [addDepartmentOpen, setAddDepartmentOpen] = useState(false);
  // Same permission the backend requires on POST /department.
  const canCreateDepartment = useHasAccess("DEPARTMENTS", "FULL_ACCESS");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    fetchDepartments({ page: 1, limit: 100 })
      .then((res) => {
        setDepartments(
          res.data.map((d) => {
            return { id: d.id, name: d.name };
          }),
        );
      })
      .catch(() => {
        // Department select just stays empty when the API is unavailable.
      });

    fetchAdmins({ page: 1, limit: 100 })
      .then((res) => {
        return setAdmins(res.data);
      })
      .catch(() => {
        // Assignee select just stays empty when the API is unavailable.
      });

    fetchLocations()
      .then((res) => {
        return setLocations(
          res
            .filter((location) => {
              return location.isActive;
            })
            .sort((a, b) => {
              return a.sortOrder - b.sortOrder;
            }),
        );
      })
      .catch(() => {
        // Location suggestions just stay empty when the API is unavailable.
      });
  }, [open]);

  useEffect(() => {
    setStep(1);
    setReached(mode === "create" ? 1 : STEPS.length);

    if (!open) {
      setForm(EMPTY_FORM);
      setUnits([newUnit()]);
      return;
    }

    if (asset) {
      setForm({
        ...EMPTY_FORM,
        name: asset.name,
        tag: asset.tag,
        description: asset.description,
        category: asset.category,
        department: asset.departmentId || "",
        ...parseOwner(asset.owner),
        responsibleMode: asset.responsible.isSystem ? "system" : "manual",
        assignee: asset.responsible.isSystem ? asset.responsible.id || "" : "",
        manualName: !asset.responsible.isSystem ? asset.responsible.name : "",
        manualEmail: !asset.responsible.isSystem ? asset.responsible.email : "",
        risk: asset.risk,
        location: asset.location,
        status: asset.status,
        maintenanceEnabled: Boolean(asset.maintenance),
        frequency: asset.maintenance ?? "Quarterly",
        lastService: toInputDate(asset.schedule.lastService),
        lastReview: toInputDate(asset.schedule.lastReview),
        remarks: asset.remarks,
      });
      setUnits(unitsFromAsset(asset));
    } else {
      setForm(EMPTY_FORM);
      setUnits([newUnit()]);
    }
  }, [open, asset, mode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    return setForm((prev) => {
      return { ...prev, [key]: value };
    });
  };

  const setCount = (next: number) => {
    const count = Math.min(Math.max(Math.round(next) || 1, 1), MAX_UNITS);
    setUnits((prev) => {
      return count <= prev.length
        ? prev.slice(0, count)
        : [
            ...prev,
            ...Array.from({ length: count - prev.length }, () => {
              return newUnit();
            }),
          ];
    });
  };

  const patchUnit = (index: number, patch: Partial<UnitForm>) => {
    return setUnits((prev) => {
      return prev.map((unit, i) => {
        return i === index ? { ...unit, ...patch } : unit;
      });
    });
  };

  const setAllConditions = (condition: AssetCondition) => {
    return setUnits((prev) => {
      return prev.map((unit) => {
        return { ...unit, condition };
      });
    });
  };

  const summary = useMemo(() => {
    const counts: Record<AssetCondition, number> = {
      Good: 0,
      Fair: 0,
      Repair: 0,
      Damaged: 0,
    };
    for (const unit of units) {
      counts[unit.condition] += 1;
    }
    return counts;
  }, [units]);

  const duplicateSerials = useMemo(() => {
    const seen = new Map<string, number>();
    for (const unit of units) {
      const key = unit.serial.trim().toLowerCase();
      if (key) {
        seen.set(key, (seen.get(key) ?? 0) + 1);
      }
    }
    return new Set(
      [...seen.entries()]
        .filter(([, n]) => {
          return n > 1;
        })
        .map(([key]) => {
          return key;
        }),
    );
  }, [units]);

  const missingNotes = units.filter((u) => {
    return (
      (u.condition === "Repair" || u.condition === "Damaged") &&
      !u.conditionNote.trim()
    );
  }).length;
  const needAttention = summary.Repair + summary.Damaged;

  const stepValid = (id: number) => {
    if (id === 1) {
      return (
        Boolean(form.name.trim()) &&
        Boolean(form.description.trim()) &&
        (form.ownership === "church" || Boolean(form.ownerName.trim()))
      );
    }
    if (id === 3) {
      return units.length > 0 && duplicateSerials.size === 0;
    }
    return true;
  };

  const isValid = stepValid(1) && stepValid(3);

  const goTo = (id: number) => {
    if (mode === "create" && id > reached) {
      return;
    }
    setStep(id);
  };

  const next = () => {
    if (!stepValid(step)) {
      toast({
        title: "Almost there",
        description:
          step === 1
            ? "Add the asset name and a short description to continue."
            : "Fix the highlighted items to continue.",
        variant: "destructive",
      });
      return;
    }
    const target = Math.min(step + 1, STEPS.length);
    setStep(target);
    setReached((r) => {
      return Math.max(r, target);
    });
  };

  const handleSubmit = async () => {
    if (!isValid) {
      toast({
        title: "Missing information",
        description:
          "Asset name, description, owner name (if borrowed or leased) and valid items are required",
        variant: "destructive",
      });
      return;
    }

    const payload: CreateAssetPayload = {
      name: form.name.trim(),
      tag: form.tag.trim() || undefined,
      category: form.category,
      department: form.department || undefined,
      description: form.description.trim(),
      location: form.location.trim() || undefined,
      // Leave a legacy owner value untouched on edit unless it was changed.
      owner:
        mode === "edit" && !form.ownerTouched
          ? undefined
          : formatOwner(form.ownership, form.ownerName),
      responsibleMode: form.responsibleMode,
      responsibleAdmin:
        form.responsibleMode === "system"
          ? form.assignee || undefined
          : undefined,
      responsibleManualName:
        form.responsibleMode === "manual" ? form.manualName.trim() : undefined,
      responsibleManualEmail:
        form.responsibleMode === "manual" ? form.manualEmail.trim() : undefined,
      units: units.map((unit) => {
        return {
          id: unit.id,
          serial: unit.serial.trim() || undefined,
          condition: unit.condition,
          conditionNote: unit.conditionNote.trim() || undefined,
          purchaseDate: unit.purchaseDate || undefined,
          value:
            unit.value !== "" && !Number.isNaN(Number(unit.value))
              ? Number(unit.value)
              : undefined,
        };
      }),
      risk: form.risk as Asset["risk"],
      status: form.status as Asset["status"],
      maintenanceEnabled: form.maintenanceEnabled,
      frequency: form.maintenanceEnabled ? form.frequency : undefined,
      lastService: form.lastService || undefined,
      lastReview: form.lastReview || undefined,
      remarks: form.remarks.trim() || undefined,
    };

    setSubmitting(true);
    try {
      const saved =
        mode === "edit" && asset
          ? await updateAsset(asset.id, payload)
          : await createAsset(payload);

      onSaved(saved, mode === "edit" ? "edit" : "create");
      onOpenChange(false);
    } catch {
      toast({
        title:
          mode === "edit" ? "Failed to update asset" : "Failed to create asset",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    mode === "create"
      ? "Add New Asset"
      : mode === "edit"
        ? "Edit Asset"
        : "Asset Details";
  const submitLabel = mode === "edit" ? "Save Changes" : "Create Asset";
  const isLast = step === STEPS.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="flex h-[min(80vh,900px)] max-w-[664px] flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-[#fff] p-0 shadow-2xl backdrop-blur-none"
      >
        <div className="flex items-start justify-between px-7 pb-2 pt-6">
          <DialogTitle className="pr-8 text-xl font-bold text-gray-900">
            {title}
          </DialogTitle>

          <button
            type="button"
            onClick={() => {
              return onOpenChange(false);
            }}
            aria-label="Close"
            className="-mr-1 rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        <ol className="flex items-center gap-1.5 px-7 pb-3">
          {STEPS.map((s, i) => {
            const done = s.id < step || (mode !== "create" && s.id !== step);
            const current = s.id === step;
            const locked = mode === "create" && s.id > reached;
            return (
              <li
                key={s.id}
                className="flex min-w-0 flex-1 items-center gap-1.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    return goTo(s.id);
                  }}
                  disabled={locked}
                  className="flex min-w-0 items-center gap-2 disabled:cursor-not-allowed"
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      current
                        ? "bg-primary-400 text-white"
                        : done
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-400",
                    )}
                  >
                    {done && !current ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      s.id
                    )}
                  </span>
                  <span
                    className={cn(
                      "truncate text-xs font-medium",
                      current ? "text-gray-900" : "text-gray-400",
                    )}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <span className="h-px flex-1 bg-gray-200" />
                )}
              </li>
            );
          })}
        </ol>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto px-7 pb-6"
        >
          <div className="space-y-4 pt-3">
            {/* Step 1: what is it */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="asset-name" required>
                      Asset Name
                    </FieldLabel>
                    <Input
                      id="asset-name"
                      disabled={readOnly}
                      value={form.name}
                      onChange={(e) => {
                        return update("name", e.target.value);
                      }}
                      placeholder="e.g. Yamaha Speaker"
                      className={controlClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel htmlFor="asset-tag">Asset Tag ID</FieldLabel>
                    <Input
                      id="asset-tag"
                      disabled={readOnly}
                      value={form.tag}
                      onChange={(e) => {
                        return update("tag", e.target.value);
                      }}
                      placeholder="Auto-generated if empty"
                      className={controlClass}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FieldLabel htmlFor="asset-description" required>
                    Description
                  </FieldLabel>
                  <Textarea
                    id="asset-description"
                    disabled={readOnly}
                    value={form.description}
                    onChange={(e) => {
                      return update("description", e.target.value);
                    }}
                    placeholder="Describe the asset..."
                    rows={3}
                    className={cn(controlClass, "h-auto resize-none py-2")}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <FieldLabel required>Category</FieldLabel>
                    <Select
                      value={form.category}
                      onValueChange={(value) => {
                        return update("category", value);
                      }}
                      disabled={readOnly}
                    >
                      <SelectTrigger className={controlClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_CATEGORIES.map((category) => {
                          return (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Department</FieldLabel>
                    <Select
                      value={form.department}
                      onValueChange={(value) => {
                        if (value === ADD_DEPARTMENT_VALUE) {
                          setAddDepartmentOpen(true);
                          return;
                        }
                        update("department", value);
                      }}
                      disabled={readOnly}
                    >
                      <SelectTrigger
                        className={cn(
                          controlClass,
                          !form.department && "text-muted-foreground",
                        )}
                      >
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((department) => {
                          return (
                            <SelectItem
                              key={department.id}
                              value={department.id}
                            >
                              {department.name}
                            </SelectItem>
                          );
                        })}
                        {departments.length > 0 && <SelectSeparator />}
                        {canCreateDepartment ? (
                          <SelectItem
                            value={ADD_DEPARTMENT_VALUE}
                            className="font-medium text-primary focus:text-primary"
                          >
                            <span className="flex items-center gap-2">
                              <Plus className="h-4 w-4" />
                              Add new department
                            </span>
                          </SelectItem>
                        ) : (
                          <p className="px-2 py-1.5 text-xs text-muted-foreground">
                            Department not listed? Contact your admin to add it.
                          </p>
                        )}
                      </SelectContent>
                    </Select>
                    {canCreateDepartment && (
                      <AddDepartmentDialog
                        open={addDepartmentOpen}
                        onOpenChange={setAddDepartmentOpen}
                        onCreated={(created) => {
                          setDepartments((prev) => {
                            return prev.some((d) => {
                              return d.id === created.id;
                            })
                              ? prev
                              : [
                                  ...prev,
                                  { id: created.id, name: created.name },
                                ];
                          });
                          update("department", created.id);
                        }}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Owner</FieldLabel>
                    <Select
                      value={form.ownership}
                      onValueChange={(value) => {
                        return setForm((prev) => {
                          return {
                            ...prev,
                            ownership: value as Ownership,
                            ownerName: value === "church" ? "" : prev.ownerName,
                            ownerTouched: true,
                          };
                        });
                      }}
                      disabled={readOnly}
                    >
                      <SelectTrigger className={controlClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OWNERSHIP_OPTIONS.map((option) => {
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {form.ownership !== "church" && (
                    <div className="col-start-3 space-y-2">
                      <FieldLabel htmlFor="asset-owner-name" required>
                        {
                          OWNERSHIP_OPTIONS.find((o) => {
                            return o.value === form.ownership;
                          })?.nameLabel
                        }
                      </FieldLabel>
                      <Input
                        id="asset-owner-name"
                        disabled={readOnly}
                        value={form.ownerName}
                        onChange={(e) => {
                          return setForm((prev) => {
                            return {
                              ...prev,
                              ownerName: e.target.value,
                              ownerTouched: true,
                            };
                          });
                        }}
                        placeholder={
                          form.ownership === "borrowed"
                            ? "Who is it borrowed from?"
                            : "Who is it leased from?"
                        }
                        className={controlClass}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 2: who has it and where */}
            {step === 2 && (
              <>
                <Fieldset title="Responsible Person">
                  <div className="mt-3 space-y-3">
                    <div className="space-y-2.5">
                      <RadioGroup
                        value={form.responsibleMode}
                        onValueChange={(value) => {
                          return update(
                            "responsibleMode",
                            value as FormState["responsibleMode"],
                          );
                        }}
                        disabled={readOnly}
                        className="gap-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <RadioGroupItem
                            value="system"
                            id="responsible-system"
                          />
                          <Label
                            htmlFor="responsible-system"
                            className="font-normal text-gray-700"
                          >
                            Assign System User
                          </Label>
                        </div>

                        {form.responsibleMode === "system" && (
                          <Select
                            value={form.assignee}
                            onValueChange={(value) => {
                              return update("assignee", value);
                            }}
                            disabled={readOnly}
                          >
                            <SelectTrigger
                              className={cn(
                                controlClass,
                                "ml-4 w-[calc(100%-1rem)] text-muted-foreground",
                              )}
                            >
                              <SelectValue placeholder="Assignee" />
                            </SelectTrigger>
                            <SelectContent>
                              {admins.map((admin) => {
                                return (
                                  <SelectItem key={admin.id} value={admin.id}>
                                    {admin.fullName}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        )}

                        <div className="flex items-center gap-2.5 pt-0.5">
                          <RadioGroupItem
                            value="manual"
                            id="responsible-manual"
                          />
                          <Label
                            htmlFor="responsible-manual"
                            className="font-normal text-gray-700"
                          >
                            Enter Name Manually
                          </Label>
                        </div>
                      </RadioGroup>

                      {form.responsibleMode === "manual" && (
                        <div className="ml-4 grid grid-cols-2 gap-4">
                          <Input
                            disabled={readOnly}
                            value={form.manualName}
                            onChange={(e) => {
                              return update("manualName", e.target.value);
                            }}
                            placeholder="Enter Name"
                            className={controlClass}
                          />
                          <Input
                            disabled={readOnly}
                            value={form.manualEmail}
                            onChange={(e) => {
                              return update("manualEmail", e.target.value);
                            }}
                            placeholder="Enter Email Address"
                            className={controlClass}
                          />
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5">
                      <p className="text-[13px] leading-relaxed text-blue-800">
                        System users can update records for assets they&apos;re
                        assigned to.
                      </p>
                      <p className="text-[13px] leading-relaxed text-blue-800">
                        Manual names are for accountability only and receive no
                        system access.
                      </p>
                    </div>
                  </div>
                </Fieldset>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <FieldLabel htmlFor="asset-location">Location</FieldLabel>
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:text-gray-600"
                              aria-label="About asset location"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-[260px] text-xs leading-relaxed"
                          >
                            Where this asset is kept or used, for example
                            &quot;Main Auditorium&quot;, &quot;Store Room
                            B&quot; or &quot;Pastor&apos;s Office&quot;. Be
                            specific so anyone can find it during a check. Type
                            any place, or pick one of your saved locations.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {/* Free text, with the church's saved locations offered as suggestions. */}
                    <Input
                      id="asset-location"
                      list="asset-location-suggestions"
                      value={form.location}
                      onChange={(e) => {
                        return update("location", e.target.value);
                      }}
                      placeholder="e.g. Main Auditorium"
                      maxLength={120}
                      autoComplete="off"
                      disabled={readOnly}
                      className={controlClass}
                    />
                    <datalist id="asset-location-suggestions">
                      {locations.map((location) => {
                        return (
                          <option key={location.id} value={location.name} />
                        );
                      })}
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Status</FieldLabel>
                    <Select
                      value={form.status}
                      onValueChange={(value) => {
                        return update("status", value);
                      }}
                      disabled={readOnly}
                    >
                      <SelectTrigger className={controlClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_STATUSES.map((status) => {
                          return (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <FieldLabel required>Missing Risk</FieldLabel>
                  <Select
                    value={form.risk}
                    onValueChange={(value) => {
                      return update("risk", value);
                    }}
                    disabled={readOnly}
                  >
                    <SelectTrigger className={controlClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSET_RISKS.map((risk) => {
                        return (
                          <SelectItem key={risk} value={risk}>
                            {risk}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Step 3: each item */}
            {step === 3 && (
              <>
                <Fieldset title="How many items?">
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={readOnly || units.length <= 1}
                        onClick={() => {
                          return setCount(units.length - 1);
                        }}
                        aria-label="Fewer items"
                        className="h-9 w-9 rounded-lg"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        max={MAX_UNITS}
                        disabled={readOnly}
                        value={units.length}
                        onChange={(e) => {
                          return setCount(Number(e.target.value));
                        }}
                        aria-label="Number of items"
                        className={cn(controlClass, "w-20 text-center")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={readOnly || units.length >= MAX_UNITS}
                        onClick={() => {
                          return setCount(units.length + 1);
                        }}
                        aria-label="More items"
                        className="h-9 w-9 rounded-lg"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Each item gets its own condition and details below.
                    </p>
                  </div>

                  {!readOnly && units.length > 1 && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                      <p className="mb-2 text-xs font-medium text-gray-600">
                        Set every item to:
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                        {CONDITION_OPTIONS.map((option) => {
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                return setAllConditions(option.value);
                              }}
                              className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                            >
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  option.dot,
                                )}
                              />
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Fieldset>

                <div className="space-y-3">
                  {units.map((unit, index) => {
                    return (
                      <UnitCard
                        key={unit.id ?? index}
                        index={index}
                        unit={unit}
                        readOnly={readOnly}
                        duplicateSerial={
                          Boolean(unit.serial.trim()) &&
                          duplicateSerials.has(unit.serial.trim().toLowerCase())
                        }
                        onChange={(patch) => {
                          return patchUnit(index, patch);
                        }}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {/* Step 4: review */}
            {step === 4 && (
              <>
                <Fieldset title="Summary">
                  <p className="mt-2 text-sm text-gray-700">
                    <span className="font-semibold">
                      {units.length} {units.length === 1 ? "item" : "items"}
                    </span>{" "}
                    of {form.name.trim() || "this asset"}
                    {form.category ? ` (${form.category})` : ""}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {CONDITION_OPTIONS.map((option) => {
                      return summary[option.value] ? (
                        <span
                          key={option.value}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                            option.active,
                          )}
                        >
                          <span
                            className={cn("h-2 w-2 rounded-full", option.dot)}
                          />
                          {summary[option.value]} {option.label}
                        </span>
                      ) : null;
                    })}
                  </div>

                  {needAttention > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {units.map((unit, index) => {
                        return unit.condition === "Repair" ||
                          unit.condition === "Damaged" ? (
                          <li
                            key={unit.id ?? index}
                            className="flex items-start gap-2 text-xs text-gray-700"
                          >
                            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
                            <span>
                              <span className="font-semibold">
                                {unit.serial.trim() || `Item ${index + 1}`}
                              </span>
                              : {conditionLabel(unit.condition)}
                              {unit.conditionNote.trim()
                                ? ` - ${unit.conditionNote.trim()}`
                                : ""}
                            </span>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  )}

                  {missingNotes > 0 && (
                    <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-800">
                      {missingNotes}{" "}
                      {missingNotes === 1 ? "item needs" : "items need"} repair
                      or {missingNotes === 1 ? "is" : "are"} damaged without a
                      note.{" "}
                      <button
                        type="button"
                        onClick={() => {
                          return setStep(3);
                        }}
                        className="font-semibold underline"
                      >
                        Add notes
                      </button>
                    </div>
                  )}
                </Fieldset>

                <Fieldset
                  title="Scheduled Maintenance"
                  action={
                    <Switch
                      checked={form.maintenanceEnabled}
                      onCheckedChange={(checked) => {
                        return update("maintenanceEnabled", checked);
                      }}
                      disabled={readOnly}
                    />
                  }
                >
                  {form.maintenanceEnabled && (
                    <div className="mt-3 space-y-4">
                      <div className="space-y-2">
                        <FieldLabel htmlFor="maintenance-frequency">
                          Maintenance Frequency
                        </FieldLabel>
                        <Select
                          value={form.frequency}
                          onValueChange={(value) => {
                            return update("frequency", value);
                          }}
                          disabled={readOnly}
                        >
                          <SelectTrigger className={controlClass}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MAINTENANCE_FREQUENCIES.map((frequency) => {
                              return (
                                <SelectItem key={frequency} value={frequency}>
                                  {frequency}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <FieldLabel htmlFor="last-service">
                            Last Service Date
                          </FieldLabel>
                          <DatePicker
                            id="last-service"
                            disabled={readOnly}
                            value={form.lastService}
                            onChange={(value) => {
                              return update("lastService", value);
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <FieldLabel htmlFor="last-review">
                            Last Review Date
                          </FieldLabel>
                          <DatePicker
                            id="last-review"
                            disabled={readOnly}
                            value={form.lastReview}
                            onChange={(value) => {
                              return update("lastReview", value);
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <FieldLabel htmlFor="next-due">
                          Next Due Date
                        </FieldLabel>
                        <Input
                          id="next-due"
                          disabled
                          readOnly
                          placeholder="Auto-calculated after saving"
                          className={cn(
                            controlClass,
                            "bg-gray-50 text-muted-foreground",
                          )}
                        />
                      </div>
                    </div>
                  )}
                </Fieldset>

                <Fieldset title="Supporting Information">
                  <div className="mt-3 space-y-2">
                    <FieldLabel htmlFor="asset-remarks">Remarks</FieldLabel>
                    <Textarea
                      id="asset-remarks"
                      disabled={readOnly}
                      value={form.remarks}
                      onChange={(e) => {
                        return update("remarks", e.target.value);
                      }}
                      placeholder="Add any notes, observations, or context about this asset..."
                      rows={4}
                      className={cn(controlClass, "h-auto resize-none py-2")}
                    />
                  </div>
                </Fieldset>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-7 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-gray-300 px-5 text-sm font-medium"
            onClick={() => {
              return step === 1 ? onOpenChange(false) : setStep(step - 1);
            }}
          >
            {step === 1 ? (mode === "view" ? "Close" : "Cancel") : "Back"}
          </Button>

          {isLast ? (
            mode !== "view" && (
              <Button
                type="button"
                disabled={!isValid || submitting}
                onClick={handleSubmit}
                className="h-10 rounded-lg bg-primary px-5 text-sm font-medium text-white-600 hover:bg-primary-600"
              >
                {submitting ? "Saving..." : submitLabel}
              </Button>
            )
          ) : (
            <Button
              type="button"
              onClick={next}
              className="h-10 rounded-lg bg-primary px-5 text-sm font-medium text-white-600 hover:bg-primary-600"
            >
              Next
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
