import { ActivityDetailLabel } from "@/lib/enums";
import { ActivityRow } from "@/types";

export const activityDetailsConfig: {
  key: ActivityDetailLabel;
  getValue: (row: ActivityRow) => React.ReactNode;
}[] = [
  {
    key: ActivityDetailLabel.ACTION,
    getValue: (row) => {
      return row.action;
    },
  },
  {
    key: ActivityDetailLabel.BY,
    getValue: (row) => {
      return `${row.adminId?.firstName || "Unknown"} ${row.adminId?.lastName || ""}`;
    },
  },
  {
    key: ActivityDetailLabel.MODULE,
    getValue: (row) => {
      return row.module;
    },
  },
  {
    key: ActivityDetailLabel.AFFECTED_RECORD,
    getValue: (row) => {
      return row.details;
    },
  },
  {
    key: ActivityDetailLabel.STATUS,
    getValue: () => {
      return "Approved";
    },
  },
  {
    key: ActivityDetailLabel.TRIGGERED_FROM,
    getValue: () => {
      return "Requisition Form > Pending List";
    },
  },
  {
    key: ActivityDetailLabel.DETAILS,
    getValue: (row) => {
      return `“${row.details}”`;
    },
  },
];
