"use client";

import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { deleteAssetImage, uploadAssetImage } from "@/services/assetService";

import { Asset } from "../data";
import Image from "next/image";

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg"];
const PAGE_SIZE_OPTIONS = [9, 12];

interface PendingImage {
  file: File;
  url: string;
}

type PageItem = number | "ellipsis";

function getPageItems(totalPages: number, currentPage: number): PageItem[] {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => {
      return index + 1;
    });
  }

  if (currentPage <= 3 || currentPage >= totalPages - 2) {
    return [1, 2, 3, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

export function ImagesTab({
  asset,
  onChange,
}: {
  asset: Asset;
  onChange: (next: Asset) => void;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const totalPages = Math.max(1, Math.ceil(asset.images.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    return getPageItems(totalPages, currentPage);
  }, [totalPages, currentPage]);
  const paginatedImages = asset.images.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const rangeStart = asset.images.length ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(currentPage * pageSize, asset.images.length);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const clearPending = () => {
    pending.forEach((item) => {
      return URL.revokeObjectURL(item.url);
    });
    setPending([]);
  };

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const validFiles: File[] = [];
    const rejected: string[] = [];

    Array.from(files).forEach((file) => {
      if (!ACCEPTED.includes(file.type) || file.size > MAX_SIZE) {
        rejected.push(file.name);
        return;
      }
      validFiles.push(file);
    });

    if (rejected.length) {
      toast({
        title: "Some files were skipped",
        description: "JPG, PNG only. Max 5MB per image.",
        variant: "destructive",
      });
    }

    if (!validFiles.length) {
      return;
    }

    setPending((prev) => {
      return [
        ...prev,
        ...validFiles.map((file) => {
          return { file, url: URL.createObjectURL(file) };
        }),
      ];
    });
  };

  const removePending = (index: number) => {
    setPending((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((_, i) => {
        return i !== index;
      });
    });
  };

  const confirmUpload = async () => {
    if (!pending.length) {
      return;
    }

    setUploading(true);
    try {
      let updated = asset;
      for (const item of pending) {
        updated = await uploadAssetImage(asset.id, item.file);
      }
      onChange(updated);
      toast({
        title: "Images added",
        description: `${pending.length} image${pending.length > 1 ? "s" : ""} attached to ${asset.name}`,
      });
      clearPending();
    } catch {
      toast({
        title: "Failed to upload images",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteIndex === null) {
      return;
    }

    const target = asset.images[deleteIndex];
    if (!target) {
      return;
    }

    try {
      const updated = await deleteAssetImage(asset.id, target.id);
      onChange(updated);
    } catch {
      toast({
        title: "Failed to delete image",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setDeleteIndex(null);
    }
  };

  const openPicker = () => {
    return inputRef.current?.click();
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">Images</h2>

        <div className="flex items-center gap-3">
          {asset.images.length > 0 && (
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[110px] rounded-lg border-gray-300 bg-white text-sm text-gray-700 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => {
                  return (
                    <SelectItem key={size} value={String(size)}>
                      {size} / page
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}

          <Button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-white-600 hover:bg-primary-600"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Images"}
          </Button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        className="hidden"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {asset.images.length === 0 ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => {
            return setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
          onClick={openPicker}
          className={
            "mt-5 flex min-h-[300px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-gray-50" +
            (dragging ? " border-primary/60 bg-blue-50/40" : "")
          }
        >
          <ImagePlus className="h-7 w-7 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">
            No images uploaded
          </p>
          <p className="text-xs text-gray-400">
            JPG, PNG only. Max 5MB per image.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedImages.map((image, localIndex) => {
              const index = (currentPage - 1) * pageSize + localIndex;
              return (
                <figure
                  key={image.id}
                  className="group relative rounded-xl border border-gray-200 bg-white"
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gray-100">
                    {image.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <Image
                        src={image.url}
                        alt={image.name}
                        className="h-full w-full object-cover" width={256} height={256} unoptimized />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                        <ImagePlus className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    aria-label={`Delete image ${index + 1}`}
                    onClick={() => {
                      return setDeleteIndex(index);
                    }}
                    className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-md transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <figcaption className="px-4 py-3 text-xs text-gray-500">
                    Uploaded by{" "}
                    <span className="font-medium text-gray-700">
                      {image.uploadedBy}
                    </span>{" "}
                    &bull; {image.uploadedDate}
                  </figcaption>
                </figure>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              JPG, PNG only. Max 5MB per image.
            </p>

            {asset.images.length > 0 && (
              <p className="text-xs text-gray-500">
                Showing {rangeStart}–{rangeEnd} of {asset.images.length} images
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-3 flex justify-end">
              <Pagination className="m-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Go to previous page"
                      disabled={currentPage === 1}
                      onClick={() => {
                        return setPage((value) => {
                          return Math.max(1, value - 1);
                        });
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </PaginationItem>

                  {pageItems.map((item, index) => {
                    return item === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <Button
                          variant={currentPage === item ? "default" : "outline"}
                          size="sm"
                          aria-label={`Go to page ${item}`}
                          aria-current={
                            currentPage === item ? "page" : undefined
                          }
                          onClick={() => {
                            return setPage(item);
                          }}
                          className="w-10"
                        >
                          {item}
                        </Button>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Go to next page"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        return setPage((value) => {
                          return Math.min(totalPages, value + 1);
                        });
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      <AlertDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => {
          return !open && setDeleteIndex(null);
        }}
      >
        <AlertDialogContent className="max-w-md rounded-2xl bg-[#fff] p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <TriangleAlert className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900">
                Delete Image
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  Image {String((deleteIndex ?? 0) + 1).padStart(2, "0")}
                </span>
                ? This action cannot be undone. Be careful who has this access.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                return setDeleteIndex(null);
              }}
              className="h-10 rounded-lg border-gray-300 px-5 text-sm font-medium"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={confirmDelete}
              className="h-10 rounded-lg bg-red-600 px-5 text-sm font-medium text-white-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={pending.length > 0}
        onOpenChange={(open) => {
          return !open && !uploading && clearPending();
        }}
      >
        <DialogContent
          showClose={false}
          className="flex max-h-[85vh] w-[min(92vw,560px)] flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-[#fff] p-0 shadow-2xl backdrop-blur-none"
        >
          <div className="flex items-start justify-between px-6 pb-2 pt-6">
            <DialogTitle className="pr-8 text-xl font-bold text-gray-900">
              Preview Images
            </DialogTitle>

            <button
              type="button"
              aria-label="Close"
              disabled={uploading}
              onClick={() => {
                return clearPending();
              }}
              className="-mr-1 rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
            <p className="pt-1 text-sm text-gray-500">
              Confirm these are the right images before uploading to{" "}
              {asset.name}.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {pending.map((item, index) => {
                return (
                  <figure
                    key={item.url}
                    className="group relative rounded-xl border border-gray-200 bg-gray-100"
                  >
                    <div className="relative h-28 w-full overflow-hidden rounded-t-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <Image
                        src={item.url}
                        alt={item.file.name}
                        className="h-full w-full object-cover" width={256} height={256} unoptimized />
                    </div>

                    <button
                      type="button"
                      aria-label={`Remove ${item.file.name}`}
                      disabled={uploading}
                      onClick={() => {
                        return removePending(index);
                      }}
                      className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white-600 shadow-md transition-opacity hover:bg-red-600 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <figcaption className="truncate px-2 py-1.5 text-[11px] text-gray-500">
                      {item.file.name}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => {
                return clearPending();
              }}
              className="h-10 rounded-lg border-gray-300 px-5 text-sm font-medium"
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={uploading || !pending.length}
              onClick={confirmUpload}
              className="h-10 rounded-lg bg-primary px-5 text-sm font-medium text-white-600 hover:bg-primary-600"
            >
              {uploading
                ? "Uploading..."
                : `Upload ${pending.length} Image${pending.length > 1 ? "s" : ""}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
