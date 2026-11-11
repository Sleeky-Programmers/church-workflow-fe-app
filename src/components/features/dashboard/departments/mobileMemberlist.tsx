import { Button } from "@/components/ui/button";
import { MemberItem } from "@/app/dashboard/departments/[id]/page";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/typography/Text";
export function MobileMembersList({
  members,
  selectedRows,
  onToggle,
  onRemove,
}: {
  members: MemberItem[];
  selectedRows: string[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="divide-y border rounded-xl overflow-hidden bg-white">
      {members.map((member) => {
        return (
          <div
            key={member.id}
            className="flex items-center justify-between px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <Input
                type="checkbox"
                checked={selectedRows.includes(member.id)}
                onChange={() => {
                  return onToggle(member.id);
                }}
              />

              <div>
                <Text>{member.name}</Text>
                <Text>{member.contact}</Text>
              </div>
            </div>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                return onRemove(member.id);
              }}
            >
              Remove
            </Button>
          </div>
        );
      })}
    </div>
  );
}
