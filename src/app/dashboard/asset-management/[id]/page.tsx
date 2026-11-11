"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AssetDetail } from "@/components/features/dashboard/assets/detail/asset-detail";
import { Asset } from "@/components/features/dashboard/assets/data";
import { Button } from "@/components/ui/button";
import { RouteConfig } from "@/config/routes";
import { fetchAssetById } from "@/services/assetService";

export default function AssetDetailRoutePage() {
  const params = useParams();
  const raw = params?.id;
  const id = Array.isArray(raw) ? raw[0] : raw;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    setLoading(true);
    setNotFound(false);

    fetchAssetById(id)
      .then(setAsset)
      .catch(() => {
        return setNotFound(true);
      })
      .finally(() => {
        return setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-gray-100" />
        <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (notFound || !asset) {
    return (
      <div className="space-y-4">
        <Link
          href={RouteConfig.dashboard.assets}
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assets
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <p className="text-base font-semibold text-gray-900">
            Asset not found
          </p>
          <p className="mt-1 text-sm text-gray-500">
            This asset may have been deleted, or the link is incorrect.
          </p>

          <div className="mt-5 flex justify-center">
            <Button
              type="button"
              className="h-9 rounded-lg bg-primary px-5 text-sm font-medium text-white-600 hover:bg-primary-600"
              onClick={() => {
                window.location.href = RouteConfig.dashboard.assets;
              }}
            >
              Back to Assets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <AssetDetail asset={asset} />;
}
