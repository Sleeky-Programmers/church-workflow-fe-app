"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import {
  createOfferingType,
  deleteOfferingType,
  fetchOfferingTypes,
  OfferingType,
  setDefaultOfferingType,
  updateOfferingType,
} from "@/services/givingService";

const PAGE_SIZE = 9;

export function OfferingTypeManager() {
  const { toast } = useToast();
  const [types, setTypes] = useState<OfferingType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<OfferingType | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(types.length / PAGE_SIZE));
  const pagedTypes = useMemo(
    () => types.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [types, currentPage],
  );

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOfferingTypes();
      setTypes([...data].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err: any) {
      setError(err.message || "Failed to load offering types");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the current page in range as the list grows/shrinks.
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      await createOfferingType({ name: newName.trim(), sortOrder: types.length });
      setNewName("");
      await load();
      setCurrentPage(Math.max(1, Math.ceil((types.length + 1) / PAGE_SIZE)));
      toast({ title: "Success", description: "Offering type added" });
    } catch (err: any) {
      setError(err.message || "Failed to add offering type");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (type: OfferingType) => {
    setError(null);
    try {
      await updateOfferingType(type.id, { isActive: !type.isActive });
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to update offering type");
    }
  };

  const handleSetDefault = async (type: OfferingType) => {
    setError(null);
    try {
      await setDefaultOfferingType(type.id);
      await load();
      toast({
        title: "Success",
        description: `${type.name} is now the default offering type`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to set default offering type");
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const type = pendingDelete;
    setDeletingId(type.id);
    setError(null);
    try {
      await deleteOfferingType(type.id);
      await load();
      toast({ title: "Success", description: "Offering type deleted" });
    } catch (err: any) {
      setError(err.message || "Failed to delete offering type");
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  const handleStartEdit = (type: OfferingType) => {
    setEditingId(type.id);
    setEditingName(type.name);
  };

  const handleSaveEdit = async (type: OfferingType) => {
    if (!editingName.trim()) return;
    setError(null);
    try {
      await updateOfferingType(type.id, { name: editingName.trim() });
      setEditingId(null);
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to rename offering type");
    }
  };

  const handleReorder = async (absoluteIndex: number, direction: -1 | 1) => {
    const targetIndex = absoluteIndex + direction;
    if (targetIndex < 0 || targetIndex >= types.length) return;

    const reordered = [...types];
    const [moved] = reordered.splice(absoluteIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setTypes(reordered);
    setError(null);

    try {
      await Promise.all(
        reordered.map((type, i) =>
          type.sortOrder === i
            ? Promise.resolve()
            : updateOfferingType(type.id, { sortOrder: i }),
        ),
      );
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to reorder offering types");
      await load();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-300 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Text className="font-bold text-black">Offering Types</Text>
        <Text variant="muted" className="text-sm">
          {types.length} total
        </Text>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-2 pb-4 border-b">
        <Input
          placeholder="New offering type name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          disabled={isSaving}
        />
        <Button onClick={handleAdd} disabled={isSaving || !newName.trim()}>
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader size="w-8 h-8" showShadow={false} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {pagedTypes.map((type, pageIndex) => {
              const absoluteIndex = (currentPage - 1) * PAGE_SIZE + pageIndex;
              return (
                <div
                  key={type.id}
                  className="rounded-xl border border-gray-200 p-3 flex flex-col gap-2 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    {editingId === type.id ? (
                      <div className="flex flex-1 items-center gap-1">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="h-8"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0"
                          onClick={() => handleSaveEdit(type)}
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {type.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span
                            className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                              type.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {type.isActive ? "Active" : "Inactive"}
                          </span>
                          {type.isDefault && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                              default
                            </span>
                          )}
                          {type.isSystem && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                              system
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {editingId !== type.id && (
                      <div className="flex flex-col shrink-0">
                        <button
                          type="button"
                          onClick={() => handleReorder(absoluteIndex, -1)}
                          disabled={absoluteIndex === 0}
                          className="disabled:opacity-30 text-gray-500 hover:text-gray-900"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReorder(absoluteIndex, 1)}
                          disabled={absoluteIndex === types.length - 1}
                          className="disabled:opacity-30 text-gray-500 hover:text-gray-900"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId !== type.id && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSetDefault(type)}
                        title={
                          type.isDefault ? "Default offering type" : "Set as default"
                        }
                      >
                        <Star
                          className={`w-4 h-4 ${
                            type.isDefault
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300 hover:text-amber-400"
                          }`}
                        />
                      </button>
                      <Button
                        size="sm"
                        variant={type.isActive ? "outline" : "secondary"}
                        className="h-7 px-2 text-xs"
                        onClick={() => handleToggleActive(type)}
                      >
                        {type.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleStartEdit(type)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500 hover:text-red-600 ml-auto"
                        disabled={deletingId === type.id}
                        onClick={() => setPendingDelete(type)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!types.length && (
            <Text variant="muted" className="text-sm py-4 text-center">
              No offering types configured yet.
            </Text>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Text variant="muted" className="text-sm">
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name}"?`}
        description="This permanently removes the offering type. If it's used by existing giving records, deletion will be blocked — deactivate it instead. This action cannot be undone."
        confirmLabel="Delete"
        isConfirming={deletingId === pendingDelete?.id}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
