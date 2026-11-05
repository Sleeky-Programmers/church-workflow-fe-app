"use client";

import {
  AlertCircle,
  CheckCircle,
  Download,
  PauseCircle,
  PlayCircle,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getAccessToken } from "@/lib/auth/session";
import {
  CSV_STATUS_VALUES,
  GENDER_MAP,
  MARITAL_MAP,
  MEMBERSHIP_MAP,
  TITLE_MAP,
} from "@/lib/constant";
import { MembershipStatus } from "@/lib/enums";
import {
  previewMembersCsv,
  uploadMembersCsv,
} from "@/services/memberService";
import {
  CsvImportReport,
  CsvImportRowError,
  CsvUploadModalProps,
  UploadFile,
} from "@/types";
import { FileInputProps } from "@/types/index";
import { csvMemberRowSchema } from "@/types/schema";

// Human-readable labels for each field, keyed by the internal snake_case
// name used for header matching. Used for the downloadable template and
// for validation error messages shown to the user - the underlying
// snake_case keys and the camelCase payload sent to the backend
// (see `convertToCSV`) are unaffected.
const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  full_name: "Full Name",
  gender: "Gender",
  birthday: "Birthday",
  marital_status: "Marital Status",
  date_of_marriage: "Date of Marriage",
  spouse_first_name: "Spouse First Name",
  spouse_last_name: "Spouse Last Name",
  phone_number: "Phone Number",
  email: "Email",
  occupation: "Occupation",
  educational_background: "Educational Background",
  status: "Status",
  date_joined: "Date Joined",
  previous_church_membership: "Previous Church Membership",
  is_baptized: "Is Baptized",
  ministries: "Ministries",
  volunteer_preferences: "Volunteer Preferences",
  cell_group_name: "Cell Group Name",
};

const CSV_TEMPLATE_COLUMNS = Object.keys(FIELD_LABELS);

const normalizeHeaderKey = (key: string) =>
  key.toLowerCase().replace(/[\s_]/g, "");

/** Case/space-insensitive lookup; `aliases` covers older templates ("Membership Status"). */
const getCsvValue = (row: any, field: string, aliases: string[] = []) => {
  for (const name of [field, ...aliases]) {
    const key = Object.keys(row).find(
      (k) => normalizeHeaderKey(k) === normalizeHeaderKey(name),
    );
    if (key !== undefined) return row[key];
  }
  return undefined;
};

const STATUS_ALIASES = ["membership_status"];

const STATUS_HELP = `Allowed values: ${CSV_STATUS_VALUES.join(", ")}`;

/** Maps a sheet value to a status, or null if blank/unknown. Never guesses. */
const parseStatus = (value: unknown): MembershipStatus | null => {
  const raw = value?.toString().trim().toLowerCase();
  if (!raw) return null;
  return MEMBERSHIP_MAP[raw] ?? MEMBERSHIP_MAP[raw.replace(/_/g, " ")] ?? null;
};

const formatRoom = (room: number | null) =>
  room === null ? "unlimited" : room.toLocaleString();

type PendingImport = {
  file: File;
  normalizedFile: File;
  report: CsvImportReport;
};

// Android's native file pickers (Google Files, Samsung My Files, Downloads
// app, etc.) filter by the MIME type the OS indexed for a file, not by the
// ".csv" extension itself - and CSVs downloaded on Android are inconsistently
// tagged across devices/apps (rarely the canonical "text/csv"). Listing only
// ".csv" greys the file out or hides it entirely on many Android pickers,
// even though the same file selects fine on iOS/desktop. Widening this to
// every MIME type Android commonly (mis)assigns to CSVs fixes that - content
// is still fully validated after selection (see validateCsvData below), so
// a broader filter can't let anything genuinely invalid through unnoticed.
const CSV_ACCEPT =
  ".csv,text/csv,text/comma-separated-values,text/x-csv,text/x-comma-separated-values,application/vnd.ms-excel,application/csv,application/x-csv,text/plain,application/octet-stream";

