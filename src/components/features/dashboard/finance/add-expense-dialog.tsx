"use client";

import { format } from "date-fns";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Heading from "@/components/ui/typography/Heading";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { createExpense } from "@/services/expenseService";
import { fetchDepartments } from "@/services/departmentService";

interface Props {
  onSaved: () => void | Promise<void>;
}

export function AddExpenseDialog({ onSaved }: Props) {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [departmentId, setDepartmentId] = useState<string>("");

  useEffect(() => {
    if (!open) {
      return;
    }
    fetchDepartments({ page: 1, limit: 100 })
      .then((res) => {
        return setDepartments(
          res.data.map((d) => {
            return { id: d.id, name: d.name };
          }),
        );
      })
      .catch(() => {});
  }, [open]);

  const resetForm = () => {
    setCategory("");
    setDescription("");
    setAmount("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setDepartmentId("");
  };

  async function handleSave() {
    const parsedAmount = Number(amount);
    if (
      !category.trim() ||
      !description.trim() ||
      !parsedAmount ||
      parsedAmount <= 0
    ) {
      toast({
        title: "Missing information",
        description: "Category, description and a valid amount are required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await createExpense({
        category: category.trim(),
        description: description.trim(),
        amount: parsedAmount,
        date,
        departmentId: departmentId || undefined,
      });

      await onSaved();

      toast({
        title: "Success",
        description: "Expense recorded successfully",
      });
      resetForm();
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record expense",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </DialogTrigger>

      <DialogContent
        showClose={false}
        mobileSheet={isMobile}
        className="sm:max-w-[480px] overflow-hidden p-0"
      >
        <div className="flex justify-between items-center border-b p-3">
          <Heading level={2}>Record Expense</Heading>
          <DialogClose asChild>
            <Button size="icon" variant="outline">
              <X className="w-4 h-4" />
            </Button>
          </DialogClose>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input
              placeholder="e.g. Utilities, Maintenance, Transport"
              value={category}
              onChange={(e) => {
                return setCategory(e.target.value);
              }}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => {
                return setDescription(e.target.value);
              }}
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <Input
                type="number"
                min={0}
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  return setAmount(e.target.value);
                }}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => {
                  return setDate(e.target.value);
                }}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Department (optional)</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger>
                <SelectValue placeholder="No specific department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => {
                  return (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end border-t px-6 py-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader size="w-4 h-4" showShadow={false} />
                Saving...
              </span>
            ) : (
              "Save Expense"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
