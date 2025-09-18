import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const FormInput = ({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  leftIcon,
  rightIcon,
}: {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col space-y-2 mb-3">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
      />
    </div>
  );
}
