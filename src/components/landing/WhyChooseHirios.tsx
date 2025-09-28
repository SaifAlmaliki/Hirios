import React from 'react';
import { Particles } from '@/components/ui/particles';
import { 
  Brain,
  Upload,
  Target,
  Clock,
  Shield,
  Database,
  Tag,
  TrendingUp
} from 'lucide-react';

const WhyChooseHirios = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950 relative">
      <Particles
        className="absolute inset-0"
        quantity={1000}
        color="#ffffff"
        size={0.4}
      />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose Hirios?</h2>
          <p className="text-xl text-gray-300">Everything you need for intelligent hiring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-blue-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-blue-600/30">
              <Brain className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">AI-Powered Screening</h3>
            <p className="text-gray-300 text-sm">
              Advanced AI analyzes resumes and provides detailed insights with match scores.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-green-600/30">
              <Upload className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Voice Interviews</h3>
            <p className="text-gray-300 text-sm">
              Conduct AI-powered voice interviews with candidates for deeper insights.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-cyan-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-cyan-600/30">
              <Database className="h-8 w-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Talent Database</h3>
            <p className="text-gray-300 text-sm">
              Build your talent database - never lose a good candidate. Search by AI-extracted skills for future positions.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-purple-600/30">
              <Tag className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Intelligent Resume Tagging</h3>
            <p className="text-gray-300 text-sm">
              AI automatically extracts and tags skills from resumes. Save 5+ hours per week on manual labeling.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-orange-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-orange-600/30">
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Candidate Journey Tracking</h3>
            <p className="text-gray-300 text-sm">
              Track every candidate's progress from application to decision. Complete visibility for your hiring team.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-indigo-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-indigo-600/30">
              <Target className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Team Collaboration</h3>
            <p className="text-gray-300 text-sm">
              Invite hiring managers and recruiters to collaborate on screening results together.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-emerald-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-emerald-600/30">
              <Clock className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Time Saved</h3>
            <p className="text-gray-300 text-sm">
              Cut screening time by 80% and focus only on top candidates.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-pink-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-pink-600/30">
              <Shield className="h-8 w-8 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Modern UI</h3>
            <p className="text-gray-300 text-sm">
              Beautiful Aurora backgrounds and glassmorphism design for enhanced user experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseHirios;
