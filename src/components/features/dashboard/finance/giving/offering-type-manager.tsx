"use client";

import { ArrowDown, ArrowUp, Check, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import {
  createOfferingType,
  fetchOfferingTypes,
  OfferingType,
  updateOfferingType,
} from "@/services/givingService";

export function OfferingTypeManager() {
  const { toast } = useToast();
  const [types, setTypes] = useState<OfferingType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await fetchOfferingTypes();
      setTypes([...data].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load offering types",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
      await createOfferingType({
        name: newName.trim(),
        sortOrder: types.length,
      });
      setNewName("");
      await load();
      toast({ title: "Success", description: "Offering type added" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add offering type",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (type: OfferingType) => {
    try {
      await updateOfferingType(type.id, { isActive: !type.isActive });
      await load();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update offering type",
        variant: "destructive",
      });
    }
  };

  const handleStartEdit = (type: OfferingType) => {
    setEditingId(type.id);
    setEditingName(type.name);
  };

  const handleSaveEdit = async (type: OfferingType) => {
    if (!editingName.trim()) return;
    try {
      await updateOfferingType(type.id, { name: editingName.trim() });
      setEditingId(null);
      await load();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to rename offering type",
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= types.length) return;

    const reordered = [...types];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setTypes(reordered);

    try {
      await Promise.all(
        reordered.map((type, i) =>
          type.sortOrder === i
            ? Promise.resolve()
            : updateOfferingType(type.id, { sortOrder: i }),
        ),
      );
      await load();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reorder offering types",
        variant: "destructive",
      });
      await load();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-300 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Text className="font-bold text-black">Offering Types</Text>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader size="w-8 h-8" showShadow={false} />
        </div>
      ) : (
        <div className="space-y-2">
          {types.map((type, index) => (
            <div
              key={type.id}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => handleReorder(index, -1)}
                  disabled={index === 0}
                  className="disabled:opacity-30"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(index, 1)}
                  disabled={index === types.length - 1}
                  className="disabled:opacity-30"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {editingId === type.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="h-8"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleSaveEdit(type)}
                  >
                    <Check className="w-4 h-4 text-green-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  className="flex-1 text-left text-sm font-medium"
                  onClick={() => handleStartEdit(type)}
                >
                  {type.name}
                  {type.isSystem && (
                    <span className="ml-2 text-xs text-gray-400">(system)</span>
                  )}
                </button>
              )}

              <Button
                size="sm"
                variant={type.isActive ? "outline" : "secondary"}
                onClick={() => handleToggleActive(type)}
              >
                {type.isActive ? "Active" : "Inactive"}
              </Button>
            </div>
          ))}

          {!types.length && (
            <Text variant="muted" className="text-sm">
              No offering types configured yet.
            </Text>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t">
        <Input
          placeholder="New offering type name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={isSaving}
        />
        <Button onClick={handleAdd} disabled={isSaving || !newName.trim()}>
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
