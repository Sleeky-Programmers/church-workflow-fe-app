import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminInviteData, fetchAdminInviteData, isInviteTokenValid } from '@/lib/admin-invite';

interface UseAdminInviteReturn {
  isAdmin: boolean;
  inviteData: AdminInviteData | null;
  isValidInvite: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAdminInvite(): UseAdminInviteReturn {
  const searchParams = useSearchParams();
  const [inviteData, setInviteData] = useState<AdminInviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValidInvite, setIsValidInvite] = useState(false);

  useEffect(() => {
    const loadInviteData = async () => {
      try {
        const inviteToken = searchParams.get('invite');

        if (!inviteToken) {
          setIsLoading(false);
          return;
        }

        const data = await fetchAdminInviteData(inviteToken);

        if (!data) {
          setError('Invalid or expired invite link');
          setIsLoading(false);
          return;
        }

        if (!isInviteTokenValid(data)) {
          setError('This invite link has expired');
          setIsLoading(false);
          return;
        }

        setInviteData(data);
        setIsValidInvite(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invite data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInviteData();
  }, [searchParams]);

  return {
    isAdmin: !!inviteData,
    inviteData,
    isValidInvite,
    isLoading,
    error,
  };
}
