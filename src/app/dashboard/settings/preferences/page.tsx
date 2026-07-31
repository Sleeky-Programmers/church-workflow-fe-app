"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Heading from "@/components/ui/typography/Heading";
import { NotificationSettings } from "@/types";
import {
  fetchAccountSettings,
  updateAccountSettings,
  AccountSettings,
} from "@/lib/api/admin-settings";
import { useEffect } from "react";

export default function PersonalPreferencePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    requisitionApprovals: true,
    events: true,
    birthdays: true,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [initialSettings, setInitialSettings] =
    useState<AccountSettings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await fetchAccountSettings();
        if (settings) {
          setInitialSettings(settings);
          setNotifications({
            requisitionApprovals:
              settings.personalPreferences?.requisitionApproval,
            events: settings.personalPreferences?.event,
            birthdays: settings.personalPreferences?.birthday,
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description:
            error.message ||
            "An error occurred while fetching account settings",
          variant: "destructive",
        });
      }
    }
    loadSettings();
  }, []);

  const handleToggle = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);

    try {
      if (initialSettings) {
        const updated = await updateAccountSettings({
          personalPreferences: {
            requisitionApproval: notifications.requisitionApprovals,
            event: notifications.events,
            birthday: notifications.birthdays,
          },
        });
        setInitialSettings(updated);
      }

      toast({
        title: "Success",
        description: "Your preferences have been saved",
      });

      setHasChanges(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Heading level={2}>Personal Preference</Heading>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary-600" />
          <Heading level={3}>Notification Preferences</Heading>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-1">
            <Label
              htmlFor="requisition-approvals"
              className="text-base font-normal text-gray-900 cursor-pointer"
            >
              Notify for Requisition Approvals
            </Label>
            <Switch
              id="requisition-approvals"
              checked={notifications.requisitionApprovals}
              onCheckedChange={() => handleToggle("requisitionApprovals")}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <Label
              htmlFor="events"
              className="text-base font-normal text-gray-900 cursor-pointer"
            >
              Notify for Events
            </Label>
            <Switch
              id="events"
              checked={notifications.events}
              onCheckedChange={() => handleToggle("events")}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <Label
              htmlFor="birthdays"
              className="text-base font-normal text-gray-900 cursor-pointer"
            >
              Notify for Birthdays
            </Label>
            <Switch
              id="birthdays"
              checked={notifications.birthdays}
              onCheckedChange={() => handleToggle("birthdays")}
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader size="w-4 h-4" showShadow={false} />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
