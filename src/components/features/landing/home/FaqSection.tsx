import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { FAQ_ITEMS } from "@/lib/faq-data";

export default function FaqSection() {
  return (
    <section id="faq" className="relative bg-white px-6 py-20 md:py-24">
      <FaqJsonLd />
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <Heading
            level={2}
            className="text-3xl md:text-4xl font-black text-gray-900"
          >
            Frequently Asked Questions
          </Heading>
          <Text variant="muted">
            Everything you need to know about Church Workflow.
          </Text>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="text-left text-base font-semibold text-gray-900">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-500 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
