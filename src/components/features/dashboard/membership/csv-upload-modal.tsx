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
  GENDER_MAP,
  MARITAL_MAP,
  MEMBERSHIP_MAP,
  TITLE_MAP,
} from "@/lib/constant";
import { MembershipStatus } from "@/lib/enums";
import { uploadMembersCsv } from "@/services/memberService";
import { CsvUploadModalProps, UploadFile } from "@/types";
import { FileInputProps } from "@/types/index";
import { csvMemberRowSchema } from "@/types/schema";

// Human-readable labels for each field, keyed by the internal snake_case
// name used for header matching. Used for the downloadable template and
// for validation error messages shown to the user — the underlying
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
  membership_status: "Membership Status",
  date_joined: "Date Joined",
  previous_church_membership: "Previous Church Membership",
  is_baptized: "Is Baptized",
  ministries: "Ministries",
  volunteer_preferences: "Volunteer Preferences",
  cell_group_name: "Cell Group Name",
};

const CSV_TEMPLATE_COLUMNS = Object.keys(FIELD_LABELS);

// Android's native file pickers (Google Files, Samsung My Files, Downloads
// app, etc.) filter by the MIME type the OS indexed for a file, not by the
// ".csv" extension itself — and CSVs downloaded on Android are inconsistently
// tagged across devices/apps (rarely the canonical "text/csv"). Listing only
// ".csv" greys the file out or hides it entirely on many Android pickers,
// even though the same file selects fine on iOS/desktop. Widening this to
// every MIME type Android commonly (mis)assigns to CSVs fixes that — content
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
    const membershipStatus = getValue("membership_status");
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
      membershipStatus:
        MEMBERSHIP_MAP[membershipStatus?.toString().toLowerCase()] ||
        MembershipStatus.MEMBER,
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
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (data.length === 0) {
      errors.push("CSV file is empty");
      return { isValid: false, errors };
    }

    // Get actual headers from the first row
    const headers = Object.keys(data[0] || {});

    // Check if required headers exist
    const requiredHeaders = ["full_name", "phone_number"];
    const missingHeaders = requiredHeaders.filter(
      (req) =>
        !headers.some(
          (h) =>
            h.toLowerCase().replace(/[\s_]/g, "") ===
            req.toLowerCase().replace(/[\s_]/g, ""),
        ),
    );

    if (missingHeaders.length > 0) {
      errors.push(
        `Missing required columns: ${missingHeaders.map((h) => FIELD_LABELS[h] || h).join(", ")}. Found columns: ${headers.join(", ")}`,
      );
      return { isValid: false, errors };
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
        });
      }

      if (hasFullName || hasPhoneNumber) {
        validRowCount++;
      }
    }

    if (validRowCount === 0 && !hasEncounteredEmptyRow) {
      errors.push("No valid data rows found in the CSV file");
    }
    return { isValid: errors.length === 0, errors };
  };

  // Helper function to convert normalized data to CSV
  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return "";

    // Fixed camelCase headers the backend expects. This list is always
    // used here regardless of how the uploaded file's own headers were
    // labeled (human-readable, snake_case, etc.) — normalizeRow() already
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

  const handleUpload = async (file: File) => {
    const controller = new AbortController();
    const newFile: UploadFile = {
      file,
      progress: 0,
      status: "uploading",
      controller,
    };

    setFiles((prev) => {
      const exists = prev.find((f) => f.file === file);
      if (exists)
        return prev.map((f) =>
          f.file === file ? { ...f, controller, status: "uploading" } : f,
        );
      return [...prev, newFile];
    });

    try {
      // Parse CSV
      const parsed = await new Promise<any[]>((resolve, reject) =>
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) =>
            header.trim().toLowerCase().replace(/\s/g, "_"),
          complete: (results) => {
            resolve(results.data as any[]);
          },
          error: (err) => reject(err),
        }),
      );

      // Find the first empty row and truncate data there
      let firstEmptyRowIndex = -1;
      for (let i = 0; i < parsed.length; i++) {
        const row = parsed[i];
        const isEmptyRow =
          !row ||
          Object.keys(row).length === 0 ||
          Object.values(row).every(
            (value) =>
              !value || (typeof value === "string" && value.trim() === ""),
          );

        if (isEmptyRow) {
          firstEmptyRowIndex = i;
          break;
        }
      }

      // Only keep rows before the first empty row
      const cleanedData =
        firstEmptyRowIndex === -1
          ? parsed
          : parsed.slice(0, firstEmptyRowIndex);

      if (cleanedData.length === 0) {
        throw new Error("CSV file contains no valid data rows");
      }

      // Validate CSV data
      const { isValid, errors } = validateCsvData(cleanedData);
      if (!isValid) {
        throw new Error(
          `Validation failed:\n${errors.slice(0, 10).join("\n")}${errors.length > 10 ? `\n... and ${errors.length - 10} more errors` : ""}`,
        );
      }

      // Normalize the data to match backend expectations
      const normalizedData = cleanedData.map(normalizeRow);

      // Convert normalized data back to CSV
      const normalizedCSV = convertToCSV(normalizedData);

      // Create a new File object from the normalized CSV
      const normalizedFile = new File([normalizedCSV], file.name, {
        type: "text/csv",
      });

      // Send the new CSV file to the backend
      const result = await uploadMembersCsv(normalizedFile, {
        token,
        signal: controller.signal,
        onProgress: (progress) =>
          setFiles((prev) =>
            prev.map((f) => (f.file === file ? { ...f, progress } : f)),
          ),
      });

      if (result?.error || result?.message?.includes("failed")) {
        // Handle specific error types
        let errorMessage = result.error || result.message || "Upload failed";
        let errorDetails = "";

        if (errorMessage.toLowerCase().includes("duplicate")) {
          errorMessage = "Duplicate entries detected";
          errorDetails =
            "Some members already exist in your database. Please check the file and remove duplicates.";
        } else if (errorMessage.toLowerCase().includes("validation")) {
          errorMessage = "Data validation failed";
          errorDetails = "Please ensure all fields meet the required format.";
        } else if (errorMessage.toLowerCase().includes("network")) {
          errorMessage = "Network error";
          errorDetails = "Please check your internet connection and try again.";
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? {
                  ...f,
                  status: "error",
                  error: errorMessage,
                  errorDetails,
                  controller: undefined,
                }
              : f,
          ),
        );
        return;
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, status: "success", progress: 100, controller: undefined }
            : f,
        ),
      );
      const insertedCount =
        result?.inserted || result?.count || normalizedData.length;

      toast({
        title: "Upload successful",
        description: `${insertedCount} members imported successfully`,
        variant: "default",
      });
      onSuccess(insertedCount);

      // Close modal after successful upload
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      let errorMessage = "Upload failed";
      let errorDetails = err?.message || "An unexpected error occurred";

      if (err?.name === "AbortError") {
        errorMessage = "Upload cancelled";
        errorDetails = "The upload was cancelled. You can try again.";
      } else if (err?.message?.includes("Validation failed")) {
        errorMessage = "CSV validation failed";
        errorDetails = err.message;
      } else if (err?.message?.includes("Failed to fetch")) {
        errorMessage = "Connection error";
        errorDetails =
          "Unable to connect to the server. Please check your internet connection.";
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                status: "error",
                error: errorMessage,
                errorDetails,
                controller: undefined,
              }
            : f,
        ),
      );

      toast({
        title: errorMessage,
        description: errorDetails,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setFiles([]);
    onClose?.();
    onOpenChange(false);
  };

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
            multiple
            files={files}
            onUpload={handleUpload}
            onRemove={handleRemoveFile}
            onPauseResume={handlePauseResume}
          />
        </div>

        <div className="mt-4 sm:mt-6">
          <Button
            onClick={handleClose}
            disabled={files.some((f) => f.status === "uploading")}
            className="w-full h-11 rounded-lg text-sm font-semibold"
          >
            {files.some((f) => f.status === "uploading")
              ? "Uploading…"
              : "Done"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
MR.,Anthony Carter,MALE,1/12/1991,SINGLE,,,,14155667788,anthony.carter@example.com,Developer,Bachelor,MEMBER,7/15/2022,,TRUE,Music,Outreach,Iota Group
MRS.,Rebecca Allen,FEMALE,4/25/1984,MARRIED,5/10/2009,,,14156778899,rebecca.allen@example.com,Teacher,Master,MEMBER,2/18/2021,Grace Church,FALSE,Hospitality,Teaching,Kappa Group`;

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
                  <Text className="text-xs text-gray-500">Uploading…l</Text>
                )}
                {file.status === "paused" && (
                  <Text className="text-xs text-gray-500">Paused</Text>
                )}
                {file.status === "error" && (
                  <div>
                    <Text className="text-xs text-red-500 font-medium">
                      Error…l
                    </Text>
                    {file.error && (
                      <Text className="text-xs text-gray-500 mt-0.5">
                        {file.error}
                        {"errorDetails" in file && file.errorDetails
                          ? ` — ${file.errorDetails}`
                          : ""}
                      </Text>
                    )}
                  </div>
                )}
                {file.status === "success" && (
                  <Text className="text-xs text-primary-400 font-medium">
                    Successfully Uploaded!
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
