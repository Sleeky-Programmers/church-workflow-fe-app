import { AUTH_CONTENT, AuthVariant } from '@/lib/auth-content';
import { ReactNode } from 'react';
import AuthLogo from '../auth-logo';

interface Props {
  children: ReactNode;
  variant: AuthVariant;
}

export default function AuthLayout({ children, variant }: Props) {
  const { imageUrl, verse, reference } = AUTH_CONTENT[variant];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {children}
        </div>
      </div>

      {/* Right */}
      <div
        className="hidden lg:flex relative items-end bg-cover bg-center p-4 my-4 rounded-l-lg overflow-hidden mr-2"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
         <div className="absolute top-6 left-6 z-10">
          <AuthLogo />
        </div>

        <div className="absolute inset-0 bg-black/40" />

       <div className="relative p-8 max-w-lg text-white-600 text-center animate-fade-in">
  <blockquote className="bg-linear-to-bl from-zinc-950 to-slate-950 backdrop-blur-sm p-8 rounded-lg">
    <p className="text-base md:text-lg leading-relaxed font-light mb-6">
      &quot;{verse}&quot;
    </p>
    <cite className="not-italic">
      <span className="block font-semibold text-sm md:text-base tracking-wide">
        {reference}
      </span>
    </cite>
  </blockquote>
</div>
      </div>
    </div>
  );
}
