"use client";

import { useState } from "react";
import { HelpCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ScheduleDeletionDialog } from "@/components/features/dashboard/admin/schedule-deletion-modal";
import { PrivacySettings, AccountDeletionStatus } from "@/types";
import Heading from "@/components/ui/typography/Heading";
import { Text, Span } from "@/components/ui/typography/Text";

export default function AccountSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    birthdayCalendar: true,
    birthdayReminders: false,
    emailAlerts: true,
  });

  const [deletionStatus, setDeletionStatus] =
    useState<AccountDeletionStatus>("none");
  const [waitingPeriodDays, setWaitingPeriodDays] = useState<number | null>(
    null,
  );

  const handlePrivacyToggle = (key: keyof PrivacySettings) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    toast({
      title: "Privacy setting updated",
      description: "Your privacy preferences have been saved",
    });
  };

  const handleScheduleDeletion = async (days: number) => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setDeletionStatus("scheduled");
      setWaitingPeriodDays(days);
      setIsScheduleDialogOpen(false);

      toast({
        title: "Account deletion scheduled",
        description: `Your account will be deleted in ${days} days. You can cancel anytime within this period.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule deletion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnscheduleDeletion = async () => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setDeletionStatus("none");
      setWaitingPeriodDays(null);

      toast({
        title: "Account deletion cancelled",
        description: "Your account deletion has been cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel deletion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Heading level={3}>Personal Privacy</Heading>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Heading level={3}>User Privacy Controls</Heading>
          <HelpCircle className="h-5 w-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary-600 flex-shrink-0" />
              <Label
                htmlFor="birthday-calendar"
                className="text-base font-normal text-gray-700 cursor-pointer"
              >
                Allow display of birthday on calendar
              </Label>
            </div>
            <Switch
              id="birthday-calendar"
              checked={privacy.birthdayCalendar}
              onCheckedChange={() => handlePrivacyToggle("birthdayCalendar")}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Span className="h-2 w-2 rounded-full bg-primary-600 flex-shrink-0" />
              <Label
                htmlFor="birthday-reminders"
                className="text-base font-normal text-gray-700 cursor-pointer"
              >
                Receive birthday shout-outs or reminders
              </Label>
            </div>
            <Switch
              id="birthday-reminders"
              checked={privacy.birthdayReminders}
              onCheckedChange={() => handlePrivacyToggle("birthdayReminders")}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Span className="h-2 w-2 rounded-full bg-primary-600 flex-shrink-0" />
              <Label
                htmlFor="email-alerts"
                className="text-base font-normal text-gray-700 cursor-pointer"
              >
                Receive email alerts for system activities
              </Label>
            </div>
            <Switch
              id="email-alerts"
              checked={privacy.emailAlerts}
              onCheckedChange={() => handlePrivacyToggle("emailAlerts")}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Heading level={3}>Data Management</Heading>

        {deletionStatus === "none" ? (
          <div className="flex items-start gap-3 grid-cols-1">
            <div className="flex items-start gap-3">
              <Span className="h-2 w-2 rounded-full bg-primary-600 flex-shrink-0 mt-2" />
              <Button
                variant="outline"
                onClick={() => setIsScheduleDialogOpen(true)}
                className="border-destructive-300 text-destructive-600 hover:bg-red-50"
              >
                Delete Account
              </Button>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
              <Info className="h-4 w-4 text-primary-600 flex-shrink-0" />
              <Text variant="default">
                Schedule the deletion of your account.
              </Text>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary-600 flex-shrink-0 mt-2" />
              <Button
                variant="outline"
                onClick={handleUnscheduleDeletion}
                disabled={isLoading}
                className="border-destructive-300 text-destructive-600 hover:bg-red-50"
              >
                {isLoading ? "Processing..." : "Unschedule Account Deletion"}
              </Button>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
              <Info className="h-4 w-4 text-primary-600 flex-shrink-0" />
              <Text variant="default">
                Your account has been scheduled for deletion
                {waitingPeriodDays && ` in ${waitingPeriodDays} days`}.
              </Text>
            </div>
          </div>
        )}
      </div>

      <ScheduleDeletionDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        onConfirm={handleScheduleDeletion}
        isLoading={isLoading}
      />
    </div>
  );
}
