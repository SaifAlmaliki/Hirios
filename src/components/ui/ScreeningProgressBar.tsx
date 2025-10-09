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
              <span className="text-xs text-blue-600">
                Please wait while we analyze the resumes
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScreeningProgressBar;

