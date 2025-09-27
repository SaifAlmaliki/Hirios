import React from 'react';
import { Particles } from '@/components/ui/particles';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const FAQ = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "How does the pricing work?",
      answer: "Hirios offers flexible pricing options perfect for B2B companies. Contact us for custom pricing based on your company's hiring needs and volume. We provide transparent, scalable pricing that grows with your business."
    },
    {
      question: "How does AI screening work?",
      answer: "Our AI agent deeply understands your job description, requirements, and responsibilities, then ranks uploaded resumes by relevance. It provides detailed justifications including strengths, weaknesses, and reasoning for each ranking. If you disagree with a ranking, you can always review the original resume for full transparency. All resumes are stored securely for reference."
    },
    {
      question: "What file formats and integrations do you support?",
      answer: "We support PDF resume uploads and are open to integrating with enterprise ATS systems like Workday and Greenhouse. You can bulk upload resumes from LinkedIn job posts with one simple step. Contact us to discuss volume limits and processing capabilities for your specific needs."
    },
    {
      question: "How accurate is the AI and can it handle different languages?",
      answer: "Our AI is highly accurate as it comprehensively analyzes job requirements against candidate qualifications. The LLM can easily handle multiple languages for both resume analysis and voice interviews. If the AI makes an assessment you disagree with, you have full access to review the original resume for complete transparency."
    },
    {
      question: "What are voice interviews and how do they work?",
      answer: "AI-powered voice interviews take about 10 minutes and collect key information like start date, motivation for the role, and past experience. The AI voice agent can be customized with enterprise-specific questions and supports multiple languages. Interview summaries are analyzed and saved to candidate profiles, giving hiring managers valuable insights before human interviews."
    },
    {
      question: "How is my data stored and secured?",
      answer: "All candidate resumes are stored in secure Supabase storage using AWS infrastructure. We're fully GDPR compliant and all hiring results and resumes can be exported as PDF. Data is retained for 3 years unless different requirements are specified by your enterprise. We follow industry best practices for data protection and privacy."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We provide weekday support (9 AM - 5 PM, 5 days a week) for all users. While the system is self-explanatory and easy to use, we offer quick training sessions for recruiters. For enterprise clients, we can provide implementation assistance and custom onboarding to ensure smooth adoption."
    },
    {
      question: "Who is Hirios designed for?",
      answer: "Hirios is perfect for medium to large companies across all industries that spend significant time and resources screening resumes. Whether you're hiring for technical or non-technical roles, our AI helps you find the right candidates faster. The system works in any browser with no minimum or maximum limits - you only pay for what you use."
    },
    {
      question: "What do I need to get started?",
      answer: "Simply enter your job description, requirements, and responsibilities for the position you want to screen candidates for. Hirios handles the rest! The system runs on any browser and requires no special setup."
    },
    {
      question: "Can I export my data and results?",
      answer: "Yes! All hiring results and resumes can be exported as PDF files. You maintain full control over your data and can export candidate information, screening results, and interview summaries whenever needed. This ensures you have complete records for your hiring process."
    }
  ];

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
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-lg sm:text-xl text-gray-300">Everything you need to know about Hirios</p>
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
