"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

type LoaderProps = {
  logoUrl?: string;
  size?: string;
  className?: string;
};

export function Loader({
  logoUrl = "https://app.trickle.so/storage/public/images/usr_1ed625db90000001/9e9f3d8a-9b01-42e4-b293-cc4461d9c349.png",
  size = "w-24 h-24",
  className = "",
}: LoaderProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center", className)}
      data-name="bounce-loader"
    >
      <div className="flex items-center justify-center relative">
        <Image
          src={logoUrl}
          alt="Loading..."
          width={96}
          height={96}
          unoptimized
          className={cn(size, "object-contain relative z-10 animate-bounce")}
        />

        <div className="absolute -bottom-2 w-16 h-1.5 bg-black rounded-[50%] blur-[2px] animate-bounce-shadow" />
      </div>
    </div>
  );
}
