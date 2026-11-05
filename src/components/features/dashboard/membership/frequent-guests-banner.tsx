"use client";

import { UserCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MembershipStatus } from "@/lib/enums";
import { fetchFrequentGuests, updateMember } from "@/services/memberService";
import { FrequentGuest } from "@/types";

/**
 * Prompt to convert guests who attended 4+ services in 60 days. They already
 * count towards the member limit; converting lets them join groups.
 */
export function FrequentGuestsBanner({
  onConverted,
}: {
  onConverted?: () => void;
}) {
  const { toast } = useToast();
  const [guests, setGuests] = useState<FrequentGuest[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetchFrequentGuests();
      setGuests(res.data || []);
    } catch {
      setGuests([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!guests.length) return null;

  const convert = async (guest: FrequentGuest) => {
    setBusyId(guest._id);
    try {
      await updateMember(guest._id, {
        membershipStatus: MembershipStatus.MEMBER,
      });
      toast({
        title: "Changed to member",
        description: `${guest.fullName} is now a member.`,
      });
      setGuests((prev) => prev.filter((g) => g._id !== guest._id));
      onConverted?.();
    } catch (err: any) {
      toast({
        title: "Couldn't change to member",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-4 mt-3 mb-1 sm:mx-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex gap-2">
          <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
          <p className="text-gray-800">
            <span className="font-semibold">
              {guests.length} {guests.length === 1 ? "guest has" : "guests have"}{" "}
              attended 4 or more services in the last 60 days.
            </span>{" "}
            They now count towards your member limit. Change them to members
            to add them to departments and teams.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Hide" : "Review"}
        </Button>
      </div>

      {expanded && (
        <ul className="mt-3 divide-y divide-blue-100 rounded-md bg-white">
          {guests.map((guest) => (
            <li
              key={guest._id}
              className="flex items-center justify-between gap-2 px-3 py-2"
            >
              <span className="truncate text-gray-900">{guest.fullName}</span>
              <Button
                size="sm"
                disabled={busyId === guest._id}
                onClick={() => convert(guest)}
              >
                {busyId === guest._id ? "Saving…" : "Change to member"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
