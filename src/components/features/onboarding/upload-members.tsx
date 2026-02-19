import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/typography/Heading";
import { Text, Span } from "@/components/ui/typography/Text";
import { UseFormReturn } from "react-hook-form";
import { UploadMembersValues } from "@/types/type";
import { useState } from "react";
import { Pause, X, Download } from "lucide-react";
import { Input } from "@/components/ui/input";

type UploadFile = {
  name: string;
  progress: number;
  status: "uploading" | "error" | "success";
  message?: string;
};

type UploadMembersStepProps = {
  form: UseFormReturn<UploadMembersValues>;
  onSubmit: (data: UploadMembersValues) => void;
  onBack: () => void;
  onSkip: () => void;
  step?: number;
  totalSteps?: number;
};

export function UploadMembersStep({
  form,
  onSubmit,
  onBack,
  onSkip,
  step = 3,
  totalSteps = 3,
}: UploadMembersStepProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);

  const getUploadStatusConfig = (status: string, message?: string) => {
    const configs = {
      uploading: {
        progressBarColor: "bg-gray-400",
        statusText: "Uploading...!",
        statusColor: "text-gray-500",
      },
      error: {
        progressBarColor: "bg-red-500",
        statusText: message || "Error...!",
        statusColor: "text-red-500",
      },
      success: {
        progressBarColor: "bg-blue-600",
        statusText: "Successfully Uploaded!",
        statusColor: "text-blue-600",
      },
    };

    return (
      configs[status as keyof typeof configs] || {
        progressBarColor: "bg-gray-400",
        statusText: "",
        statusColor: "text-gray-500",
      }
    );
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    form.setValue("csvFile", undefined);
  };

  const handleSubmit = () => {
    const data = form.getValues();
    onSubmit(data);
  };
  const simulateUpload = (fileName: string) => {
    let progress = 0;

    const interval = setInterval(() => {
      progress += 10;

      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.name === fileName
            ? {
                ...file,
                progress,
                status: progress >= 100 ? "success" : "uploading",
              }
            : file,
        ),
      );

      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 300);
  };

  const handleFileSelect = (
    files: FileList | null,
    onChange: (file: File | undefined) => void,
  ) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    onChange(file);

    const upload: UploadFile = {
      name: file.name,
      progress: 0,
      status: "uploading",
    };

    setUploadedFiles([upload]);

    simulateUpload(file.name);
  };

  return (
    <Form {...form}>
      <div className="space-y-6 max-w-2xl">
        <div className="space-y-1">
          <Heading level={1}>Upload Church Members</Heading>
          <Text variant="muted">Upload your members in bulk using a CSV</Text>
        </div>

        <div className="space-y-3">
          <Text variant="default">Use this template</Text>
          <Button
            type="button"
            variant="ghost"
            className="flex items-center gap-2 w-full"
          >
            <Download className="w-4 h-4" />
            Download CSV Template
          </Button>
        </div>

        <FormField
          control={form.control}
          name="csvFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload file</FormLabel>
              <FormControl>
                <label
                  htmlFor="csv-upload"
                  className="border-2 border-dashed border-gray-200 rounded-lg p-8 bg-white hover:border-gray-300 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Text className="muted">
                    Click to upload file (Supported formats: .csv)
                  </Text>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) =>
                      handleFileSelect(e.target.files, field.onChange)
                    }
                  />
                </label>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <FormLabel>Uploaded files</FormLabel>
            <div className="space-y-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Text variant="default">{file.name}</Text>
                    <Text variant="muted">{file.progress}%</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${getUploadStatusConfig(file.status).progressBarColor} transition-all duration-300 rounded-full`}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="p-0 "
                      disabled={file.status === "success"}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="p-0"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Text
                    variant="default"
                    className={`${getUploadStatusConfig(file.status, file.message).statusColor}`}
                  >
                    {
                      getUploadStatusConfig(file.status, file.message)
                        .statusText
                    }
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          <Text variant="muted">
            Step <Span variant="default">{step}</Span> of {totalSteps}
          </Text>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            className="flex-1"
          >
            Skip for now
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleSubmit}
            className="flex-1 "
          >
            Upload & Continue
          </Button>
        </div>
      </div>
    </Form>
  );
}
