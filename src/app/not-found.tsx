import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold tracking-widest text-[#0C5FB3]">
        404
      </p>
      <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="max-w-md text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <Link href="/">
        <Button variant="default" className="mt-2 rounded-[8px] px-7">
          Back to Home
        </Button>
      </Link>
    </main>
  );
}
