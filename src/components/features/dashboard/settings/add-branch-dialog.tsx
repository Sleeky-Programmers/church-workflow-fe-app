"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

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
import Heading from "@/components/ui/typography/Heading";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { createBranch } from "@/services/branchService";

interface Props {
  onSaved: () => void | Promise<void>;
}

export function AddBranchDialog({ onSaved }: Props) {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");

  const resetForm = () => {
    setName("");
    setAlias("");
    setAddress("");
    setCountry("");
    setState("");
  };

  async function handleSave() {
    if (!name.trim()) {
      toast({
        title: "Missing information",
        description: "Branch name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await createBranch({
        name: name.trim(),
        alias: alias.trim() || undefined,
        address: address.trim() || undefined,
        country: country.trim() || undefined,
        state: state.trim() || undefined,
      });

      await onSaved();

      toast({ title: "Success", description: "Branch created successfully" });
      resetForm();
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create branch",
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
          Add Branch
        </Button>
      </DialogTrigger>

      <DialogContent
        showClose={false}
        mobileSheet={isMobile}
        className="sm:max-w-[480px] overflow-hidden p-0"
      >
        <div className="flex justify-between items-center border-b p-3">
          <Heading level={2}>Add Branch</Heading>
          <DialogClose asChild>
            <Button size="icon" variant="outline">
              <X className="w-4 h-4" />
            </Button>
          </DialogClose>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-1.5">
            <Label>Branch Name</Label>
            <Input
              placeholder="e.g. East Campus"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Short Name / Alias (optional)</Label>
            <Input
              placeholder="e.g. East"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Address (optional)</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>State (optional)</Label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Country (optional)</Label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={isSaving}
              />
            </div>
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
              "Save Branch"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
