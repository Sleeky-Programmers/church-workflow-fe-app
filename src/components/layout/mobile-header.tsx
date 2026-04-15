"use client";

import { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/typography/Heading";

type Props = {
  title: string;
  rightAction?: ReactNode;
};

export default function MobileHeader({ title, rightAction }: Props) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b">
      <div className="flex items-center justify-between h-14 px-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-5 w-5 shrink-0" />

          <Heading level={3} text={title} className="leading-none" />
        </div>

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
