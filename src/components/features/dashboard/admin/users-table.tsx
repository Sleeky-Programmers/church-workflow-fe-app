"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, UserAction } from "@/types/user";
import { UserActionsMenu } from "./mini-components/user-action";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { Badge } from "@/components/ui/badge";

type UserTableProps = {
  users: User[];
  onActionSelect: (userId: string, action: UserAction) => void;
  canManageBranchAccess?: boolean;
};

export function UserTable({
  users,
  onActionSelect,
  canManageBranchAccess,
}: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <div className="text-center">
          <Heading level={2}>No users found</Heading>
          <Text variant="default">Get started by inviting your first user</Text>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50 text-semibold text-black-400">
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date Invited</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          return (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <span className="inline-flex items-center gap-2">
                  {user.name}
                  {user.isCurrentUser && (
                    <Badge
                      shape="pill"
                      className="bg-primary-50 text-primary-700 border border-primary-200"
                    >
                      You
                    </Badge>
                  )}
                </span>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <StatusBadge status={user.status} />
              </TableCell>
              <TableCell>{user.dateInvited}</TableCell>
              <TableCell className="text-right">
                <UserActionsMenu
                  userId={user.id}
                  userStatus={user.status}
                  onActionSelect={(action) => {
                    return onActionSelect(user.id, action);
                  }}
                  canManageBranchAccess={canManageBranchAccess}
                  isCurrentUser={user.isCurrentUser}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
