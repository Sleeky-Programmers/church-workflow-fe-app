"use client";

import { Edit, LockOpenIcon, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { EditChurchModal } from "@/components/features/dashboard/admin/edit-church-modal";
import { EditPersonalInfoModal } from "@/components/features/dashboard/admin/edit-user-modal";
import { UpdatePasswordModal } from "@/components/features/dashboard/admin/update-password-modal";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { CURRENCY_CATALOG_BY_CODE } from "@/lib/currency-catalog";
import { useUserStore } from "@/stores/useUserStore";

export default function UserProfilePage() {
  const {
    user,
    church,
    isLoading,
    error,
    fetchUserData,
    updateUser,
    updateChurch,
    getUserFullName,
    getUserChurchRole,
  } = useUserStore();

  const [openPersonalModal, setOpenPersonalModal] = useState(false);
  const [openChurchModal, setOpenChurchModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2">
        <Loader />
        <Text>Loading profile...</Text>
      </div>
    );
  }

  const fullName = getUserFullName();
  const churchRole = getUserChurchRole();
  const defaultCurrency = church?.defaultCurrency
    ? CURRENCY_CATALOG_BY_CODE[church.defaultCurrency]
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Heading level={2}>User & Church Info</Heading>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUserData(true)}
          className="gap-2"
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Section */}
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-4 flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
              {user?.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold">
                  {fullName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex flex-col flex-1 ml-4">
              <Text variant="label" className="font-semibold">
                {fullName}
              </Text>
              <Text variant="muted" className="text-sm">
                {churchRole}
              </Text>
              <Text variant="muted" className="text-sm">
                {user?.email}
              </Text>
            </div>

            <Button
              variant="outline"
              className="flex items-center gap-2 h-8 sm:h-9"
              size="sm"
              onClick={() => setOpenPersonalModal(true)}
            >
              <Edit className="h-4 w-4" />
              <Span className="hidden sm:inline">Edit</Span>
            </Button>
          </div>

          <div className="bg-white border rounded-xl p-6 space-y-6">
            <Text variant="label" className="font-semibold">
              Personal Information
            </Text>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Text className="text-gray-500 text-sm">First Name</Text>
                <Text className="font-medium">{user?.firstName || "-"}</Text>
              </div>

              <div>
                <Text className="text-gray-500 text-sm">Last Name</Text>
                <Text className="font-medium">{user?.lastName || "-"}</Text>
              </div>

              <div className="col-span-2">
                <Text className="text-gray-500 text-sm">Email</Text>
                <Text className="font-medium">{user?.email || "-"}</Text>
              </div>

              <div className="col-span-2">
                <Text className="text-gray-500 text-sm">Phone Number</Text>
                <Text className="font-medium">{user?.phoneNumber || "-"}</Text>
              </div>

              <div className="col-span-2">
                <Text className="text-gray-500 text-sm">Church Role</Text>
                <Text className="font-medium">{churchRole}</Text>
              </div>

              <div className="col-span-2">
                <Text className="text-gray-500 text-sm">Account Status</Text>
                <Text className="font-medium text-green-600">
                  {user?.isVerified ? "Verified" : "Not Verified"}
                </Text>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenPasswordModal(true)}
              className="gap-2"
            >
              <LockOpenIcon className="h-4 w-4" />
              Change Password
            </Button>
          </div>
        </div>

        {/* Church Section */}
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-4 flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
              {church?.logoUrl ? (
                <Image
                  src={church.logoUrl}
                  alt="Church Logo"
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold">
                  {church?.name?.charAt(0).toUpperCase() || "C"}
                </span>
              )}
            </div>

            <div className="flex flex-col flex-1 ml-4">
              <Text variant="label" className="font-semibold">
                {church?.name || "Your Church"}
              </Text>
              {church?.alias && (
                <Text variant="muted" className="text-sm">
                  @{church.alias}
                </Text>
              )}
              <Text variant="muted" className="text-sm">
                {[church?.state, church?.country].filter(Boolean).join(", ") ||
                  "Location not set"}
              </Text>
            </div>

            <Button
              variant="outline"
              className="flex items-center gap-2 h-8 sm:h-9"
              onClick={() => setOpenChurchModal(true)}
              size="sm"
            >
              <Edit className="h-4 w-4" />
              <Span className="hidden sm:inline">Edit</Span>
            </Button>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <Text variant="label" className="font-semibold">
              Church Information
            </Text>
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="col-span-2">
                <Text className="text-gray-500 text-sm">Church Name</Text>
                <Text className="font-medium">{church?.name || "-"}</Text>
              </div>

              <div>
                <Text className="text-gray-500 text-sm">Church Alias</Text>
                <Text className="font-medium">{church?.alias || "-"}</Text>
              </div>

              <div>
                <Text className="text-gray-500 text-sm">Default Currency</Text>
                <Text className="font-medium">
                  {defaultCurrency
                    ? `${defaultCurrency.code} - ${defaultCurrency.name} (${defaultCurrency.symbol})`
                    : church?.defaultCurrency || "NGN"}
                </Text>
              </div>

              <div className="col-span-2">
                <Text className="text-gray-500 text-sm">Address</Text>
                <Text className="font-medium">{church?.address || "-"}</Text>
              </div>

              <div>
                <Text className="text-gray-500 text-sm">State</Text>
                <Text className="font-medium">{church?.state || "-"}</Text>
              </div>

              <div>
                <Text className="text-gray-500 text-sm">Country</Text>
                <Text className="font-medium">{church?.country || "-"}</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditPersonalInfoModal
        open={openPersonalModal}
        onOpenChange={setOpenPersonalModal}
        user={user}
        onUpdated={(updated: any) => {
          updateUser(updated);
          // Optionally force refresh to get latest from server
          fetchUserData(true);
        }}
      />

      <EditChurchModal
        open={openChurchModal}
        onOpenChange={setOpenChurchModal}
        church={church}
        onUpdated={(updated: any) => {
          updateChurch(updated);
          fetchUserData(true);
        }}
      />

      <UpdatePasswordModal
        open={openPasswordModal}
        onOpenChange={setOpenPasswordModal}
      />
    </div>
  );
}
