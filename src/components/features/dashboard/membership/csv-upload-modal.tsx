"use client";

import { useRef, useState } from "react";
import { FileInputProps } from "@/types/index";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Heading from "@/components/ui/typography/Heading";
import { Text, Span } from "@/components/ui/typography/Text";

import { useToast } from "@/hooks/use-toast";
import { uploadMembersCsv } from "@/services/memberService";
import { getAccessToken } from "@/lib/auth/session";
import Papa from "papaparse";
import { FaPause, FaPlay, FaTimes } from "react-icons/fa";
import { MemberTitle, MembershipStatus } from "@/lib/enums";
import {
  GENDER_MAP,
  MEMBERSHIP_MAP,
  MARITAL_MAP,
  TITLE_MAP,
} from "@/lib/constant";

import { UploadFile, CsvUploadModalProps } from "@/types";

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

  const csvContent = `churchId,title,fullName,gender,birthday,maritalStatus,dateOfMarriage,phoneNumber,email,occupation,educationalBackground,address,membershipStatus,dateJoined,previousChurchMembership,isBaptized,ministries,volunteerPreferences,cellGroupName
60f71b2f9f1b2c001c8e4b22,MR.,Anthony Carter,MALE,1991-01-12,SINGLE,,+14155667788,anthony.carter@example.com,Developer,Bachelor,"101 Spruce St, City, Country",MEMBER,2022-07-15,,true,"Music","Outreach",Iota Group
60f71b2f9f1b2c001c8e4b23,MRS.,Rebecca Allen,FEMALE,1984-04-25,MARRIED,2009-05-10,+14156778899,rebecca.allen@example.com,Teacher,Master,"202 Cherry Ln, City, Country",MEMBER,2021-02-18,Grace Church,false,"Hospitality","Teaching",Kappa Group
60f71b2f9f1b2c001c8e4b24,MISS,Olivia Parker,FEMALE,1995-07-07,SINGLE,,+14157889901,olivia.parker@example.com,Designer,Bachelor,"303 Willow Rd, City, Country",VOLUNTEER,2023-03-22,,true,"Drama","Event Planning",Lambda Group
60f71b2f9f1b2c001c8e4b25,DR,Steven Hughes,MALE,1982-10-15,MARRIED,2007-12-03,+14158990123,steven.hughes@example.com,Pastor,PhD,"404 Poplar Blvd, City, Country",LEADER,2019-11-05,New Hope Church,true,"Teaching","Youth Ministry",Mu Group
60f71b2f9f1b2c001c8e4b26,MR.,Joshua Ramirez,MALE,1990-06-21,SINGLE,,+14159011234,joshua.ramirez@example.com,Engineer,Bachelor,"505 Aspen St, City, Country",MEMBER,2022-09-10,,true,"Music","Teaching",Nu Group
60f71b2f9f1b2c001c8e4b27,MRS.,Megan Foster,FEMALE,1987-11-11,MARRIED,2012-03-18,+14150122345,megan.foster@example.com,Nurse,Master,"606 Elmwood Ave, City, Country",MEMBER,2020-12-15,First Light Church,false,"Hospitality","Outreach",Xi Group
60f71b2f9f1b2c001c8e4b28,MISS,Chloe Bennett,FEMALE,1992-03-03,SINGLE,,+14151233456,chloe.bennett@example.com,Architect,Bachelor,"707 Pinecrest Rd, City, Country",VOLUNTEER,2023-06-01,,true,"Choir","Event Planning",Omicron Group
60f71b2f9f1b2c001c8e4b29,DR,Edward Simmons,MALE,1980-08-28,MARRIED,2004-09-14,+14152344567,edward.simmons@example.com,Engineer,PhD,"808 Cedar Blvd, City, Country",LEADER,2018-10-20,Faith Life Church,true,"Teaching","Youth Ministry",Pi Group
60f71b2f9f1b2c001c8e4b2a,MR.,Brian Reed,MALE,1989-12-05,SINGLE,,+14153455678,brian.reed@example.com,Developer,Bachelor,"909 Maple Ave, City, Country",MEMBER,2022-11-11,,true,"Music","Outreach",Rho Group
60f71b2f9f1b2c001c8e4b2b,MRS.,Angela Kelly,FEMALE,1985-05-19,MARRIED,2010-06-25,+14154566789,angela.kelly@example.com,Teacher,Master,"111 Birch Rd, City, Country",MEMBER,2021-01-08,Hope Church,false,"Hospitality","Teaching",Sigma Group`;

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

          {files.map((file, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <Span className="truncate max-w-[200px]">{file.file.name}</Span>

                <div className="flex items-center gap-3">
                  <Span>{file.progress}%</Span>

                  {(file.status === "uploading" ||
                    file.status === "paused") && (
                    <Button variant="ghost" onClick={() => onPauseResume(file)}>
                      {file.status === "paused" ? <FaPlay /> : <FaPause />}
                    </Button>
                  )}

                  {(file.status === "uploading" ||
                    file.status === "paused" ||
                    file.status === "error") && (
                    <Button variant="ghost" onClick={() => handleCancel(file)}>
                      <FaTimes className="text-red-500" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="h-2 bg-gray-200 rounded">
                <div
                  className={`h-2 rounded transition-all ${
                    file.status === "error"
                      ? "bg-red-500"
                      : file.status === "success"
                        ? "bg-blue-500"
                        : file.status === "paused"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                  }`}
                  style={{ width: `${file.progress}%` }}
                />
              </div>

              {file.status === "uploading" && (
                <Text className="text-xs text-gray-500">Uploading...</Text>
              )}
              {file.status === "paused" && (
                <Text className="text-xs text-gray-500">Paused</Text>
              )}
              {file.status === "success" && (
                <Text className="text-xs text-blue-600">
                  Successfully Uploaded!
                </Text>
              )}
              {file.status === "error" && (
                <Text className="text-xs text-red-500">
                  {file.error || "Error uploading"}
                </Text>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
