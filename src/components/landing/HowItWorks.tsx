import React from 'react';
import { Particles } from '@/components/ui/particles';
import { 
  Building2, 
  Upload,
  Brain,
  Target,
  BarChart3,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const HowItWorks = () => {
  return (
    <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 relative">
      <Particles
        className="absolute inset-0"
        quantity={1000}
        color="#ffffff"
        size={0.4}
      />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-xl text-gray-300">Simple workflow for smarter hiring decisions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {/* Step 1: Define Job Requirements */}
          <div className="text-center">
            <div className="bg-green-600/20 p-6 rounded-full w-fit mx-auto mb-6 relative border border-green-600/30">
              <Building2 className="h-12 w-12 text-green-400" />
              <div className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                1
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Define Job Requirements</h3>
            <p className="text-gray-300 text-sm">
              Fill out the job description, responsibilities, and requirements to create a comprehensive job profile.
            </p>
          </div>

          {/* Step 2: Upload Resumes */}
          <div className="text-center">
            <div className="bg-blue-600/20 p-6 rounded-full w-fit mx-auto mb-6 relative border border-blue-600/30">
              <Upload className="h-12 w-12 text-blue-400" />
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                2
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Upload Resumes</h3>
            <p className="text-gray-300 text-sm">
              Hiring managers upload resumes from any source - LinkedIn, job boards, referrals, or direct applications.
            </p>
          </div>

          {/* Step 3: AI Analysis */}
          <div className="text-center">
            <div className="bg-purple-600/20 p-6 rounded-full w-fit mx-auto mb-6 relative border border-purple-600/30">
              <Brain className="h-12 w-12 text-purple-400" />
              <div className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                3
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">AI Analysis</h3>
            <p className="text-gray-300 text-sm">
              Our AI analyzes each resume against job requirements, scoring candidates with detailed justifications.
            </p>
          </div>

          {/* Step 4: Team Collaboration */}
          <div className="text-center">
            <div className="bg-cyan-600/20 p-6 rounded-full w-fit mx-auto mb-6 relative border border-cyan-600/30">
              <Target className="h-12 w-12 text-cyan-400" />
              <div className="absolute -top-2 -right-2 bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                4
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Team Collaboration</h3>
            <p className="text-gray-300 text-sm">
              Invite hiring managers and recruiters to collaborate on screening results and share insights together.
            </p>
          </div>

          {/* Step 5: Review & Interview */}
          <div className="text-center">
            <div className="bg-orange-600/20 p-6 rounded-full w-fit mx-auto mb-6 relative border border-orange-600/30">
              <BarChart3 className="h-12 w-12 text-orange-400" />
              <div className="absolute -top-2 -right-2 bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                5
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Review & Interview</h3>
            <p className="text-gray-300 text-sm">
              Review AI insights, conduct voice interviews with top candidates, and make informed hiring decisions.
            </p>
          </div>
        </div>

        {/* Detailed Flow Explanation */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 mt-12 border border-blue-600/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">What Companies Get for Each Candidate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-700/50">
              <div className="flex items-center mb-4">
                <div className="bg-green-600/20 p-2 rounded-full mr-3 border border-green-600/30">
                  <Target className="h-6 w-6 text-green-400" />
                </div>
                <h4 className="font-semibold text-white">Match Score</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Percentage match based on skills, experience, and job requirements alignment with detailed scoring breakdown.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-700/50">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600/20 p-2 rounded-full mr-3 border border-blue-600/30">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white">Strengths & Weaknesses</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Clear breakdown of candidate's strong points and areas that may need development based on job requirements.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-700/50">
              <div className="flex items-center mb-4">
                <div className="bg-purple-600/20 p-2 rounded-full mr-3 border border-purple-600/30">
                  <CheckCircle className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="font-semibold text-white">Detailed Justification</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Comprehensive explanation of why the candidate is or isn't a good fit, including specific examples from their resume.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-700/50">
              <div className="flex items-center mb-4">
                <div className="bg-orange-600/20 p-2 rounded-full mr-3 border border-orange-600/30">
                  <Upload className="h-6 w-6 text-orange-400" />
                </div>
                <h4 className="font-semibold text-white">Voice Interview</h4>
              </div>
              <p className="text-gray-300 text-sm">
                AI-powered voice interviews with detailed summaries and insights for top candidates to make final decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