export function CsvUploadModal({
  open,
  onOpenChange,
  onSuccess,
  onClose,
}: CsvUploadModalProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const token = getAccessToken() ?? undefined;

  const handleRemoveFile = (file: UploadFile) => {
    file.controller?.abort();
    setFiles((prev) => prev.filter((f) => f.file !== file.file));
  };

  const handlePauseResume = (file: UploadFile) => {
    if (file.status === "uploading") {
      file.controller?.abort();
      setFiles((prev) =>
        prev.map((f) =>
          f.file === file.file ? { ...f, status: "paused" } : f,
        ),
      );
    } else if (file.status === "paused") {
      handleUpload(file.file);
      setFiles((prev) =>
        prev.map((f) =>
          f.file === file.file ? { ...f, status: "uploading" } : f,
        ),
      );
    }
  };

  const normalizeRow = (row: any) => {
    // Helper to get value case-insensitively
    const getValue = (field: string) => {
      const key = Object.keys(row).find(
        (k) =>
          k.toLowerCase().replace(/[\s_]/g, "") ===
          field.toLowerCase().replace(/[\s_]/g, ""),
      );
      return key ? row[key] : undefined;
    };

    // Get values from CSV (snake_case)
    const title = getValue("title");
    const fullName = getValue("full_name");
    const gender = getValue("gender");
    const phoneNumber = getValue("phone_number");
    const email = getValue("email");
    const birthday = getValue("birthday");
    const maritalStatus = getValue("marital_status");
    const dateOfMarriage = getValue("date_of_marriage");
    const spouseFirstName = getValue("spouse_first_name");
    const spouseLastName = getValue("spouse_last_name");
    const occupation = getValue("occupation");
    const educationalBackground = getValue("educational_background");
    const membershipStatus = getCsvValue(row, "status", STATUS_ALIASES);
    const dateJoined = getValue("date_joined");
    const previousChurchMembership = getValue("previous_church_membership");
    const isBaptized = getValue("is_baptized");
    const ministries = getValue("ministries");
    const volunteerPreferences = getValue("volunteer_preferences");
    const cellGroupName = getValue("cell_group_name");

    // Return object with camelCase keys that backend expects.
    // Title accepts free text now (see CreateMemberDto) - a cell that
    // doesn't match a known abbreviation is passed through as-is instead of
    // silently defaulting to "Mr.".
    const rawTitle = title?.toString().trim();
    return {
      title: (rawTitle && TITLE_MAP[rawTitle.toLowerCase()]) || rawTitle || "",
      fullName: fullName?.toString().trim() || "",
      gender: GENDER_MAP[gender?.toString().toLowerCase()] || null,
      phoneNumber: phoneNumber?.toString().trim() || "",
      email: email?.toString().trim() || null,
      birthday:
        birthday && typeof birthday === "string" && birthday.trim()
          ? new Date(birthday).toISOString().split("T")[0]
          : null,
      maritalStatus:
        MARITAL_MAP[maritalStatus?.toString().toLowerCase()] || null,
      dateOfMarriage:
        dateOfMarriage &&
        typeof dateOfMarriage === "string" &&
        dateOfMarriage.trim()
          ? new Date(dateOfMarriage).toISOString().split("T")[0]
          : null,
      spouseFirstName: spouseFirstName?.toString().trim() || null,
      spouseLastName: spouseLastName?.toString().trim() || null,
      occupation: occupation?.toString().trim() || null,
      educationalBackground: educationalBackground?.toString().trim() || null,
      // Never defaulted: a blank/invalid status is reported as a row error.
      membershipStatus:
        parseStatus(membershipStatus) ?? membershipStatus?.toString().trim() ?? "",
      dateJoined:
        dateJoined && typeof dateJoined === "string" && dateJoined.trim()
          ? new Date(dateJoined).toISOString().split("T")[0]
          : null,
      previousChurchMembership:
        previousChurchMembership?.toString().trim() || null,
      isBaptized: ["true", "1", "yes"].includes(
        String(isBaptized)?.toLowerCase(),
      ),
      ministries: ministries?.toString().trim() || null,
      volunteerPreferences: volunteerPreferences?.toString().trim() || null,
      cellGroupName: cellGroupName?.toString().trim() || null,
    };
  };

  const validateCsvData = (
    data: any[],
  ): { isValid: boolean; errors: string[]; rowErrors: CsvImportRowError[] } => {
    const errors: string[] = [];
    const rowErrors: CsvImportRowError[] = [];

    if (data.length === 0) {
      errors.push("CSV file is empty");
      return { isValid: false, errors, rowErrors };
    }

    // Get actual headers from the first row
    const headers = Object.keys(data[0] || {});

    // Check if required headers exist
    const requiredHeaders: [string, string[]][] = [
      ["full_name", []],
      ["phone_number", []],
      ["status", STATUS_ALIASES],
    ];
    const missingHeaders = requiredHeaders
      .filter(
        ([req, aliases]) =>
          ![req, ...aliases].some((name) =>
            headers.some(
              (h) => normalizeHeaderKey(h) === normalizeHeaderKey(name),
            ),
          ),
      )
      .map(([req]) => req);

    if (missingHeaders.length > 0) {
      errors.push(
        `Missing required columns: ${missingHeaders.map((h) => FIELD_LABELS[h] || h).join(", ")}. Download the latest template, which has a Status column.`,
      );
      return { isValid: false, errors, rowErrors };
    }

    let hasEncounteredEmptyRow = false;
    let validRowCount = 0;

    for (let index = 0; index < data.length; index++) {
      const row = data[index];

      // Check if row is completely empty
      const isEmptyRow =
        !row ||
        Object.keys(row).length === 0 ||
        Object.values(row).every(
          (value) =>
            !value || (typeof value === "string" && value.trim() === ""),
        );

      // If we encounter an empty row, stop processing further rows
      if (isEmptyRow) {
        hasEncounteredEmptyRow = true;
        break; // Stop processing when we hit an empty row
      }

      // Get values using case-insensitive key matching
      const getValue = (field: string) => {
        const key = Object.keys(row).find(
          (k) =>
            k.toLowerCase().replace(/[\s_]/g, "") ===
            field.toLowerCase().replace(/[\s_]/g, ""),
        );
        return key ? row[key] : undefined;
      };

      const fullName = getValue("full_name");
      const phoneNumber = getValue("phone_number");
      const email = getValue("email");
      const birthday = getValue("birthday");

      const hasFullName =
        fullName && typeof fullName === "string" && fullName.trim() !== "";
      const hasPhoneNumber =
        phoneNumber &&
        typeof phoneNumber === "string" &&
        phoneNumber.trim() !== "";

      const result = csvMemberRowSchema.safeParse({
        full_name: typeof fullName === "string" ? fullName : undefined,
        phone_number: typeof phoneNumber === "string" ? phoneNumber : undefined,
        email: typeof email === "string" ? email : undefined,
        birthday: typeof birthday === "string" ? birthday : undefined,
      });

      if (!result.success) {
        result.error.issues.forEach((issue) => {
          errors.push(`Row ${index + 2}: ${issue.message}`);
          rowErrors.push({ row: index + 2, reason: issue.message });
        });
      }

      const rawStatus = getCsvValue(row, "status", STATUS_ALIASES);
      if (!rawStatus?.toString().trim()) {
        rowErrors.push({
          row: index + 2,
          column: "Status",
          reason: `Status is required. ${STATUS_HELP}`,
        });
      } else if (!parseStatus(rawStatus)) {
        rowErrors.push({
          row: index + 2,
          column: "Status",
          reason: `Invalid status "${rawStatus}". ${STATUS_HELP}`,
        });
      }

      if (hasFullName || hasPhoneNumber) {
        validRowCount++;
      }
    }

    if (validRowCount === 0 && !hasEncounteredEmptyRow) {
      errors.push("No valid data rows found in the CSV file");
    }
    return {
      isValid: errors.length === 0 && rowErrors.length === 0,
      errors,
      rowErrors,
    };
  };

  // Helper function to convert normalized data to CSV
  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return "";

    // Fixed camelCase headers the backend expects. This list is always
    // used here regardless of how the uploaded file's own headers were
    // labeled (human-readable, snake_case, etc.) - normalizeRow() already
    // mapped every row to these exact keys before we get here.
    const headers = [
      "title",
      "fullName",
      "gender",
      "phoneNumber",
      "email",
      "birthday",
      "maritalStatus",
      "dateOfMarriage",
      "spouseFirstName",
      "spouseLastName",
      "occupation",
      "educationalBackground",
      "membershipStatus",
      "dateJoined",
      "previousChurchMembership",
      "isBaptized",
      "ministries",
      "volunteerPreferences",
      "cellGroupName",
    ];

    // Create header row
    const csvRows = [headers.join(",")];

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        let value = row[header];

        // Handle null/undefined values
        if (value === null || value === undefined) {
          return "";
        }

        // Convert booleans to string
        if (typeof value === "boolean") {
          return value ? "TRUE" : "FALSE";
        }

        // Convert to string and escape quotes and commas
        const stringValue = String(value);
        if (
          stringValue.includes(",") ||
          stringValue.includes('"') ||
          stringValue.includes("\n")
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  };

  const [pending, setPending] = useState<PendingImport | null>(null);
  const [localErrors, setLocalErrors] = useState<CsvImportRowError[]>([]);
  const [importing, setImporting] = useState(false);

  const setFileState = (file: File, patch: Partial<UploadFile>) =>
    setFiles((prev) =>
      prev.map((f) => (f.file === file ? { ...f, ...patch } : f)),
    );

  /**
   * Step 1: read and check the file locally, then ask the server for the
   * import summary (counts, room left, rejected rows). Nothing is imported.
   */
  const handleUpload = async (file: File) => {
    const controller = new AbortController();
    setPending(null);
    setLocalErrors([]);
    setFiles([{ file, progress: 10, status: "uploading", controller }]);

    try {
      const parsed = await new Promise<any[]>((resolve, reject) =>
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) =>
            header.trim().toLowerCase().replace(/\s/g, "_"),
          complete: (results) => resolve(results.data as any[]),
          error: (err) => reject(err),
        }),
      );

      // Only keep rows before the first empty row
      const firstEmpty = parsed.findIndex(
        (row) =>
          !row ||
          Object.keys(row).length === 0 ||
          Object.values(row).every(
            (value) =>
              !value || (typeof value === "string" && value.trim() === ""),
          ),
      );
      const cleanedData =
        firstEmpty === -1 ? parsed : parsed.slice(0, firstEmpty);

      if (cleanedData.length === 0) {
        throw new Error("CSV file contains no valid data rows");
      }

      const { errors, rowErrors } = validateCsvData(cleanedData);
      if (errors.length && !rowErrors.length) {
        // File-level problem (missing columns, empty file).
        throw new Error(errors.join("\n"));
      }
      if (rowErrors.length) {
        setLocalErrors(rowErrors);
        setFileState(file, {
          status: "error",
          progress: 100,
          error: `${rowErrors.length} row error(s) found`,
          errorDetails: "Fix the rows listed below and upload the file again.",
          controller: undefined,
        });
        return;
      }

      const normalizedCSV = convertToCSV(cleanedData.map(normalizeRow));
      const normalizedFile = new File([normalizedCSV], file.name, {
        type: "text/csv",
      });

      setFileState(file, { progress: 60 });
      const report = await previewMembersCsv(normalizedFile);

      setPending({ file, normalizedFile, report });
      setFileState(file, {
        status: report.canImport ? "success" : "error",
        progress: 100,
        controller: undefined,
        error: report.canImport
          ? undefined
          : report.totalErrors
            ? `${report.totalErrors} row error(s) found`
            : "Over your plan limit",
        errorDetails: undefined,
      });
    } catch (err: any) {
      const report = err?.response?.data as CsvImportReport | undefined;
      if (report && Array.isArray(report.errors)) {
        setPending({ file, normalizedFile: file, report });
      }
      const message =
        err?.name === "AbortError"
          ? "Upload cancelled"
          : err?.message?.includes("Failed to fetch")
            ? "Unable to connect to the server. Please check your internet connection."
            : err?.message || "An unexpected error occurred";

      setFileState(file, {
        status: "error",
        progress: 100,
        error: "Could not read this file",
        errorDetails: message,
        controller: undefined,
      });
    }
  };

  /** Step 2: import, only after the church has seen the summary. */
  const handleConfirmImport = async () => {
    if (!pending?.report.canImport) return;
    const { file, normalizedFile } = pending;
    const controller = new AbortController();
    setImporting(true);
    setFileState(file, { status: "uploading", progress: 0, controller });

    try {
      const result = await uploadMembersCsv(normalizedFile, {
        token,
        signal: controller.signal,
        onProgress: (progress) => setFileState(file, { progress }),
      });

      setFileState(file, {
        status: "success",
        progress: 100,
        controller: undefined,
      });
      const insertedCount = result?.inserted ?? pending.report.validRows;
      const parts = [
        result?.addMembers ? `${result.addMembers} members` : null,
        result?.addGuests ? `${result.addGuests} guests` : null,
      ].filter(Boolean);

      toast({
        title: "Import complete",
        description: parts.length
          ? `Imported ${parts.join(" and ")}.`
          : `${insertedCount} people imported.`,
      });
      onSuccess(insertedCount);
      setTimeout(() => handleClose(), 1500);
    } catch (err: any) {
      // A rejected import returns the same report shape as the preview.
      const body = err && typeof err === "object" ? err : {};
      if (Array.isArray(body.errors) && body.overBy) {
        setPending({ ...pending, report: { ...body, canImport: false } });
      }
      const message = body.message || err?.message || "Import failed";
      setFileState(file, {
        status: "error",
        error: "Nothing was imported",
        errorDetails: message,
        controller: undefined,
      });
      toast({
        title: "Nothing was imported",
        description: message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setPending(null);
    setLocalErrors([]);
    onClose?.();
    onOpenChange(false);
  };

  const report = pending?.report;
  const reportErrors = localErrors.length ? localErrors : report?.errors ?? [];
  const isBusy = importing || files.some((f) => f.status === "uploading");

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          // When dialog is closed via backdrop or escape key
          handleClose();
        } else {
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent
        showClose={false}
        mobileSheet
        className="w-full sm:max-w-3xl max-h-[85vh] overflow-hidden p-4 sm:p-6 flex flex-col"
      >
        <DialogDescription className="sr-only">
          Upload church members via CSV file.
        </DialogDescription>

        <Heading level={2} variant="primary" className="sm:text-2xl">
          Upload Church Members
        </Heading>
        <Text className="mt-1 text-sm text-gray-600">
          Upload your members in bulk using a CSV
        </Text>

        <div className="flex-1 min-h-0 overflow-y-auto mt-4">
          <FileInput
            accept={CSV_ACCEPT}
            multiple={false}
            files={files}
            onUpload={handleUpload}
            onRemove={(file) => {
              handleRemoveFile(file);
              setPending(null);
              setLocalErrors([]);
            }}
            onPauseResume={handlePauseResume}
          />

          {report && (
            <ImportSummary report={report} />
          )}

          {reportErrors.length > 0 && (
            <RowErrorTable errors={reportErrors} />
          )}
        </div>

        <div className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isBusy}
            className="w-full sm:flex-1 h-11 rounded-lg text-sm font-semibold"
          >
            {files.some((f) => f.status === "success") && !report?.canImport
              ? "Done"
              : "Cancel"}
          </Button>
          {report && (
            <Button
              onClick={handleConfirmImport}
              disabled={!report.canImport || isBusy}
              className="w-full sm:flex-1 h-11 rounded-lg text-sm font-semibold"
            >
              {importing
                ? "Importing…"
                : `Import ${report.validRows.toLocaleString()} ${report.validRows === 1 ? "person" : "people"}`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImportSummary({ report }: { report: CsvImportReport }) {
  const over: string[] = [];
  if (report.overBy.members > 0) {
    over.push(
      `${report.overBy.members.toLocaleString()} ${report.overBy.members === 1 ? "row" : "rows"} over the member limit`,
    );
  }
  if (report.overBy.guests > 0) {
    over.push(
      `${report.overBy.guests.toLocaleString()} ${report.overBy.guests === 1 ? "row" : "rows"} over the guest limit`,
    );
  }

  return (
    <div className="mt-5 space-y-3">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <Text className="font-semibold text-gray-900">Before you import</Text>
        <Text className="mt-1 text-sm text-gray-700">
          This file adds {report.addMembers.toLocaleString()}{" "}
          {report.addMembers === 1 ? "member" : "members"} and{" "}
          {report.addGuests.toLocaleString()}{" "}
          {report.addGuests === 1 ? "guest" : "guests"}. You have room for{" "}
          {formatRoom(report.room.members)} members and{" "}
          {formatRoom(report.room.guests)} guests.
        </Text>
        {report.totalErrors > 0 && (
          <Text className="mt-1 text-sm text-red-600">
            {report.totalErrors} row error(s) must be fixed first. Nothing is
            imported until every row is valid.
          </Text>
        )}
      </div>

      {over.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Import blocked: this file has {over.join(" and ")}. Remove rows or{" "}
            <Link
              href="/dashboard/settings/billing"
              className="font-semibold underline"
            >
              upgrade your plan
            </Link>
            . Nothing has been imported.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function RowErrorTable({ errors }: { errors: CsvImportRowError[] }) {
  return (
    <div className="mt-4">
      <Text className="font-semibold text-gray-900">
        Import report: {errors.length} rejected{" "}
        {errors.length === 1 ? "entry" : "entries"}
      </Text>
      <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 font-medium">Row</th>
              <th className="px-3 py-2 font-medium">Column</th>
              <th className="px-3 py-2 font-medium">Problem</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((e, i) => (
              <tr key={`${e.row}-${i}`} className="border-t border-gray-100">
                <td className="px-3 py-2 align-top text-gray-900">{e.row}</td>
                <td className="px-3 py-2 align-top text-gray-700">
                  {e.column ?? "—"}
                </td>
                <td className="px-3 py-2 align-top text-gray-700">
                  {e.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FileInput({
  accept,
  multiple,
  files,
  onUpload,
  onRemove,
  onPauseResume,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) {
      return;
    }
    Array.from(selectedFiles).forEach((file) => onUpload(file));
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files) {
      return;
    }
    Array.from(e.dataTransfer.files).forEach((file) => onUpload(file));
  };

  const handleCancel = (file: UploadFile) => {
    file.controller?.abort();
    onRemove(file);
  };

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: UploadFile["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "paused":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const csvContent = `${CSV_TEMPLATE_COLUMNS.map((key) => FIELD_LABELS[key]).join(",")}
MR.,Anthony Carter,MALE,1/12/1991,SINGLE,,,,14155667788,anthony.carter@example.com,Developer,Bachelor,Member,7/15/2022,,TRUE,Music,Outreach,Iota Group
MRS.,Rebecca Allen,FEMALE,4/25/1984,MARRIED,5/10/2009,,,14156778899,rebecca.allen@example.com,Teacher,Master,Visitor,2/18/2021,Grace Church,FALSE,,,`;

  return (
    <div className="space-y-5">
      {/* Template Download Section - per the design: "Use this template" */}
      <div>
        <Text className="font-semibold text-gray-900">Use this template</Text>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            const blob = new Blob([csvContent], {
              type: "text/csv;charset=utf-8;",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "sample-members.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
          className="w-full mt-2 h-10 rounded-lg border-gray-200 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Sample CSV
        </Button>

        <div className="mt-3 rounded-lg bg-blue-50/60 p-3 text-xs text-gray-700 space-y-1">
          <Text className="text-xs font-semibold text-gray-900">
            How to fill it in
          </Text>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>
              Required columns: <b>Full Name</b>, <b>Phone Number</b>,{" "}
              <b>Gender</b> (Male or Female) and <b>Status</b>.
            </li>
            <li>
              Status must be one of: {CSV_STATUS_VALUES.join(", ")}. Rows with
              a blank or unknown status are rejected, never guessed.
            </li>
            <li>
              Visitors count towards your guest limit. Everyone else counts
              towards your member limit.
            </li>
            <li>
              Visitors can&apos;t have a Cell Group Name. Leave it blank for
              them.
            </li>
            <li>Dates use month/day/year, for example 7/15/2022.</li>
            <li>
              You&apos;ll see a summary before anything is imported. If any
              row is rejected, or the file goes over a limit, nothing is
              imported.
            </li>
          </ul>
        </div>
      </div>

      {/* Upload Area - per the design: "Upload file" dashed dropzone */}
      <div>
        <Text className="mb-2 font-semibold text-gray-900">Upload file</Text>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border border-dashed border-gray-300 rounded-lg py-7 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all duration-200"
        >
          <Text className="text-sm text-gray-500">
            Click to upload file (Supported formats: .csv)
          </Text>

          <Input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Uploaded Files List - per the design: "Uploaded files" progress rows */}
      {files.length > 0 && (
        <div>
          <Text className="font-semibold text-gray-900">Uploaded files</Text>

          <div className="mt-2 space-y-4 max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Span className="font-semibold text-gray-900 truncate">
                    {file.file.name}
                  </Span>
                  <Span className="font-semibold text-gray-900 shrink-0">
                    {Math.round(file.progress)}%
                  </Span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        getStatusColor(file.status),
                      )}
                      style={{ width: `${Math.max(file.progress, 4)}%` }}
                    />
                  </div>

                  {(file.status === "uploading" ||
                    file.status === "paused") && (
                    <button
                      onClick={() => onPauseResume(file)}
                      className="text-gray-700 hover:text-gray-900 shrink-0"
                      aria-label={
                        file.status === "paused" ? "Resume" : "Pause"
                      }
                    >
                      {file.status === "paused" ? (
                        <PlayCircle className="w-5 h-5" />
                      ) : (
                        <PauseCircle className="w-5 h-5" />
                      )}
                    </button>
                  )}

                  {file.status !== "success" && (
                    <button
                      onClick={() => handleCancel(file)}
                      className="text-gray-700 hover:text-red-500 shrink-0"
                      aria-label="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {file.status === "uploading" && (
                  <Text className="text-xs text-gray-500">Working…</Text>
                )}
                {file.status === "paused" && (
                  <Text className="text-xs text-gray-500">Paused</Text>
                )}
                {file.status === "error" && (
                  <div>
                    <Text className="text-xs text-red-500 font-medium">
                      Needs attention
                    </Text>
                    {file.error && (
                      <Text className="text-xs text-gray-500 mt-0.5">
                        {file.error}
                        {"errorDetails" in file && file.errorDetails
                          ? ` - ${file.errorDetails}`
                          : ""}
                      </Text>
                    )}
                  </div>
                )}
                {file.status === "success" && (
                  <Text className="text-xs text-primary-400 font-medium">
                    File checked
                  </Text>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
