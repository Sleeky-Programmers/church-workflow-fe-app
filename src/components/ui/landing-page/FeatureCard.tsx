import Image from "next/image";
import { Text } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";

interface FeatureCardProps {
  image: string;
  title: string;
  description: string;
}

export function FeatureCard({ image, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center text-center px-5 py-6 gap-4">
      <div className="relative w-full h-60 rounded-xl overflow-hidden">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>

      <Heading
        level={4}
        variant="primary"
        className="font-bold text-black leading-snug"
      >
        {title}
      </Heading>

      <Text variant="muted" className="text-sm leading-relaxed">
        {description}
      </Text>
    </div>
  );
}
