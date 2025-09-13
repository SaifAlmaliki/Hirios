import React from 'react';
import { Coins, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePoints } from '@/hooks/usePoints';

interface PointsBadgeProps {
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export const PointsBadge: React.FC<PointsBadgeProps> = ({ 
  className = '', 
  showIcon = true,
  variant = 'default'
}) => {
  const { points, isLoadingPoints, formatPoints } = usePoints();

  if (isLoadingPoints) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'px-3 py-1.5 text-sm';
      case 'detailed':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'compact':
        return 'h-4 w-4';
      case 'detailed':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  return (
    <motion.div
      className={`
        inline-flex items-center gap-2 
        bg-gradient-to-r from-blue-500 to-purple-600 
        text-white rounded-full shadow-lg
        ${getVariantStyles()}
        ${className}
      `}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {showIcon && (
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Coins className={getIconSize()} />
        </motion.div>
      )}
      
      <span className="font-semibold">
        {formatPoints(points)}
      </span>
      
      {variant === 'detailed' && (
        <motion.div
          className="flex items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Zap className="h-3 w-3" />
          <span className="text-xs opacity-90">Available</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PointsBadge;
