import ExcelJS from "exceljs";
import { getNextBirthdayDate } from "@/lib/utils";

export type BirthdayExportMember = {
  id: string;
  fullName: string;
  email?: string | null;
  phoneNumber?: string | null;
  birthday?: string | null;
};

const COLORS = {
  // Mirrors tailwind.config.ts design-system palette
  primary500: "FF0C5FB3", // header fill
  primary700: "FF09437F", // header border
  primary900: "FF05284B", // title text
  primary50: "FFE7EFF7", // banded rows / accents
  white: "FFFFFFFF",
  grayBorder: "FFD1D5DB",
  grayText: "FF6B7280",
};

const FONT = "Calibri";

function computeAgeTurning(birthday: string, nextDate: Date): number | null {
  const parsed = new Date(birthday);
  if (Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getUTCFullYear();
  if (!year || year <= 1900) return null;
  return nextDate.getUTCFullYear() - year;
}

function daySuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export async function exportBirthdaysToExcel(
  members: BirthdayExportMember[],
  churchName?: string | null,
) {
  // Build rows sorted by upcoming date, like the calendar view.
  const rows = members
    .filter((m) => m.birthday && !isNaN(new Date(m.birthday).getTime()))
    .map((m) => ({
      name: m.fullName,
      email: m.email || "",
      phone: m.phoneNumber || "",
      birthday: m.birthday as string,
      nextDate: getNextBirthdayDate(m.birthday as string),
    }))
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Church Workflow";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Birthdays", {
    views: [{ state: "frozen", ySplit: 4 }],
    pageSetup: { orientation: "portrait", fitToPage: true, fitToWidth: 1 },
  });

  const totalBirthdays = rows.length;

  // --- Title block (rows 1-2) ---
  sheet.mergeCells("A1:F1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = churchName ? `${churchName} - Upcoming Birthdays` : "Upcoming Birthdays";
  titleCell.font = { name: FONT, size: 16, bold: true, color: { argb: COLORS.primary900 } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 28;

  sheet.mergeCells("A2:F2");
  const subtitleCell = sheet.getCell("A2");
  subtitleCell.value = `${totalBirthdays} birthday${totalBirthdays === 1 ? "" : "s"} in the next 12 months • Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
  subtitleCell.font = { name: FONT, size: 10, italic: true, color: { argb: COLORS.grayText } };
  sheet.getRow(2).height = 18;

  // --- Header row (row 4; row 3 is a spacer) ---
  const headerRowIndex = 4;
  const headers = [
    "#",
    "Name",
    "Email",
    "Phone Number",
    "Birthday",
    "Age Turning",
  ];
  const headerRow = sheet.getRow(headerRowIndex);
  headers.forEach((header, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = header;
    cell.font = { name: FONT, size: 11, bold: true, color: { argb: COLORS.white } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.primary500 },
    };
    cell.alignment = { vertical: "middle", horizontal: idx === 0 ? "center" : "left" };
    cell.border = {
      bottom: { style: "thin", color: { argb: COLORS.primary700 } },
    };
  });
  headerRow.height = 22;

  // --- Data rows ---
  rows.forEach((row, idx) => {
    const sheetRow = sheet.getRow(headerRowIndex + 1 + idx);
    const dayNum = row.nextDate.getDate();
    const birthdayLabel = row.nextDate.toLocaleDateString("en-US", {
      month: "long",
    }) + ` ${dayNum}${daySuffix(dayNum)}`;
    const ageTurning = computeAgeTurning(row.birthday, row.nextDate);

    const values: (string | number)[] = [
      idx + 1,
      row.name,
      row.email,
      row.phone,
      birthdayLabel,
      ageTurning ?? "",
    ];

    values.forEach((value, colIdx) => {
      const cell = sheetRow.getCell(colIdx + 1);
      cell.value = value;
      cell.font = {
        name: FONT,
        size: 11,
        color: { argb: colIdx === 0 ? COLORS.grayText : "FF111827" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: colIdx === 0 ? "center" : "left",
      };
      // Banded rows for readability
      if (idx % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLORS.primary50 },
        };
      }
      cell.border = {
        bottom: { style: "hair", color: { argb: COLORS.grayBorder } },
      };
    });

    sheetRow.height = 20;
  });

  // --- Column widths ---
  sheet.columns = [
    { width: 5 }, // #
    { width: 26 }, // Name
    { width: 32 }, // Email
    { width: 18 }, // Phone
    { width: 18 }, // Birthday
    { width: 13 }, // Age
  ];

  // Auto-filter on the header row
  sheet.autoFilter = {
    from: { row: headerRowIndex, column: 1 },
    to: { row: headerRowIndex, column: headers.length },
  };

  // --- Download ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `birthdays-next-12-months-${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
