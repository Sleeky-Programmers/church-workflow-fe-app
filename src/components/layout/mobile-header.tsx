"use client";

import { MoreVertical } from "lucide-react";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/typography/Heading";

type Props = {
  title: string;
  rightAction?: ReactNode;
};

/**
 * In-page title row for the mobile views. The menu button and pinned top bar
 * come from the dashboard layout (MobileTopBar), so this only carries the
 * page title and its actions.
 */
export default function MobileHeader({ title, rightAction }: Props) {
  return (
    <div className="bg-white border-b">
      <div className="flex items-center justify-between h-12 px-3">
        <Heading level={3} text={title} className="leading-none" />

        {rightAction ?? (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex items-center justify-center shrink-0"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
