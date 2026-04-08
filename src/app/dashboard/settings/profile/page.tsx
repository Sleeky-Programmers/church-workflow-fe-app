"use client";

import { useEffect, useState } from "react";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getMyChurch } from "@/lib/api";

import { EditPersonalInfoModal } from "@/components/features/dashboard/admin/edit-user-modal";
import { EditChurchModal } from "@/components/features/dashboard/admin/edit-church-modal";
import { UpdatePasswordModal } from "@/components/features/dashboard/admin/update-password-modal";

export default function UserProfilePage() {
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [church, setChurch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [openPersonalModal, setOpenPersonalModal] = useState(false);
  const [openChurchModal, setOpenChurchModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const userData = getCurrentUserProfile();
      const churchData = await getMyChurch();

      setUser(userData);
      setChurch(churchData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2">
        <Loader />
        <Text>Loading profile...</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Heading level={2}>Profile</Heading>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Avatar + Edit */}
          <div className="bg-black border rounded-xl p-4 flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white">
              {user?.firstName?.[0] || "U"}
            </div>

            <Button size="sm" onClick={() => setOpenPersonalModal(true)}>
              Edit
            </Button>
          </div>

          <div className="bg-black border rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Text className="text-gray-400">First Name</Text>
                <Text>{user?.firstName || "-"}</Text>
              </div>

              <div>
                <Text className="text-gray-400">Last Name</Text>
                <Text>{user?.lastName || "-"}</Text>
              </div>

              <div className="col-span-2">
                <Text className="text-gray-400">Email</Text>
                <Text>{user?.email || "-"}</Text>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenPasswordModal(true)}
            >
              Change Password
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black border rounded-xl p-4 flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
              {church?.name?.[0] || "C"}
            </div>

            <Button size="sm" onClick={() => setOpenChurchModal(true)}>
              Edit
            </Button>
          </div>

          <div className="bg-black border rounded-xl p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Text className="text-gray-400">Church Name</Text>
                <Text>{church?.name || "-"}</Text>
              </div>

              <div>
                <Text className="text-gray-400">Church Alias</Text>
                <Text>{church?.alias || "-"}</Text>
              </div>

              <div>
                <Text className="text-gray-400">Church Address</Text>
                <Text>{church?.address || "-"}</Text>
              </div>

              <div>
                <Text className="text-gray-400">State & Country</Text>
                <Text>
                  {[church?.state, church?.country]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditPersonalInfoModal
        onOpenChange={openPasswordModal}
        open={openPersonalModal}
        onClose={() => setOpenPersonalModal(false)}
        user={user}
        onSave={async (data: any) => {
          try {
            setUser((prev: any) => ({ ...prev, ...data }));

            toast({
              title: "Success",
              description: "Profile updated",
            });
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.message || "Update failed",
              variant: "destructive",
            });
          }
        }}
      />

      <EditChurchModal
        onOpenChange={openChurchModal}
        open={openChurchModal}
        onClose={() => setOpenChurchModal(false)}
        church={church}
        onSave={async (data: any) => {
          try {
            setChurch((prev: any) => ({ ...prev, ...data }));

            toast({
              title: "Success",
              description: "Church updated",
            });
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.message || "Update failed",
              variant: "destructive",
            });
          }
        }}
      />

      <UpdatePasswordModal
        onOpenChange={openPasswordModal}
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
        onSave={async (data: any) => {
          try {
            toast({
              title: "Success",
              description: "Password updated successfully",
            });
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.message || "Failed to update password",
              variant: "destructive",
            });
          }
        }}
      />
    </div>
  );
}
