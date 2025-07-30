import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp,
  Mic,
  StickyNote
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
  notes?: string;
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
  notes
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

  const renderSection = (section: AnalysisSection) => (
    <div className="space-y-2">
      <h4 className={`font-semibold flex items-center ${section.color === 'gray' ? 'text-gray-900' : `text-${section.color}-700`}`}>
        {section.icon && <span className={`mr-2 ${getIconColor(section.color)}`}>{section.icon}</span>}
        {section.title}
      </h4>
      <div className={`p-3 rounded-lg border ${getColorClasses(section.color)}`}>
        <p className="text-sm text-gray-700">{section.content}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {strengths && renderSection({
          title: "Strengths",
          content: strengths,
          icon: <TrendingUp className="h-4 w-4" />,
          color: 'green'
        })}

        {weaknesses && renderSection({
          title: "Areas for Development",
          content: weaknesses,
          color: 'red'
        })}

        {riskFactor && renderSection({
          title: "Risk Factors",
          content: riskFactor,
          color: 'orange'
        })}

        {rewardFactor && renderSection({
          title: "Potential Rewards",
          content: rewardFactor,
          color: 'blue'
        })}
      </div>

      {justification && renderSection({
        title: "AI Analysis Justification",
        content: justification,
        color: 'gray'
      })}

      {interviewSummary && renderSection({
        title: "Voice Interview Summary",
        content: interviewSummary,
        icon: <Mic className="h-4 w-4" />,
        color: 'blue'
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
        color: 'orange'
      })}

      {notes && renderSection({
        title: "Company Notes",
        content: notes,
        icon: <StickyNote className="h-4 w-4" />,
        color: 'purple'
      })}
    </div>
  );
};

export default ScreeningResultAnalysis; 