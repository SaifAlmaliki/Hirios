import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  Mic,
  StickyNote,
  Edit3
} from 'lucide-react';
import NotesEditDialog from './NotesEditDialog';

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
  notes,
  resultId,
  candidateName
}) => {
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
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

      {/* Company Notes Section with Edit Button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <StickyNote className="h-4 w-4 mr-2 text-gray-600" />
            Company Notes
          </h4>
          {resultId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNotesDialogOpen(true)}
              className="h-8 px-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
        <div className="p-4 rounded-lg border text-gray-700 bg-gray-50 border-gray-200">
          {notes ? (
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{notes}</p>
          ) : (
            <p className="text-sm text-gray-500 italic">No notes added yet. Click Edit to add notes about this candidate.</p>
          )}
        </div>
      </div>

      {/* Notes Edit Dialog */}
      {resultId && candidateName && (
        <NotesEditDialog
          isOpen={isNotesDialogOpen}
          onClose={() => setIsNotesDialogOpen(false)}
          resultId={resultId}
          currentNotes={notes || ''}
          candidateName={candidateName}
        />
      )}
    </div>
  );
};

export default ScreeningResultAnalysis; 