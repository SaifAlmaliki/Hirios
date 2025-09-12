import React from 'react';
import { Particles } from '@/components/ui/particles';
import { 
  Building2, 
  Upload,
  Brain,
  Target,
  BarChart3
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

      </div>
    </section>
  );
};

export default HowItWorks;
