import React from 'react';
import { Particles } from '@/components/ui/particles';
import { 
  Brain, 
  FileText, 
  Mic, 
  Clock, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const HiringFunnel = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
      <Particles
        className="absolute inset-0"
        quantity={800}
        color="#3B82F6"
        size={0.3}
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Transform Your 
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Hiring Process</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stop spending hours on manual resume screening and initial interviews. 
            Let Hirios AI handle the tedious work so you can focus on what matters most.
          </p>
        </div>

        {/* Main Content - Image Left, Text Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Hiring Funnel Image */}
          <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
            <div className="relative">
              <img 
                src="/hiring funnel.jpg" 
                alt="Hiring Funnel Process" 
                className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-auto rounded-2xl shadow-2xl border border-gray-700/50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>

          {/* Right side - AI Offloading Benefits */}
          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Offload the Tedious Work to AI
              </h3>
              <p className="text-lg text-gray-300 mb-6">
                Traditional hiring involves countless hours of manual work. With Hirios, 
                you can automate the most time-consuming parts of your hiring process.
              </p>
            </div>

            <div className="space-y-6">
              {/* Resume Screening */}
              <div className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="bg-blue-600/20 p-3 rounded-full flex-shrink-0">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Automated Resume Screening</h4>
                  <p className="text-gray-300 text-sm">
                    Upload hundreds of resumes and let AI instantly analyze, score, and rank candidates 
                    based on your job requirements. No more manual reading through each CV.
                  </p>
                </div>
              </div>

              {/* Voice Interviews */}
              <div className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="bg-purple-600/20 p-3 rounded-full flex-shrink-0">
                  <Mic className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">AI-Powered Voice Interviews</h4>
                  <p className="text-gray-300 text-sm">
                    Conduct first-round screening interviews automatically. Our AI asks relevant questions, 
                    evaluates responses, and provides detailed insights on candidate fit.
                  </p>
                </div>
              </div>

              {/* Time Savings */}
              <div className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="bg-green-600/20 p-3 rounded-full flex-shrink-0">
                  <Clock className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Massive Time Savings</h4>
                  <p className="text-gray-300 text-sm">
                    Reduce screening time from days to minutes. Focus your energy on final interviews 
                    and strategic hiring decisions instead of initial candidate filtering.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Before vs After Comparison - Full Width Below */}
        <div className="mt-16">
          <h4 className="text-2xl font-bold text-white mb-8 text-center">
            Before vs. After Hirios
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Before */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
              <h5 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Traditional Process (Hours of Manual Work)
              </h5>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3 flex-shrink-0"></span>
                  Manually read through 100+ resumes
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3 flex-shrink-0"></span>
                  Schedule and conduct initial phone screens
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3 flex-shrink-0"></span>
                  Take detailed notes on each candidate
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3 flex-shrink-0"></span>
                  Manually compare and rank candidates
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
              <h5 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                With Hirios (AI Does the Heavy Lifting)
              </h5>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0"></span>
                  Upload resumes and job description
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0"></span>
                  AI automatically screens and scores candidates
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0"></span>
                  AI conducts voice interviews with top candidates
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0"></span>
                  Get ranked results with detailed explanations
                </li>
              </ul>
            </div>
          </div>

          {/* Result Summary */}
          <div className="text-center mt-8">
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6 max-w-md mx-auto">
              <h5 className="text-lg font-semibold text-blue-400 mb-2">
                Result: 90% Time Reduction
              </h5>
              <p className="text-gray-300 text-sm">
                Focus on what matters most - making the final hiring decision
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HiringFunnel;
