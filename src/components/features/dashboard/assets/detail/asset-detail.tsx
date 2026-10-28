"use client";

import { ArrowLeft, Pencil, Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  AddAssetModal,
  AssetModalMode,
} from "@/components/features/dashboard/assets/add-asset-modal";
import {
  ASSET_TABS,
  ASSET_TAB_LABELS,
  Asset,
  AssetTab,
} from "@/components/features/dashboard/assets/data";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RouteConfig } from "@/config/routes";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { deleteAsset } from "@/services/assetService";

import { HistoryTab } from "./history-tab";
import { ImagesTab } from "./images-tab";
import { LogServiceModal } from "./log-service-modal";
import { MaintenanceTab } from "./maintenance-tab";
import { OverviewTab } from "./overview-tab";

const RISK_TONE: Record<string, string> = {
  High: "border-red-200 bg-red-50 text-red-600",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const STATUS_TONE: Record<string, string> = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Inactive: "border-gray-200 bg-gray-50 text-gray-600",
  Disposed: "border-gray-300 bg-gray-100 text-gray-600",
};

function isAssetTab(value: string | null): value is AssetTab {
  return !!value && (ASSET_TABS as readonly string[]).includes(value);
}

export function AssetDetail({ asset: initial }: { asset: Asset }) {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [asset, setAsset] = useState<Asset>(initial);
  const [modal, setModal] = useState<AssetModalMode | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [logService, setLogService] = useState(false);

  const rawTab = searchParams.get("tab");
  const tab: AssetTab = isAssetTab(rawTab) ? rawTab : "overview";

  const setTab = (next: AssetTab) => {
    const params = new URLSearchParams(searchParams.toString());

    if (next === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", next);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const handleSaved = (next: Asset, mode: Exclude<AssetModalMode, "view">) => {
    setAsset(next);
    toast({
      title: mode === "create" ? "Asset created" : "Asset updated",
      description: `${next.name} was saved`,
    });
  };

  const isDeleteConfirmed = deleteConfirmText.trim().toLowerCase() === "delete";

  const handleDelete = async () => {
    if (!isDeleteConfirmed) return;

    try {
      await deleteAsset(asset.id);
      toast({
        title: "Asset deleted",
        description: `${asset.name} was removed`,
      });
      router.push(RouteConfig.dashboard.assets);
    } catch {
      toast({
        title: "Failed to delete asset",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setConfirmDelete(false);
      setDeleteConfirmText("");
    }
  };

  return (
    <div className="space-y-5">
      <Link
        href={RouteConfig.dashboard.assets}
        className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assets
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 text-xl font-semibold text-gray-500">
            {asset.avatar}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {asset.name}
              </h1>

              <Badge
                variant="outline"
                className={cn(
                  "rounded-md px-3 py-1 text-[13px] font-medium",
                  STATUS_TONE[asset.status],
                )}
              >
                {asset.status}
              </Badge>

              <Badge
                variant="outline"
                className={cn(
                  "rounded-md px-3 py-1 text-[13px] font-medium",
                  RISK_TONE[asset.risk],
                )}
              >
                {asset.risk} Risk
              </Badge>
            </div>

            <p className="mt-1.5 text-sm text-gray-500">{asset.description}</p>

            <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path
                  d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.82Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="7.5" cy="7.5" r="1.25" />
              </svg>
              {asset.tag}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setModal("edit")}
            className="h-10 rounded-lg border-gray-300 px-4 text-sm font-medium"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Asset
          </Button>

          <Button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="h-10 rounded-lg bg-red-600 px-4 text-sm font-medium text-white-600 hover:bg-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Asset
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Asset sections"
        className="inline-flex w-full max-w-fit flex-wrap gap-1 rounded-xl bg-gray-100 p-1"
      >
        {ASSET_TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "rounded-lg px-5 py-2 text-sm font-medium transition-colors",
              tab === key
                ? "bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                : "text-gray-500 hover:text-gray-800",
            )}
          >
            {ASSET_TAB_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div>
        {tab === "overview" && (
          <OverviewTab asset={asset} onLogService={() => setLogService(true)} />
        )}
        {tab === "maintenance" && (
          <MaintenanceTab
            asset={asset}
            onChange={setAsset}
            onLogService={() => setLogService(true)}
          />
        )}
        {tab === "history" && <HistoryTab asset={asset} />}
        {tab === "images" && <ImagesTab asset={asset} onChange={setAsset} />}
      </div>

      <LogServiceModal
        open={logService}
        onOpenChange={setLogService}
        asset={asset}
        onLogged={setAsset}
      />

      <AddAssetModal
        open={modal !== null}
        onOpenChange={(open) => !open && setModal(null)}
        mode={modal ?? "edit"}
        asset={asset}
        onSaved={handleSaved}
      />

      <AlertDialog
        open={confirmDelete}
        onOpenChange={(open) => {
          setConfirmDelete(open);
          if (!open) setDeleteConfirmText("");
        }}
      >
        <AlertDialogContent className="max-w-md rounded-2xl bg-[#fff] p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <TriangleAlert className="h-5 w-5" />
            </span>

            <h3 className="pt-2.5 text-lg font-bold text-gray-900">
              Delete Asset
            </h3>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-2.5">
            <span className="truncate text-sm font-medium text-blue-700">
              {asset.name}
            </span>
            <span className="shrink-0 text-sm font-medium text-blue-700">
              {asset.tag}
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            This will permanently delete the asset and all its records,
            history, images, and maintenance data. This action cannot be
            undone.{" "}
            <span className="font-semibold text-gray-700">
              Be careful - only grant this permission to trusted
              administrators.
            </span>
          </p>

          <div className="mt-5 space-y-2">
            <Label
              htmlFor="delete-confirm-input"
              className="block text-[13px] font-medium leading-none text-gray-700"
            >
              Confirmation Input
              <span className="ml-0.5 align-super text-red-500">*</span>
            </Label>
            <Input
              id="delete-confirm-input"
              value={deleteConfirmText}
              onChange={(event) => setDeleteConfirmText(event.target.value)}
              placeholder='Type "Delete" to confirm'
              className="h-10 rounded-lg border-gray-300 bg-white text-sm shadow-none"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setConfirmDelete(false);
                setDeleteConfirmText("");
              }}
              className="h-10 rounded-lg border-gray-300 px-5 text-sm font-medium"
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={!isDeleteConfirmed}
              onClick={handleDelete}
              className="h-10 rounded-lg bg-red-600 px-5 text-sm font-medium text-white-600 hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
