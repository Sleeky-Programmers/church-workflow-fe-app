"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Heading from "@/components/ui/typography/Heading";
import { Text, Span } from "@/components/ui/typography/Text";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { uploadMembersCsv } from "@/services/memberService";
import { getAccessToken } from "@/lib/auth/session";
import Papa from "papaparse";
import { FaPause, FaPlay, FaTimes } from "react-icons/fa";
import {
  Gender,
  MemberTitle,
  MaritalStatus,
  MembershipStatus,
} from "@/lib/enums";
import { csvContent } from "@/lib/data";

type UploadFile = {
  file: File;
  progress: number;
  status: "uploading" | "paused" | "success" | "error";
  error?: string;
  controller?: AbortController;
};

type CsvUploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onClose: () => void;
};

const GENDER_MAP: Record<string, Gender> = {
  male: Gender.MALE,
  female: Gender.FEMALE,
};
const TITLE_MAP: Record<string, MemberTitle> = {
  mr: MemberTitle.MR,
  mrs: MemberTitle.MRS,
  miss: MemberTitle.MISS,
  dr: MemberTitle.DR,
  pastor: MemberTitle.PASTOR,
  rev: MemberTitle.REV,
};
const MARITAL_MAP: Record<string, MaritalStatus> = {
  single: MaritalStatus.SINGLE,
  married: MaritalStatus.MARRIED,
  divorced: MaritalStatus.DIVORCED,
  widowed: MaritalStatus.WIDOWED,
};
const MEMBERSHIP_MAP: Record<string, MembershipStatus> = {
  member: MembershipStatus.MEMBER,
  visitor: MembershipStatus.VISITOR,
  volunteer: MembershipStatus.VOLUNTEER,
  worker: MembershipStatus.WORKER,
  leader: MembershipStatus.LEADER,
  "new convert": MembershipStatus.CONVERT,
};

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

  const normalizeRow = (row: any) => ({
    ...row,
    title: TITLE_MAP[row.title?.toLowerCase()] || MemberTitle.MR,
    gender: GENDER_MAP[row.gender?.toLowerCase()] || null,
    maritalStatus: MARITAL_MAP[row.maritalStatus?.toLowerCase()] || null,
    membershipStatus:
      MEMBERSHIP_MAP[row.membershipStatus?.toLowerCase()] ||
      MembershipStatus.MEMBER,
    isBaptized: ["true", "1", "yes"].includes(
      String(row.isBaptized)?.toLowerCase(),
    ),
    birthday: row.birthday
      ? new Date(row.birthday).toISOString().split("T")[0]
      : null,
    dateOfMarriage: row.dateOfMarriage
      ? new Date(row.dateOfMarriage).toISOString().split("T")[0]
      : null,
    dateJoined: row.dateJoined
      ? new Date(row.dateJoined).toISOString().split("T")[0]
      : null,
  });

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
      const parsed = await new Promise<any[]>((resolve, reject) =>
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data as any[]),
          error: (err) => reject(err),
        }),
      );
      const normalized = parsed.map(normalizeRow);

      const result = await uploadMembersCsv(file, {
        token,
        signal: controller.signal,
        onProgress: (progress) =>
          setFiles((prev) =>
            prev.map((f) => (f.file === file ? { ...f, progress } : f)),
          ),
      });

      if (result?.error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? {
                  ...f,
                  status: "error",
                  error: result.error,
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
      toast({
        title: "Upload complete",
        description: `${result?.inserted || 0} members imported`,
      });
      onSuccess();
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                status: "error",
                error: err?.message || "Upload failed",
                controller: undefined,
              }
            : f,
        ),
      );
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFiles([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        mobileSheet
        className="w-full sm:max-w-3xl max-h-[85vh] overflow-hidden p-4 sm:p-6 flex flex-col"
      >
        <DialogDescription className="sr-only">
          Upload church members via CSV file.
        </DialogDescription>

        <Heading level={2} variant="primary" className=" sm:text-xl">
          Upload Church Members
        </Heading>
        <Text className="mt-1  sm:text-base">
          Upload your members in bulk using CSV files
        </Text>

        <div className="flex-1 min-h-0 overflow-y-auto mt-4">
          <FileInput
            accept=".csv"
            multiple
            files={files}
            onUpload={handleUpload}
            onRemove={handleRemoveFile}
            onPauseResume={handlePauseResume}
          />
        </div>

        <div className="mt-4 sm:mt-6 flex justify-end gap-2">
          <Button className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type FileInputProps = {
  accept?: string;
  multiple?: boolean;
  files: UploadFile[];
  onUpload: (file: File) => void;
  onRemove: (file: UploadFile) => void;
  onPauseResume: (file: UploadFile) => void;
};

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
    if (!selectedFiles) return;
    Array.from(selectedFiles).forEach((file) => onUpload(file));
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files) return;
    Array.from(e.dataTransfer.files).forEach((file) => onUpload(file));
  };

  const handleCancel = (file: UploadFile) => {
    file.controller?.abort();
    onRemove(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <Text className=" mb-2">Use this template</Text>
        <Button
          variant="outline"
          className="w-full "
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
          }}
        >
          ⬇ Download Sample Csv
        </Button>
      </div>

      <div>
        <Text className=" mb-2">Upload file</Text>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition"
        >
          <Text>Click to upload file (Supported formats: .csv)</Text>

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

      {files.length > 0 && (
        <div className="space-y-4">
          <Text>Uploaded files</Text>

          {files.map((f, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <Span className="truncate max-w-[200px]">{f.file.name}</Span>

                <div className="flex items-center gap-3">
                  <Span>{f.progress}%</Span>

                  {(f.status === "uploading" || f.status === "paused") && (
                    <Button variant="ghost" onClick={() => onPauseResume(f)}>
                      {f.status === "paused" ? <FaPlay /> : <FaPause />}
                    </Button>
                  )}

                  {(f.status === "uploading" ||
                    f.status === "paused" ||
                    f.status === "error") && (
                    <Button variant="ghost" onClick={() => handleCancel(f)}>
                      <FaTimes className="text-red-500" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="h-2 bg-gray-200 rounded">
                <div
                  className={`h-2 rounded transition-all ${
                    f.status === "error"
                      ? "bg-red-500"
                      : f.status === "success"
                        ? "bg-blue-500"
                        : f.status === "paused"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                  }`}
                  style={{ width: `${f.progress}%` }}
                />
              </div>

              {f.status === "uploading" && (
                <Text className="text-xs text-gray-500">Uploading...</Text>
              )}
              {f.status === "paused" && (
                <Text className="text-xs text-gray-500">Paused</Text>
              )}
              {f.status === "success" && (
                <Text className="text-xs text-blue-600">
                  Successfully Uploaded!
                </Text>
              )}
              {f.status === "error" && (
                <Text className="text-xs text-red-500">
                  {f.error || "Error uploading"}
                </Text>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
