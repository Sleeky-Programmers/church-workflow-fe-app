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
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import {
  createTitle,
  deleteTitle,
  fetchTitlesPage,
  Title,
  updateTitle,
} from "@/services/titleService";

interface TitleManagerProps {
  readOnly?: boolean;
}

const PAGE_SIZE = 9;

export function TitleManager({ readOnly = false }: TitleManagerProps) {
  const { toast } = useToast();
  const [titles, setTitles] = useState<Title[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTitles, setTotalTitles] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Title | null>(null);

  const load = async (page = currentPage) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchTitlesPage(page, PAGE_SIZE);
      setTitles(
        [...response.data].sort((a, b) => {
          return a.sortOrder - b.sortOrder;
        }),
      );
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages || 1);
      setTotalTitles(response.pagination.itemCount);
    } catch (err: any) {
      setError(err.message || "Failed to load titles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) {
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await createTitle({ name: newName.trim(), sortOrder: totalTitles });
      setNewName("");
      await load(totalPages);
      toast({ title: "Success", description: "Title added" });
    } catch (err: any) {
      setError(err.message || "Failed to add title");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (title: Title) => {
    setError(null);
    try {
      await updateTitle(title.id, { isActive: !title.isActive });
      await load(currentPage);
    } catch (err: any) {
      setError(err.message || "Failed to update title");
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }
    const title = pendingDelete;
    setDeletingId(title.id);
    setError(null);
    try {
      await deleteTitle(title.id);
      await load(
        currentPage > 1 && titles.length === 1 ? currentPage - 1 : currentPage,
      );
      toast({ title: "Success", description: "Title deleted" });
    } catch (err: any) {
      setError(err.message || "Failed to delete title");
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  const handleStartEdit = (title: Title) => {
    setEditingId(title.id);
    setEditingName(title.name);
  };

  const handleSaveEdit = async (title: Title) => {
    if (!editingName.trim()) {
      return;
    }
    setError(null);
    try {
      await updateTitle(title.id, { name: editingName.trim() });
      setEditingId(null);
      await load(currentPage);
    } catch (err: any) {
      setError(err.message || "Failed to rename title");
    }
  };

  const handleReorder = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= titles.length) {
      return;
    }

    const reordered = [...titles];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setTitles(reordered);
    setError(null);

    try {
      await Promise.all(
        reordered.map((title, i) => {
          return title.sortOrder === i
            ? Promise.resolve()
            : updateTitle(title.id, { sortOrder: i });
        }),
      );
      await load(currentPage);
    } catch (err: any) {
      setError(err.message || "Failed to reorder titles");
      await load();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-300 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Text className="font-bold text-black">Titles</Text>
        <Text variant="muted" className="text-sm">
          {totalTitles} total
        </Text>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!readOnly && (
        <div className="flex items-center gap-2 pb-4 border-b">
          <Input
            placeholder="New title (e.g. Pastor)"
            value={newName}
            onChange={(e) => {
              return setNewName(e.target.value);
            }}
            onKeyDown={(e) => {
              return e.key === "Enter" && handleAdd();
            }}
            disabled={isSaving}
          />
          <Button onClick={handleAdd} disabled={isSaving || !newName.trim()}>
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader size="w-8 h-8" showShadow={false} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {titles.map((title, index) => {
              return (
                <div
                  key={title.id}
                  className="rounded-xl border border-gray-200 p-3 flex flex-col gap-2 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    {!readOnly && editingId === title.id ? (
                      <div className="flex flex-1 items-center gap-1">
                        <Input
                          value={editingName}
                          onChange={(e) => {
                            return setEditingName(e.target.value);
                          }}
                          className="h-8"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0"
                          onClick={() => {
                            return handleSaveEdit(title);
                          }}
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0"
                          onClick={() => {
                            return setEditingId(null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {title.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                              title.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {title.isActive ? "Active" : "Inactive"}
                          </span>
                          {title.isSystem && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                              system
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {!readOnly && editingId !== title.id && (
                      <div className="flex flex-col shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            return handleReorder(index, -1);
                          }}
                          disabled={index === 0 && currentPage === 1}
                          className="disabled:opacity-30 text-gray-500 hover:text-gray-900"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            return handleReorder(index, 1);
                          }}
                          disabled={
                            index === titles.length - 1 &&
                            currentPage === totalPages
                          }
                          className="disabled:opacity-30 text-gray-500 hover:text-gray-900"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {!readOnly && editingId !== title.id && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        size="sm"
                        variant={title.isActive ? "outline" : "secondary"}
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          return handleToggleActive(title);
                        }}
                      >
                        {title.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                          return handleStartEdit(title);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500 hover:text-red-600 ml-auto"
                        disabled={deletingId === title.id}
                        onClick={() => {
                          return setPendingDelete(title);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!titles.length && (
            <Text variant="muted" className="text-sm py-4 text-center">
              No titles configured yet.
            </Text>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1 || isLoading}
                onClick={() => {
                  return load(currentPage - 1);
                }}
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
                disabled={currentPage === totalPages || isLoading}
                onClick={() => {
                  return load(currentPage + 1);
                }}
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
        onOpenChange={(open) => {
          return !open && setPendingDelete(null);
        }}
        title={`Delete "${pendingDelete?.name}"?`}
        description="This permanently removes the title. Members using it aren't affected. This action cannot be undone."
        confirmLabel="Delete"
        isConfirming={deletingId === pendingDelete?.id}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
