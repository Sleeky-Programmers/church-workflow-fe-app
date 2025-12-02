"use client";

import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { DepartmentRow } from "@/types";
import { InputField } from "@/components/form/InputField";

interface Props {
  data: DepartmentRow[];
  onSave?: (payload: { name: string; hod: string; status: string; description: string }) => void;
}

export default function AddDepartmentDialog({ data, onSave }: Props) {
  const [open, setOpen] = useState(false);

  const [departmentName, setDepartmentName] = useState("");
  const [hod, setHod] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");

  const hodOptions = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.hod?.name).filter(Boolean))) as string[];
  }, [data]);

  function handleSave() {
    const payload = {
      name: departmentName,
      hod,
      status,
      description,
    };
    if (onSave) {
      onSave(payload);
    }
    setDepartmentName("");
    setHod("");
    setStatus("");
    setDescription("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add a department
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0">
        <Card className="shadow-none border-0">
          <CardHeader>
            <CardTitle>Add a department</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <InputField
                label="Department name"
                as="input"
                type="text"
                placeholder="Department name"
                value={departmentName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepartmentName((e).target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Assign HOD"
                  as="select"
                  value={hod}
                  onValueChange={(v) => setHod(v)}
                  options={hodOptions.map((hodOption) => ({ value: hodOption, label: hodOption }))}
                  selectPlaceholder="Assign HOD"
                />

                <InputField
                  label="Status"
                  as="select"
                  value={status}
                  onValueChange={(value) => setStatus(value)}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  selectPlaceholder="Select status"
                />
              </div>

              <InputField
                label="Add a description"
                as="textarea"
                placeholder="Description..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter>
            <div className="ml-auto flex items-center gap-3">
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>

              <Button onClick={handleSave}>Save</Button>
            </div>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
