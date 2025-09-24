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
    // Common abbreviations that should not end sentences
    const abbreviations = [
      'M.Sc.', 'B.Sc.', 'Ph.D.', 'M.D.', 'B.A.', 'M.A.', 'B.Eng.', 'M.Eng.',
      'B.Tech.', 'M.Tech.', 'B.Com.', 'M.Com.', 'B.B.A.', 'M.B.A.',
      'LL.B.', 'LL.M.', 'J.D.', 'D.D.S.', 'D.V.M.', 'D.O.', 'D.P.T.',
      'R.N.', 'L.P.N.', 'C.N.A.', 'P.A.', 'N.P.', 'C.R.N.A.',
      'A.A.', 'A.S.', 'A.A.S.', 'B.S.', 'M.S.', 'Ed.D.', 'Psy.D.',
      'Inc.', 'Ltd.', 'Corp.', 'Co.', 'LLC.', 'LLP.', 'P.C.',
      'St.', 'Ave.', 'Blvd.', 'Rd.', 'Dr.', 'Prof.', 'Sr.', 'Jr.',
      'vs.', 'etc.', 'i.e.', 'e.g.', 'a.m.', 'p.m.', 'U.S.', 'U.K.',
      'A.I.', 'M.L.', 'D.L.', 'C.V.', 'R&D', 'IT', 'HR', 'CEO', 'CTO', 'CFO'
    ];
    
    // First, protect abbreviations by replacing them with placeholders
    let protectedContent = content;
    const abbreviationMap: { [key: string]: string } = {};
    
    abbreviations.forEach((abbr, index) => {
      const placeholder = `__ABBR_${index}__`;
      abbreviationMap[placeholder] = abbr;
      // Use case-insensitive replacement
      const regex = new RegExp(abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      protectedContent = protectedContent.replace(regex, placeholder);
    });
    
    // Now split on sentence boundaries
    const sentences = protectedContent
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    // Restore abbreviations in each sentence
    const bullets: string[] = [];
    
    sentences.forEach((sentence) => {
      if (sentence.length > 0) {
        let restoredSentence = sentence;
        Object.entries(abbreviationMap).forEach(([placeholder, abbr]) => {
          restoredSentence = restoredSentence.replace(new RegExp(placeholder, 'g'), abbr);
        });
        bullets.push(restoredSentence);
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