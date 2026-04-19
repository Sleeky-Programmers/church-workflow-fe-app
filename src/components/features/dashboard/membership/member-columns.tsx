import { Column } from "@/components/features/dashboard/Table";
import { MemberProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography/Text";
import { formatDate } from "@/utils/helpers";

export const getMemberColumns = ({
  onView,
}: {
  onView: (row: MemberProfile) => void;
}): Column<MemberProfile>[] => [
  {
    key: "name",
    header: "Name",
    accessor: (row) => row.fullName,
    sortable: true,
  },
  {
    key: "birthday",
    header: "Birthday",
    accessor: (row) => formatDate(row.birthday),
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
    key: "email",
    header: "Email",
    accessor: "email",
    contentClassName: "truncate",
  },
  {
    key: "action",
    header: "Action",
    render: (row) => (
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
    ),
  },
];
