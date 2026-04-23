import { Span } from "@/components/ui/typography/Text";

interface FloatingBadgeProps {
  icon: React.ReactNode;
  label: string;
}

export function FloatingBadge({ icon, label }: FloatingBadgeProps) {
  return (
    <div className="flex items-center gap-2 bg-[#ffff] rounded-full px-4 py-2 shadow-lg border border-gray-100 whitespace-nowrap">
      <span className="text-blue-600">{icon}</span>
      <Span variant="label" className="text-[16px]">
        {label}
      </Span>
    </div>
  );
}
