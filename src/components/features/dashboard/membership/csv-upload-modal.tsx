"use client";

import {
  AlertCircle,
  CheckCircle,
  Download,
  PauseCircle,
  PlayCircle,
  UploadCloud,
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
import { useToast } from "@/hooks/use-toast";
import { getAccessToken } from "@/lib/auth/session";
import {
  GENDER_MAP,
  MARITAL_MAP,
  MEMBERSHIP_MAP,
  TITLE_MAP,
} from "@/lib/constant";
import { MembershipStatus, MemberTitle } from "@/lib/enums";
import { uploadMembersCsv } from "@/services/memberService";
import { CsvUploadModalProps, UploadFile } from "@/types";
import { FileInputProps } from "@/types/index";

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

  const validateCsvData = (
    data: any[],
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const requiredFields = ["fullName", "phoneNumber"];

    if (data.length === 0) {
      errors.push("CSV file is empty");
      return { isValid: false, errors };
    }

    data.forEach((row, index) => {
      requiredFields.forEach((field) => {
        if (!row[field] || !row[field].trim()) {
          errors.push(`Row ${index + 2}: Missing required field "${field}"`);
        }
      });

      // Validate email format if provided
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors.push(`Row ${index + 2}: Invalid email format: ${row.email}`);
      }

      // Validate birthday format
      if (row.birthday && isNaN(new Date(row.birthday).getTime())) {
        errors.push(
          `Row ${index + 2}: Invalid birthday format: ${row.birthday}`,
        );
      }
    });

    return { isValid: errors.length === 0, errors };
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
          complete: (results) => resolve(results.data as any[]),
          error: (err) => reject(err),
        }),
      );

      // Validate CSV data
      const { isValid, errors } = validateCsvData(parsed);
      if (!isValid) {
        throw new Error(
          `Validation failed:\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n... and ${errors.length - 5} more errors` : ""}`,
        );
      }

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
        // Handle specific error types
        let errorMessage = result.error;
        let errorDetails = "";

        if (result.error.includes("duplicate")) {
          errorMessage = "Duplicate entries detected";
          errorDetails =
            "Some members already exist in your database. Please check the file and remove duplicates.";
        } else if (result.error.includes("validation")) {
          errorMessage = "Data validation failed";
          errorDetails = "Please ensure all fields meet the required format.";
        } else if (result.error.includes("network")) {
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
      toast({
        title: "Upload successful",
        description: `${result?.inserted || 0} members imported successfully`,
        variant: "default",
      });
      onSuccess();
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

        <Heading level={2} variant="primary" className=" sm:text-xl">
          Upload Church Members
        </Heading>
        <Text className="mt-1 sm:text-base text-gray-600">
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
          <Button variant="outline" onClick={handleClose}>
            Close
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

  const csvContent = `title,fullName,gender,birthday,maritalStatus,dateOfMarriage,spouseFirstName,spouseLastName,phoneNumber,email,occupation,educationalBackground,membershipStatus,dateJoined,previousChurchMembership,isBaptized,ministries,volunteerPreferences,cellGroupName
MR.,Anthony Carter,MALE,1/12/1991,SINGLE,,,,14155667788,anthony.carter@example.com,Developer,Bachelor,MEMBER,7/15/2022,,TRUE,Music,Outreach,Iota Group
MRS.,Rebecca Allen,FEMALE,4/25/1984,MARRIED,5/10/2009,,,14156778899,rebecca.allen@example.com,Teacher,Master,MEMBER,2/18/2021,Grace Church,FALSE,Hospitality,Teaching,Kappa Group
MISS,Olivia Parker,FEMALE,7/7/1995,SINGLE,,,,14157889901,olivia.parker@example.com,Designer,Bachelor,VOLUNTEER,3/22/2023,,TRUE,Drama,Event Planning,Lambda Group
DR,Steven Hughes,MALE,10/15/1982,MARRIED,12/3/2007,,,14158990123,steven.hughes@example.com,Pastor,PhD,LEADER,11/5/2019,New Hope Church,TRUE,Teaching,Youth Ministry,Mu Group
MR.,Joshua Ramirez,MALE,6/21/1990,SINGLE,,,,14159011234,joshua.ramirez@example.com,Engineer,Bachelor,MEMBER,9/10/2022,,TRUE,Music,Teaching,Nu Group`;

  return (
    <div className="space-y-6">
      {/* Template Download Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Text className="font-semibold">Sample CSV Template</Text>
            <Text className="text-xs text-gray-500 mt-1">
              Download and use this template for correct formatting
            </Text>
          </div>
          <Button
            variant="outline"
            size="sm"
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
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <div>
        <Text className="mb-2 font-semibold">Upload CSV File</Text>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
        >
          <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <Text className="text-gray-600">
            Click or drag and drop to upload
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            Supported formats: .csv
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

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Text className="font-semibold">Upload Queue</Text>
            <Text className="text-xs text-gray-500">
              {files.length} file(s)
            </Text>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-3 space-y-2 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(file.status)}
                      <Span className="font-medium truncate">
                        {file.file.name}
                      </Span>
                    </div>
                    <Text className="text-xs text-gray-500">
                      {(file.file.size / 1024).toFixed(2)} KB
                    </Text>
                  </div>

                  <div className="flex items-center gap-1">
                    {(file.status === "uploading" ||
                      file.status === "paused") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPauseResume(file)}
                        className="h-8 w-8 p-0"
                      >
                        {file.status === "paused" ? (
                          <PlayCircle className="w-4 h-4" />
                        ) : (
                          <PauseCircle className="w-4 h-4" />
                        )}
                      </Button>
                    )}

                    {(file.status === "uploading" ||
                      file.status === "paused" ||
                      file.status === "error") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(file)}
                        className="h-8 w-8 p-0 hover:text-red-500"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <Span className="text-gray-600">
                      {file.status === "uploading"
                        ? "Uploading..."
                        : file.status === "paused"
                          ? "Paused"
                          : file.status === "success"
                            ? "Complete"
                            : "Failed"}
                    </Span>
                    <Span className="font-medium">
                      {Math.round(file.progress)}%
                    </Span>
                  </div>
                  <Progress
                    value={file.progress}
                    className={`h-2 ${getStatusColor(file.status)}`}
                  />
                </div>

                {file.status === "error" && file.error && (
                  <Alert variant="destructive" className="mt-2 py-2">
                    <AlertCircle className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      <strong>{file.error}</strong>
                      {"errorDetails" in file && file.errorDetails && (
                        <div className="mt-1 text-gray-700">
                          {file.errorDetails}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {file.status === "success" && (
                  <Alert className="mt-2 py-2 border-green-200 bg-green-50">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <AlertDescription className="text-xs text-green-700">
                      File uploaded successfully!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 'use client';

// import Papa from 'papaparse';
// import { useRef, useState } from 'react';
// import { FaPause, FaPlay, FaTimes } from 'react-icons/fa';

// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import Heading from '@/components/ui/typography/Heading';
// import { Span, Text } from '@/components/ui/typography/Text';
// import { useToast } from '@/hooks/use-toast';
// import { getAccessToken } from '@/lib/auth/session';
// import { GENDER_MAP, MARITAL_MAP, MEMBERSHIP_MAP, TITLE_MAP } from '@/lib/constant';
// import { MembershipStatus, MemberTitle } from '@/lib/enums';
// import { uploadMembersCsv } from '@/services/memberService';
// import { CsvUploadModalProps, UploadFile } from '@/types';
// import { FileInputProps } from '@/types/index';

// export function CsvUploadModal({ open, onOpenChange, onSuccess, onClose }: CsvUploadModalProps) {
// 	const { toast } = useToast();
// 	const [files, setFiles] = useState<UploadFile[]>([]);
// 	const token = getAccessToken() ?? undefined;

// 	const handleRemoveFile = (file: UploadFile) => {
// 		file.controller?.abort();
// 		setFiles((prev) => prev.filter((f) => f.file !== file.file));
// 	};
// 	const handlePauseResume = (file: UploadFile) => {
// 		if (file.status === 'uploading') {
// 			file.controller?.abort();
// 			setFiles((prev) => prev.map((f) => (f.file === file.file ? { ...f, status: 'paused' } : f)));
// 		} else if (file.status === 'paused') {
// 			handleUpload(file.file);
// 			setFiles((prev) => prev.map((f) => (f.file === file.file ? { ...f, status: 'uploading' } : f)));
// 		}
// 	};

// 	const normalizeRow = (row: any) => ({
// 		...row,
// 		title: TITLE_MAP[row.title?.toLowerCase()] || MemberTitle.MR,
// 		gender: GENDER_MAP[row.gender?.toLowerCase()] || null,
// 		maritalStatus: MARITAL_MAP[row.maritalStatus?.toLowerCase()] || null,
// 		membershipStatus: MEMBERSHIP_MAP[row.membershipStatus?.toLowerCase()] || MembershipStatus.MEMBER,
// 		isBaptized: ['true', '1', 'yes'].includes(String(row.isBaptized)?.toLowerCase()),
// 		birthday: row.birthday ? new Date(row.birthday).toISOString().split('T')[0] : null,
// 		dateOfMarriage: row.dateOfMarriage ? new Date(row.dateOfMarriage).toISOString().split('T')[0] : null,
// 		dateJoined: row.dateJoined ? new Date(row.dateJoined).toISOString().split('T')[0] : null,
// 	});

// 	const handleUpload = async (file: File) => {
// 		const controller = new AbortController();
// 		const newFile: UploadFile = {
// 			file,
// 			progress: 0,
// 			status: 'uploading',
// 			controller,
// 		};

// 		setFiles((prev) => {
// 			const exists = prev.find((f) => f.file === file);
// 			if (exists) return prev.map((f) => (f.file === file ? { ...f, controller, status: 'uploading' } : f));
// 			return [...prev, newFile];
// 		});

// 		try {
// 			const parsed = await new Promise<any[]>((resolve, reject) =>
// 				Papa.parse(file, {
// 					header: true,
// 					skipEmptyLines: true,
// 					complete: (results) => resolve(results.data as any[]),
// 					error: (err) => reject(err),
// 				})
// 			);
// 			const normalized = parsed.map(normalizeRow);

// 			const result = await uploadMembersCsv(file, {
// 				token,
// 				signal: controller.signal,
// 				onProgress: (progress) => setFiles((prev) => prev.map((f) => (f.file === file ? { ...f, progress } : f))),
// 			});

// 			if (result?.error) {
// 				setFiles((prev) =>
// 					prev.map((f) =>
// 						f.file === file
// 							? {
// 									...f,
// 									status: 'error',
// 									error: result.error,
// 									controller: undefined,
// 								}
// 							: f
// 					)
// 				);
// 				return;
// 			}

// 			setFiles((prev) => prev.map((f) => (f.file === file ? { ...f, status: 'success', progress: 100, controller: undefined } : f)));
// 			toast({
// 				title: 'Upload complete',
// 				description: `${result?.inserted || 0} members imported`,
// 			});
// 			onSuccess();
// 		} catch (err: any) {
// 			setFiles((prev) =>
// 				prev.map((f) =>
// 					f.file === file
// 						? {
// 								...f,
// 								status: 'error',
// 								error: err?.message || 'Upload failed',
// 								controller: undefined,
// 							}
// 						: f
// 				)
// 			);
// 		}
// 	};

// 	const handleClose = () => {
// 		onOpenChange(false);
// 		setFiles([]);
// 	};

// 	return (
// 		<Dialog
// 			open={open}
// 			onOpenChange={onOpenChange}>
// 			<DialogContent
// 				showClose={false}
// 				mobileSheet
// 				className="w-full sm:max-w-3xl max-h-[85vh] overflow-hidden p-4 sm:p-6 flex flex-col">
// 				<DialogDescription className="sr-only">Upload church members via CSV file.</DialogDescription>

// 				<Heading
// 					level={2}
// 					variant="primary"
// 					className=" sm:text-xl">
// 					Upload Church Members
// 				</Heading>
// 				<Text className="mt-1  sm:text-base">Upload your members in bulk using CSV files</Text>

// 				<div className="flex-1 min-h-0 overflow-y-auto mt-4">
// 					<FileInput
// 						accept=".csv"
// 						multiple
// 						files={files}
// 						onUpload={handleUpload}
// 						onRemove={handleRemoveFile}
// 						onPauseResume={handlePauseResume}
// 					/>
// 				</div>

// 				<div className="mt-4 sm:mt-6 flex justify-end gap-2">
// 					<Button
// 						className="w-full"
// 						onClick={onClose}>
// 						Done
// 					</Button>
// 				</div>
// 			</DialogContent>
// 		</Dialog>
// 	);
// }

// export function FileInput({ accept, multiple, files, onUpload, onRemove, onPauseResume }: FileInputProps) {
// 	const inputRef = useRef<HTMLInputElement | null>(null);

// 	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		const selectedFiles = e.target.files;
// 		if (!selectedFiles) {
// 			return;
// 		}
// 		Array.from(selectedFiles).forEach((file) => onUpload(file));
// 		e.target.value = '';
// 	};

// 	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
// 		e.preventDefault();
// 		if (!e.dataTransfer.files) {
// 			return;
// 		}
// 		Array.from(e.dataTransfer.files).forEach((file) => onUpload(file));
// 	};

// 	const handleCancel = (file: UploadFile) => {
// 		file.controller?.abort();
// 		onRemove(file);
// 	};

// 	const csvContent = `title,fullName,gender,birthday,maritalStatus,dateOfMarriage,spouseFirstName,spouseLastName,phoneNumber,email,occupation,educationalBackground,membershipStatus,dateJoined,previousChurchMembership,isBaptized,ministries,volunteerPreferences,cellGroupName
// MR.,Anthony Carter,MALE,1/12/1991,SINGLE,,,,14155667788,anthony.carter@example.com,Developer,Bachelor,MEMBER,7/15/2022,,TRUE,Music,Outreach,Iota Group
// MRS.,Rebecca Allen,FEMALE,4/25/1984,MARRIED,5/10/2009,,,14156778899,rebecca.allen@example.com,Teacher,Master,MEMBER,2/18/2021,Grace Church,FALSE,Hospitality,Teaching,Kappa Group
// MISS,Olivia Parker,FEMALE,7/7/1995,SINGLE,,,,14157889901,olivia.parker@example.com,Designer,Bachelor,VOLUNTEER,3/22/2023,,TRUE,Drama,Event Planning,Lambda Group
// DR,Steven Hughes,MALE,10/15/1982,MARRIED,12/3/2007,,,14158990123,steven.hughes@example.com,Pastor,PhD,LEADER,11/5/2019,New Hope Church,TRUE,Teaching,Youth Ministry,Mu Group
// MR.,Joshua Ramirez,MALE,6/21/1990,SINGLE,,,,14159011234,joshua.ramirez@example.com,Engineer,Bachelor,MEMBER,9/10/2022,,TRUE,Music,Teaching,Nu Group
// MRS.,Megan Foster,FEMALE,11/11/1987,MARRIED,3/18/2012,,,14150122345,megan.foster@example.com,Nurse,Master,MEMBER,12/15/2020,First Light Church,FALSE,Hospitality,Outreach,Xi Group
// MISS,Chloe Bennett,FEMALE,3/3/1992,SINGLE,,,,14151233456,chloe.bennett@example.com,Architect,Bachelor,VOLUNTEER,6/1/2023,,TRUE,Choir,Event Planning,Omicron Group
// DR,Edward Simmons,MALE,8/28/1980,MARRIED,9/14/2004,,,14152344567,edward.simmons@example.com,Engineer,PhD,LEADER,10/20/2018,Faith Life Church,TRUE,Teaching,Youth Ministry,Pi Group
// MR.,Brian Reed,MALE,12/5/1989,SINGLE,,,,14153455678,brian.reed@example.com,Developer,Bachelor,MEMBER,11/11/2022,,TRUE,Music,Outreach,Rho Group
// MRS.,Angela Kelly,FEMALE,5/19/1985,MARRIED,6/25/2010,,,14154566789,angela.kelly@example.com,Teacher,Master,MEMBER,1/8/2021,Hope Church,FALSE,Hospitality,Teaching,Sigma Group`;

// 	return (
// 		<div className="space-y-4">
// 			<div>
// 				<Text className=" mb-2">Use this template</Text>
// 				<Button
// 					variant="outline"
// 					className="w-full "
// 					onClick={() => {
// 						const blob = new Blob([csvContent], {
// 							type: 'text/csv;charset=utf-8;',
// 						});

// 						const url = URL.createObjectURL(blob);
// 						const link = document.createElement('a');

// 						link.href = url;
// 						link.setAttribute('download', 'sample-members.csv');

// 						document.body.appendChild(link);
// 						link.click();
// 						document.body.removeChild(link);
// 					}}>
// 					⬇ Download Sample Csv
// 				</Button>
// 			</div>

// 			<div>
// 				<Text className=" mb-2">Upload file</Text>

// 				<div
// 					onClick={() => inputRef.current?.click()}
// 					onDragOver={(e) => e.preventDefault()}
// 					onDrop={handleDrop}
// 					className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition">
// 					<Text>Click to upload file (Supported formats: .csv)</Text>

// 					<Input
// 						ref={inputRef}
// 						type="file"
// 						accept={accept}
// 						multiple={multiple}
// 						className="hidden"
// 						onChange={handleFileChange}
// 					/>
// 				</div>
// 			</div>

// 			{files.length > 0 && (
// 				<div className="space-y-4">
// 					<Text>Uploaded files</Text>

// 					{files.map((file, index) => (
// 						<div
// 							key={index}
// 							className="space-y-1">
// 							<div className="flex justify-between items-center text-sm">
// 								<Span className="truncate max-w-[200px]">{file.file.name}</Span>

// 								<div className="flex items-center gap-3">
// 									<Span>{file.progress}%</Span>

// 									{(file.status === 'uploading' || file.status === 'paused') && (
// 										<Button
// 											variant="ghost"
// 											onClick={() => onPauseResume(file)}>
// 											{file.status === 'paused' ? <FaPlay /> : <FaPause />}
// 										</Button>
// 									)}

// 									{(file.status === 'uploading' || file.status === 'paused' || file.status === 'error') && (
// 										<Button
// 											variant="ghost"
// 											onClick={() => handleCancel(file)}>
// 											<FaTimes className="text-red-500" />
// 										</Button>
// 									)}
// 								</div>
// 							</div>

// 							<div className="h-2 bg-gray-200 rounded">
// 								<div
// 									className={`h-2 rounded transition-all ${
// 										file.status === 'error' ? 'bg-red-500' : file.status === 'success' ? 'bg-blue-500' : file.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
// 									}`}
// 									style={{ width: `${file.progress}%` }}
// 								/>
// 							</div>

// 							{file.status === 'uploading' && <Text className="text-xs text-gray-500">Uploading...</Text>}
// 							{file.status === 'paused' && <Text className="text-xs text-gray-500">Paused</Text>}
// 							{file.status === 'success' && <Text className="text-xs text-blue-600">Successfully Uploaded!</Text>}
// 							{file.status === 'error' && <Text className="text-xs text-red-500">{file.error || 'Error uploading'}</Text>}
// 						</div>
// 					))}
// 				</div>
// 			)}
// 		</div>
// 	);
// }
