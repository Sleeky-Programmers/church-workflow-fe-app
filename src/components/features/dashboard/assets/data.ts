export type AssetCondition = "Good" | "Fair" | "Repair" | "Damaged";
export type AssetRisk = "High" | "Medium" | "Low";
export type AssetStatus = "Active" | "Inactive" | "Disposed";

/** Detail page tabs, in the order they appear in the design. */
export const ASSET_TABS = [
  "overview",
  "maintenance",
  "history",
  "images",
] as const;
export type AssetTab = (typeof ASSET_TABS)[number];

export const ASSET_TAB_LABELS: Record<AssetTab, string> = {
  overview: "Overview",
  maintenance: "Maintenance",
  history: "History",
  images: "Images",
};

export interface ResponsiblePerson {
  /** Admin id, present only when isSystem is true - used to re-select them in the edit form. */
  id?: string | null;
  name: string;
  email: string;
  initials: string;
  /** System users can edit the record, manual names are accountability only. */
  isSystem: boolean;
}

export interface ConditionBreakdown {
  good: number;
  fair: number;
  repair: number;
  damaged: number;
}

/** One physical item within an asset, with its own condition and details. */
export interface AssetUnit {
  /** Present for saved items; absent for ones added in the form. */
  id?: string;
  serial: string;
  condition: AssetCondition;
  conditionNote: string;
  /** Yyyy-MM-dd, or empty. */
  purchaseDate: string;
  value: number | null;
  addedAt?: string;
}

export type DueState = "Upcoming" | "Due" | "Overdue";

export interface MaintenanceSchedule {
  frequency: string | null;
  lastService: string;
  lastReview: string;
  nextDue: string;
  dueState: DueState;
  notificationsEnabled: boolean;
  notifyUpcoming: boolean;
  notifyDue: boolean;
  notifyOverdue: boolean;
  notifyDaysBefore: number;
  recipients: string[];
}

export const MAINTENANCE_TYPES = [
  "Routine Service",
  "Repair",
  "Inspection",
  "Replacement",
  "Other",
];

export interface ServiceAttachment {
  id: string;
  name: string;
}

export interface ServiceRecord {
  id: string;
  /** Short reference shown in the record drawer, e.g. "SR-0042". */
  recordId: string;
  date: string;
  /** Time of day the record was logged, e.g. "10:42 AM". */
  timeLogged: string;
  performedBy: string;
  performedByEmail: string;
  maintenanceType: string;
  notes: string;
  nextServiceDate: string;
  /** Review date surfaced in the record drawer, independent of the next service date. */
  nextReviewDate: string;
  /** Condition breakdown captured at the moment this service was logged. */
  conditionAtService: ConditionBreakdown;
  attachments: ServiceAttachment[];
}

export type HistoryTone = "green" | "amber" | "purple" | "blue";

export interface HistoryEvent {
  id: string;
  timestamp: string;
  tone: HistoryTone;
  actor: string;
  action: string;
}

export interface AssetImage {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedBy: string;
  uploadedDate: string;
}

/** Detail-only fields carried by every asset so any row opens a full detail page. */
export interface AssetDetailFields {
  description: string;
  location: string;
  owner: string;
  dateAdded: string;
  remarks: string;
  responsible: ResponsiblePerson;
  conditions: ConditionBreakdown;
  /** Each physical item with its own condition and details. */
  units: AssetUnit[];
  schedule: MaintenanceSchedule;
  services: ServiceRecord[];
  history: HistoryEvent[];
  images: AssetImage[];
}

export interface Asset extends AssetDetailFields {
  id: string;
  name: string;
  tag: string;
  /** Initial rendered inside the square avatar in the Asset column. */
  avatar: string;
  category: string;
  department: string;
  /** Department id, used to re-select it in the edit form; name above stays the display value. */
  departmentId?: string | null;
  qty: number;
  condition: AssetCondition;
  risk: AssetRisk;
  status: AssetStatus;
  /** Maintenance frequency, e.g. "Quarterly" | "Yearly" | "Monthly". */
  maintenance: string | null;
  /** Overdue maintenance date, rendered in red below the frequency. */
  maintenanceDue: string | null;
}

/** Row fields stored on the list page, before detail data is attached. */
export type AssetSeed = Omit<Asset, keyof AssetDetailFields>;

/** Filter option lists - labels mirror the design exactly. */
export const ASSET_CATEGORY_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Categories" },
  { value: "Audio", label: "Audio" },
  { value: "Furniture", label: "Furniture" },
  { value: "Power", label: "Power" },
  { value: "Facility", label: "Facilities" },
  { value: "Vehicles", label: "Vehicles" },
  { value: "Kitchen", label: "Kitchen" },
  { value: "Media", label: "Media" },
  { value: "IT", label: "IT" },
  { value: "Other", label: "Other" },
];

export const ASSET_RISK_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Risk" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

export const ASSET_TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Assets" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Due", label: "Due" },
  { value: "Nil", label: "Nil" },
];

export const ASSET_STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Disposed", label: "Disposed" },
];

export const ASSET_CATEGORIES = ASSET_CATEGORY_FILTERS.filter((option) => {
  return option.value !== "ALL";
}).map((option) => {
  return option.label;
});

export const ASSET_RISKS: AssetRisk[] = ["Low", "Medium", "High"];
export const ASSET_STATUSES: AssetStatus[] = ["Active", "Inactive", "Disposed"];
export const MAINTENANCE_FREQUENCIES = ["Monthly", "Quarterly", "Yearly"];
export const ASSET_CONDITIONS: AssetCondition[] = [
  "Good",
  "Fair",
  "Repair",
  "Damaged",
];

export const PAGE_SIZE = 10;
