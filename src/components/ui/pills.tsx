import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type PillOption<T extends string> = {
  label: string;
  value: T;
};

type PillsProps<T extends string> = {
  options: PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function Pills<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: PillsProps<T>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={`flex bg-gray-100 rounded-full p-1 w-fit ${className}`}>
        {options.map((option) => {
          const isActive = value === option.value;

          return (
            <Button
              key={option.value}
              variant={isActive ? "default" : "ghost"} // ✅ use variant
              onClick={() => {
                return onChange(option.value);
              }}
              className="rounded-full px-3 py-1 h-auto text-sm font-medium"
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <Button
            key={option.value}
            variant={isActive ? "default" : "ghost"}
            onClick={() => {
              return onChange(option.value);
            }}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
