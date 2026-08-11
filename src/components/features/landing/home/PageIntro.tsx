import { Text } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";
import { AuthAwareCta } from "@/components/features/landing/shared/AuthAwareCta";

interface PageIntroProps {
  title: string;
  description: string;
}

export default function PageIntro({ title, description }: PageIntroProps) {
  return (
    <section className="relative bg-white px-6 md:px-16 pt-32 pb-16 md:pt-40 md:pb-20">
      <div className="max-w-3xl mx-auto text-center space-y-5">
        <Heading
          level={1}
          className="text-3xl md:text-5xl font-black leading-tight text-gray-900"
        >
          {title}
        </Heading>
        <Text variant="muted" className="text-base md:text-lg leading-relaxed">
          {description}
        </Text>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <AuthAwareCta className="px-7" />
        </div>
      </div>
    </section>
  );
}
