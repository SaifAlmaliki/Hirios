import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuroraHero } from '@/components/ui/futurastic-hero-section';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  Target,
  Upload,
  Brain,
  BarChart3,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";


const HiriosLanding = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Futurastic Hero Section */}
      <AuroraHero />


      {/* How It Works */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-300">Simple workflow for smarter hiring decisions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            {/* Step 1: Upload Resumes */}
            <div className="text-center">
              <div className="bg-blue-600/20 p-6 rounded-full w-fit mx-auto mb-6 relative border border-blue-600/30">
                <Upload className="h-12 w-12 text-blue-400" />
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  1
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-white">Upload Resumes</h3>
              <p className="text-gray-300 text-sm">
                Hiring managers upload resumes from any source - LinkedIn, job boards, referrals, or direct applications.
              </p>
            </div>

            {/* Step 2: Define Job Requirements */}
            <div className="text-center">
              <div className="bg-green-600/20 p-6 rounded-full w-fit mx-auto mb-6 relative border border-green-600/30">
                <Building2 className="h-12 w-12 text-green-400" />
                <div className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  2
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-white">Define Job Requirements</h3>
              <p className="text-gray-300 text-sm">
                Fill out the job description, responsibilities, and requirements to create a comprehensive job profile.
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

            {/* Step 4: Review & Interview */}
            <div className="text-center">
              <div className="bg-orange-600/20 p-6 rounded-full w-fit mx-auto mb-6 relative border border-orange-600/30">
                <BarChart3 className="h-12 w-12 text-orange-400" />
                <div className="absolute -top-2 -right-2 bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  4
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

      {/* See What You Get */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">See What You Get</h2>
            <p className="text-xl text-gray-300">This is the level of detail you'll get from our AI analysis</p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="relative group">
              <img 
                src="/screening result.png" 
                alt="AI Screening Result Example - Jane Smith Solutions Architect Analysis"
                className="w-full h-auto rounded-xl shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl border border-white/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-600/30">
                <h4 className="text-lg font-semibold text-white mb-3">What This Shows</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Our AI provides comprehensive analysis including match scores, detailed strengths and weaknesses, 
                  risk assessment, potential rewards, and actionable recommendations - all based on your specific 
                  job requirements and candidate qualifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-6xl mx-auto">
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
              <div className="bg-purple-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-purple-600/30">
                <Clock className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-white">Time Saved</h3>
              <p className="text-gray-300 text-sm">
                Cut screening time by 80% and focus only on top candidates.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-600/20 p-4 rounded-full w-fit mx-auto mb-6 border border-orange-600/30">
                <Shield className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-white">Modern UI</h3>
              <p className="text-gray-300 text-sm">
                Beautiful Aurora backgrounds and glassmorphism design for enhanced user experience.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Contact CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Transform Your Hiring?</h2>
            <p className="text-lg sm:text-xl text-gray-300 px-4">Get a personalized demo and see how Hirios can revolutionize your recruitment process</p>
          </div>

          <Card className="border border-gray-700/50 shadow-xl bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-12 text-center">
              <div className="mb-6 sm:mb-8">
                <div className="bg-blue-600 p-3 sm:p-4 rounded-full w-fit mx-auto mb-4 sm:mb-6">
                  <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Enterprise Solutions Available</h3>
                <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed px-2">
                  Whether you're a startup or enterprise, we'll customize Hirios to fit your unique hiring needs. 
                  Get advanced features, dedicated support, and seamless integrations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 text-sm sm:text-base">
                <div className="flex items-center justify-center sm:justify-start text-gray-200">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2 sm:mr-3 flex-shrink-0" />
                  <span>Custom AI Training</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start text-gray-200">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2 sm:mr-3 flex-shrink-0" />
                  <span>ATS Integration</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start text-gray-200">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2 sm:mr-3 flex-shrink-0" />
                  <span>Dedicated Support</span>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-600/50">
                <h4 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Contact Us for Demo & Pricing</h4>
                <div className="flex items-center justify-center text-blue-400 font-medium text-base sm:text-lg">
                  <span className="mr-2">📧</span>
                  <a href="mailto:info@idraq.com" className="hover:underline break-all">
                    info@idraq.com
                  </a>
                </div>
                <p className="text-sm sm:text-base text-gray-300 mt-2 sm:mt-3">
                  We'll schedule a personalized demo and discuss custom pricing for your organization
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button 
                  onClick={() => window.open('mailto:idraq.ai@gmail.com?subject=Hirios Demo Request&body=Hi, I\'m interested in learning more about Hirios and would like to schedule a demo for my organization.')}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold hover:scale-105 transition-transform w-full sm:w-auto"
                >
                  Request Demo
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button 
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400/10 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold hover:scale-105 transition-transform w-full sm:w-auto"
                >
                  Try Free Version
                  <Zap className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ - Mobile Responsive */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-lg sm:text-xl text-gray-300">Everything you need to know about Hirios</p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How does AI screening work?",
                answer: "Upload resumes from any source (LinkedIn, job boards, etc.), define your job requirements, and our AI analyzes each resume against the job description, responsibilities, and requirements to provide detailed scores and justifications."
              },
              {
                question: "What are voice interviews?",
                answer: "AI-powered voice interviews allow you to conduct automated interviews with candidates, generating detailed summaries and insights for better hiring decisions."
              },
              {
                question: "Is my data secure?",
                answer: "Yes, all data is encrypted and stored securely using Supabase. We follow industry best practices for data protection and privacy."
              },
              {
                question: "What file formats do you support?",
                answer: "We currently support PDF resumes and job descriptions. The platform is built on modern web technologies for optimal performance."
              },
              {
                question: "Can I upload resumes from LinkedIn or other sources?",
                answer: "Yes! You can upload resumes from any source - LinkedIn, job boards, referrals, direct applications, or any other recruitment channel. Our AI will analyze them all against your job requirements."
              },
              {
                question: "How accurate is the AI scoring?",
                answer: "Our AI provides detailed analysis with match scores, strengths, weaknesses, and justifications. The system is continuously improved for better accuracy."
              },
              {
                question: "Can I try the platform for free?",
                answer: "Yes! You can sign up and start using Hirios immediately. Contact us for enterprise features and custom solutions."
              }
            ].map((faq, index) => (
              <Collapsible key={index}>
                <CollapsibleTrigger 
                  className="flex w-full items-center justify-between rounded-lg border border-gray-700 px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-gray-800 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium text-sm sm:text-base pr-2 text-white">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 sm:px-6 py-3 sm:py-4 border-l border-r border-b border-gray-700 rounded-b-lg bg-gray-800/50">
                  <p className="text-gray-300 text-sm sm:text-base">{faq.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Mobile Responsive */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6 px-2">
            Start Hiring with AI Today
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed px-2">
            Join hundreds of companies who've transformed their hiring process with Hirios
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-semibold hover:scale-105 transition-transform w-full sm:w-auto max-w-sm mx-auto"
          >
            Get Started - No Credit Card Needed
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </section>

      {/* Footer - Mobile Responsive */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-blue-600 p-1.5 sm:p-2 rounded-full">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="font-bold text-base sm:text-lg">Hirios</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-white cursor-pointer transition-colors">Contact Us</span>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-4 sm:mt-6 pt-4 sm:pt-6 text-center text-xs sm:text-sm text-gray-400">
            © 2025 Hirios. All rights reserved. AI-powered hiring made simple.
          </div>
        </div>
      </footer>


    </div>
  );
};

export default HiriosLanding; 