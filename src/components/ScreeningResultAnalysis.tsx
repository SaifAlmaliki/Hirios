import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp,
  Mic
} from 'lucide-react';

interface AnalysisSection {
  title: string;
  content: string;
  icon?: React.ReactNode;
  color: 'green' | 'red' | 'orange' | 'blue' | 'gray' | 'purple';
}

interface ScreeningResultAnalysisProps {
  strengths?: string;
  weaknesses?: string;
  riskFactor?: string;
  rewardFactor?: string;
  justification?: string;
  interviewSummary?: string;
  interviewCompletedAt?: string;
  voiceScreeningRequested?: boolean;
  resultId?: string;
  candidateName?: string;
}

const ScreeningResultAnalysis: React.FC<ScreeningResultAnalysisProps> = ({
  strengths,
  weaknesses,
  riskFactor,
  rewardFactor,
  justification,
  interviewSummary,
  interviewCompletedAt,
  voiceScreeningRequested,
  resultId,
  candidateName
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'red':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'orange':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'blue':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'gray':
        return 'text-gray-900 bg-gray-50 border-gray-200';
      case 'purple':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600';
      case 'red':
        return 'text-red-600';
      case 'orange':
        return 'text-orange-600';
      case 'blue':
        return 'text-blue-600';
      case 'gray':
        return 'text-gray-600';
      case 'purple':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const parseContentToBullets = (content: string) => {
    // Split content into sentences, preserving all text
    const sentences = content
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Create bullet points from sentences
    const bullets: string[] = [];
    
    sentences.forEach((sentence) => {
      if (sentence.length > 0) {
        bullets.push(sentence);
      }
    });
    
    return bullets;
  };

  const renderSection = (section: AnalysisSection) => {
    const bullets = parseContentToBullets(section.content);
    
    return (
      <div className="space-y-3">
        <h4 className={`text-lg font-semibold flex items-center ${section.color === 'gray' ? 'text-gray-900' : `text-${section.color}-700`}`}>
          {section.icon && <span className={`mr-2 ${getIconColor(section.color)}`}>{section.icon}</span>}
          {section.title}
        </h4>
        <div className={`p-4 rounded-lg border ${getColorClasses(section.color)}`}>
          <div className="space-y-2">
            {bullets.map((bullet, index) => (
              <div key={index} className="flex items-start">
                <span className="text-gray-600 mr-2 mt-1 flex-shrink-0">•</span>
                <span className="text-sm leading-relaxed text-gray-700">{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Justification - First Section */}
      {justification && renderSection({
        title: "AI Analysis Justification",
        content: justification,
        color: 'gray'
      })}

      <div className="space-y-6">
        {strengths && renderSection({
          title: "Strengths",
          content: strengths,
          icon: <TrendingUp className="h-4 w-4" />,
          color: 'gray'
        })}

        {weaknesses && renderSection({
          title: "Areas for Development",
          content: weaknesses,
          color: 'gray'
        })}

        {riskFactor && renderSection({
          title: "Risk Factors",
          content: riskFactor,
          color: 'gray'
        })}

        {rewardFactor && renderSection({
          title: "Potential Rewards",
          content: rewardFactor,
          color: 'gray'
        })}
      </div>

      {interviewSummary && renderSection({
        title: "Voice Interview Summary",
        content: interviewSummary,
        icon: <Mic className="h-4 w-4" />,
        color: 'gray'
      })}

      {interviewCompletedAt && (
        <p className="text-xs text-gray-500 mt-2">
          Completed: {new Date(interviewCompletedAt).toLocaleString()}
        </p>
      )}

      {voiceScreeningRequested && !interviewSummary && renderSection({
        title: "Voice Screening Status",
        content: "Voice screening interview has been requested. Candidate will receive an email with the interview link.",
        icon: <Mic className="h-4 w-4" />,
        color: 'gray'
      })}

    </div>
  );
};

export default ScreeningResultAnalysis; 