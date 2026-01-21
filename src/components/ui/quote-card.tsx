import { Text, Span } from '@/components/ui/typography/Text';

type QuoteCardProps = {
  verse: string;
  reference: string;
};

export function QuoteCard({ verse, reference }: QuoteCardProps) {
  return (
    <div className="bg-gradient-to-bl from-zinc-950 to-slate-950 backdrop-blur-sm p-8 rounded-lg"> 
      <Text variant="quote" className="mb-6"> 
        &quot;{verse}&quot;
      </Text>
      <Span variant="default" className="block text-gray-100"> 
        {reference}
      </Span>
    </div>
  );
}