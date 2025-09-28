import React from 'react';
import { Particles } from '@/components/ui/particles';
import { 
  Target,
  TrendingUp,
  CheckCircle,
  Upload,
  Database,
  Tag,
  BarChart3
} from 'lucide-react';

const CandidateBenefits = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 relative">
      <Particles
        className="absolute inset-0"
        quantity={1000}
        color="#ffffff"
        size={0.4}
      />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">What Companies Get for Each Candidate</h2>
          <p className="text-xl text-gray-300">Comprehensive insights to make informed hiring decisions</p>
        </div>

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

        {/* Additional Benefits Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Complete Hiring Ecosystem Benefits
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-700/50">
              <div className="flex items-center mb-4">
                <div className="bg-cyan-600/20 p-2 rounded-full mr-3 border border-cyan-600/30">
                  <Database className="h-6 w-6 text-cyan-400" />
                </div>
                <h4 className="font-semibold text-white">Talent Database</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Never lose a good candidate again. All resumes are stored in your talent database with AI-extracted skills for easy searching and future opportunities.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-700/50">
              <div className="flex items-center mb-4">
                <div className="bg-purple-600/20 p-2 rounded-full mr-3 border border-purple-600/30">
                  <Tag className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="font-semibold text-white">Intelligent Skill Tagging</h4>
              </div>
              <p className="text-gray-300 text-sm">
                AI automatically extracts and tags skills from every resume. Save 5+ hours per week on manual labeling while getting more accurate skill categorization.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-700/50">
              <div className="flex items-center mb-4">
                <div className="bg-orange-600/20 p-2 rounded-full mr-3 border border-orange-600/30">
                  <BarChart3 className="h-6 w-6 text-orange-400" />
                </div>
                <h4 className="font-semibold text-white">Candidate Journey Tracking</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Track every candidate's progress from application to final decision. Get complete visibility and organization for your entire hiring team with real-time status updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CandidateBenefits;
