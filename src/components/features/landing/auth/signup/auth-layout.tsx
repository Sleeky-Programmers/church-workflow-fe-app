import { AUTH_CONTENT, AuthVariant } from '@/lib/auth-content';
import { ReactNode } from 'react';
import AuthLogo from '../auth-logo'; 
import { QuoteCard } from '@/components/ui/quote-card';

interface Props {
  children: ReactNode;
  variant: AuthVariant;
}

export default function AuthLayout({ children, variant }: Props) {
  const { imageUrl, verse, reference } = AUTH_CONTENT[variant];
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {children}
        </div>
      </div>
      <div
        className="hidden lg:flex relative items-end p-4 my-4 overflow-hidden mr-2" 
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
         <div className="absolute top-6 left-6 z-10">
          <AuthLogo />
        </div>
        <div className="absolute inset-0" /> 
        <div className="relative max-w-lg text-center animate-fade-in"> 
          <QuoteCard verse={verse} reference={reference} />
        </div>
      </div>
    </div>
  );
}