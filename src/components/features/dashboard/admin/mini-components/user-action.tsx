"use client";

import { MoreVertical } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserStatus, UserAction, canPerformAction } from "@/types/user";
import { getAvailableActions, getActionItemClasses, cn } from "@/lib/utils";
import { Span } from "@/components/ui/typography/Text";
import { RouteConfig } from "@/config/routes";

type UserActionsMenuProps = {
  userId: string;
  userStatus: UserStatus;
  onActionSelect: (action: UserAction) => void;
  canManageBranchAccess?: boolean;
  isCurrentUser?: boolean;
};

export function UserActionsMenu({
  userId,
  userStatus,
  onActionSelect,
  canManageBranchAccess = false,
  isCurrentUser = false,
}: UserActionsMenuProps) {
  const availableActions = getAvailableActions(userStatus).filter(
    (action) =>
      action.value !== "manage_branch_access" || canManageBranchAccess,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Span className="sr-only">Open menu</Span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableActions.map((action) => {
          // Admins can't take actions on their own account - only viewing
          // their own details is allowed.
          const isSelfAction =
            isCurrentUser && !canPerformAction(action.value, isCurrentUser);

          if (action.value === "view_details") {
            return (
              <Link
                key={action.value}
                href={RouteConfig.dashboard.admin.userDetails(userId)}
              >
                <DropdownMenuItem
                  className={getActionItemClasses(action.variant)}
                >
                  {action.label}
                </DropdownMenuItem>
              </Link>
            );
          }

          return (
            <DropdownMenuItem
              key={action.value}
              disabled={isSelfAction}
              onClick={() => {
                if (!isSelfAction) {
                  onActionSelect(action.value);
                }
              }}
              className={cn(
                getActionItemClasses(action.variant),
                isSelfAction && "opacity-50 cursor-not-allowed",
              )}
              title={
                isSelfAction
                  ? "You can't perform this action on your own account"
                  : undefined
              }
            >
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
