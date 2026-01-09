import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

export default function GoogleSignupButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="w-full py-6 border-gray-300 hover:bg-gray-50 flex items-center gap-2 focus:ring-0 focus:ring-offset-0"
    >
     <FcGoogle />
      Continue with Google
    </Button>
  );
}
