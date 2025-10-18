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
  TrendingUp,
  Mail,
  Calendar,
  FileText,
  Search
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

          <div className="text-center">
            <div className="bg-amber-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-amber-600/30">
              <Mail className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">One-Click Email Integration</h3>
            <p className="text-gray-300 text-sm">
              Send interview invitations, offers, and rejections instantly from your company email server with one click.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-teal-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-teal-600/30">
              <Calendar className="h-8 w-8 text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Smart Interview Scheduling</h3>
            <p className="text-gray-300 text-sm">
              Visual availability matrix with automated calendar coordination. Save 3+ hours per interview scheduled.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-rose-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-rose-600/30">
              <FileText className="h-8 w-8 text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Automated Offer Management</h3>
            <p className="text-gray-300 text-sm">
              Generate professional PDF offer letters and send them with one-click communication directly from your email.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-violet-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-violet-600/30">
              <Search className="h-8 w-8 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-white">Advanced Talent Search</h3>
            <p className="text-gray-300 text-sm">
              Semantic AI search across your entire resume database. Find perfect candidates instantly for any position.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseHirios;
