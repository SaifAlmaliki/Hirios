import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ScreeningResultProgressProps {
  score: number;
  label?: string;
}

const ScreeningResultProgress: React.FC<ScreeningResultProgressProps> = ({
  score,
  label = "Overall Fit Score"
}) => {
  return (
    <div className="mt-6">
      <div className="flex justify-between text-sm text-gray-600 mb-3">
        <span className="font-medium">{label}</span>
        <span className="font-semibold">{score}%</span>
      </div>
      <Progress 
        value={score} 
        className="h-3"
      />
    </div>
  );
};

export default ScreeningResultProgress; 