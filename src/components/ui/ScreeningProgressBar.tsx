import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Loader2 } from 'lucide-react';

interface ScreeningProgressBarProps {
  totalResumes: number;
  onComplete?: () => void;
  durationSeconds?: number;
  mode?: 'screening' | 'extraction';
}

const ScreeningProgressBar: React.FC<ScreeningProgressBarProps> = ({
  totalResumes,
  onComplete,
  durationSeconds = 60,
  mode = 'screening'
}) => {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Smart platform messages that rotate during screening
  const smartMessages = mode === 'screening' ? [
    "🧠 Our AI is analyzing candidate qualifications and experience...",
    "🎯 Matching skills to your job requirements with precision...",
    "📊 Evaluating cultural fit and potential for success...",
    "⚡ Processing years of experience in seconds, not hours...",
    "🔍 Identifying top performers from hundreds of candidates...",
    "💡 Our AI reads between the lines to find hidden gems...",
    "🚀 Transforming recruitment from weeks to minutes...",
    "🎪 Finding the perfect match using advanced algorithms...",
    "📈 Scoring candidates on multiple dimensions simultaneously...",
    "🌟 Discovering talent that traditional screening might miss..."
  ] : [
    "🔍 Extracting skills and experience from resume text...",
    "🏷️ Automatically tagging and categorizing information...",
    "📝 Converting unstructured data into searchable insights...",
    "⚡ Processing complex resume formats with AI precision...",
    "🎯 Identifying key qualifications and achievements...",
    "💾 Building your searchable talent database...",
    "🔧 Normalizing data for consistent analysis...",
    "📊 Creating structured profiles from unstructured resumes..."
  ];

  useEffect(() => {
    const intervalDuration = 500; // Update every 500ms
    const totalIntervals = (durationSeconds * 1000) / intervalDuration;
    const incrementPerInterval = 100 / totalIntervals;
    let currentInterval = 0;

    const interval = setInterval(() => {
      currentInterval++;
      const newProgress = Math.min((currentInterval * incrementPerInterval), 100);
      setProgress(newProgress);
      
      // Update time remaining
      const remaining = Math.max(0, durationSeconds - (currentInterval * intervalDuration / 1000));
      setTimeRemaining(Math.ceil(remaining));

      if (newProgress >= 100) {
        clearInterval(interval);
        if (onComplete) {
          onComplete();
        }
      }
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [durationSeconds, onComplete]);

  // Rotate messages every 3 seconds
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        (prevIndex + 1) % smartMessages.length
      );
    }, 3000);

    return () => clearInterval(messageInterval);
  }, [smartMessages.length]);

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  {mode === 'screening' ? 'AI Screening in Progress' : 'Extracting Skills and Labeling Resumes'}
                </h3>
                <p className="text-sm text-blue-700">
                  {mode === 'screening' 
                    ? `Processing ${totalResumes} resume${totalResumes !== 1 ? 's' : ''}...`
                    : `Analyzing ${totalResumes} resume${totalResumes !== 1 ? 's' : ''}...`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="h-3 bg-blue-100"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700">
                {Math.round(progress)}%
              </span>
              <span className="text-xs text-blue-600 transition-opacity duration-500 ease-in-out">
                {smartMessages[currentMessageIndex]}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScreeningProgressBar;

