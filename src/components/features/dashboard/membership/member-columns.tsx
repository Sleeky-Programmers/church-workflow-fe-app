import { Column } from "@/components/features/dashboard/Table";
import { MemberProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography/Text";
import { formatDate } from "@/utils/helpers";

export const getMemberColumns = ({
  onView,
}: {
  onView: (row: MemberProfile) => void;
}): Column<MemberProfile>[] => {
  return [
    {
      key: "name",
      header: "Name",
      accessor: (row) => {
        return row.fullName;
      },
      sortable: true,
    },
    {
      key: "birthday",
      header: "Birthday",
      accessor: (row) => {
        return formatDate(row.birthday);
      },
    },
    {
      key: "gender",
      header: "Gender",
      accessor: "gender",
    },
    {
      key: "phone",
      header: "Phone",
      accessor: "phone",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const status = row.membershipStatus;
        if (!status) {
          return <Text className="text-gray-400">—</Text>;
        }
        const isGuest = status === "VISITOR";
        return (
          <span
            className={
              isGuest
                ? "inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
                : "inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
            }
          >
            {isGuest
              ? "Guest"
              : status.charAt(0) + status.slice(1).toLowerCase()}
          </span>
        );
      },
    },
    {
      key: "email",
      header: "Email",
      accessor: "email",
      contentClassName: "truncate",
    },
    {
      key: "action",
      header: "Action",
      render: (row) => {
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onView(row);
            }}
          >
            <Text>View Profile</Text>
          </Button>
        );
      },
    },
  ];
};
