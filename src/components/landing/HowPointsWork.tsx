import React from 'react';
import { Coins, Zap, Check, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface HowPointsWorkProps {
  isVisitor?: boolean;
}

export const HowPointsWork: React.FC<HowPointsWorkProps> = ({ isVisitor = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-700"
    >
      <h2 className="text-2xl font-bold text-white text-center mb-8">
        How Points Work
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Coins className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Resume Screening</h3>
          <p className="text-gray-300">1 point per resume screened by AI</p>
        </div>
        
        <div className="text-center">
          <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Zap className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Voice Interviews</h3>
          <p className="text-gray-300">2 points per voice interview conducted</p>
        </div>
        
        <div className="text-center">
          <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Expiration</h3>
          <p className="text-gray-300">Points never expire, use them anytime</p>
        </div>
      </div>

      {isVisitor && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-400/30">
            <h3 className="text-lg font-semibold text-white mb-2">
              🎉 New User Bonus
            </h3>
            <p className="text-gray-300 mb-4">
              Get 25 free points when you sign up to get started with Hirios!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-blue-400 font-medium">
              <Coins className="h-4 w-4" />
              <span>25 free points = 25 resume screenings or 12 voice interviews</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HowPointsWork;
