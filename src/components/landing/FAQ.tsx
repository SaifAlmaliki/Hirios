import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Particles } from '@/components/ui/particles';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const FAQ = () => {
  const { t, tArray } = useTranslation();
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = tArray('faq.questions') as Array<{ question: string; answer: string }>;

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-950 relative">
      <Particles
        className="absolute inset-0"
        quantity={1000}
        color="#ffffff"
        size={0.4}
      />
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('faq.title')}</h2>
          <p className="text-lg sm:text-xl text-gray-300">{t('faq.subtitle')}</p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <Collapsible key={index}>
              <CollapsibleTrigger 
                className="flex w-full items-center justify-between rounded-lg border border-gray-700 px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-gray-800 transition-colors"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-sm sm:text-base pr-2 text-white">{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 sm:px-6 py-3 sm:py-4 border-l border-r border-b border-gray-700 rounded-b-lg bg-gray-800/50">
                <p className="text-gray-300 text-sm sm:text-base">{faq.answer}</p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
