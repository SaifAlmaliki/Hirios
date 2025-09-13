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
        bg-gray-100 hover:bg-gray-200 
        text-gray-700 rounded-full 
        border border-gray-200
        transition-colors duration-200
        ${getVariantStyles()}
        ${className}
      `}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {showIcon && (
        <Coins className={`${getIconSize()} text-gray-600`} />
      )}
      
      <span className="font-medium text-gray-900">
        {formatPoints(points)}
      </span>
      
      {variant === 'detailed' && (
        <motion.div
          className="flex items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Zap className="h-3 w-3 text-gray-500" />
          <span className="text-xs text-gray-500">Available</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PointsBadge;
