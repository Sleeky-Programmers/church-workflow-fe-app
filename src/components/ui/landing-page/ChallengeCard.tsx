import Image from "next/image";
import { Text } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";

interface ChallengeCardProps {
  image: string;
  title: string;
  description: string;
}

export function ChallengeCard({
  image,
  title,
  description,
}: ChallengeCardProps) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full aspect-[16/11] rounded-[2rem] overflow-hidden shadow-sm z-0">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>

      <div className="relative bg-[#ffffff] rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.08)] px-6 py-8 mx-auto w-[85%] -mt-12 z-20 flex flex-col gap-2 min-h-[140px] justify-start border border-gray-50">
        <Heading
          level={4}
          className="font-black text-center text-lg tracking-tight text-[#0C5FB3]"
        >
          {title}
        </Heading>
        <Text
          variant="muted"
          className="text-center text-[13px] font-medium leading-relaxed px-2"
        >
          {description}
        </Text>
      </div>
    </div>
  );
}
