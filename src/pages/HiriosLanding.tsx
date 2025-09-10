import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuroraHero } from '@/components/ui/futurastic-hero-section';
import { Particles } from '@/components/ui/particles';
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


      {/* AI Powered Voice Interview Capabilities */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
        <Particles
          className="absolute inset-0"
          quantity={1000}
          color="#ffffff"
          size={0.4}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">AI Powered Voice Interview Capabilities</h2>
            <p className="text-xl text-gray-300">This is how we collect detailed candidate information before human interviews</p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Responsive Layout: Side-by-side on large screens, stacked on smaller screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* Image Container - Left side on large screens */}
              <div className="relative group order-2 lg:order-1">
                <div className="relative overflow-hidden rounded-xl">
                  <img 
                    src="/voice interview.png" 
                    alt="AI Voice Interview Interface - Jane Smith Solutions Architect Interview"
                    className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto h-auto rounded-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-3xl border border-white/20 cursor-pointer"
                    onClick={() => window.open('/voice interview.png', '_blank')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Interactive Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Container - Right side on large screens */}
              <div className="order-1 lg:order-2">
                <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-600/30 backdrop-blur-sm">
                  <h4 className="text-lg font-semibold text-white mb-4">Comprehensive Information Collection</h4>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    Our AI voice interviewer automatically collects detailed candidate information including:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
                    <div className="flex items-center text-gray-300 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Motivation for role
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Time management strategy
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Recent experience summary
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Preferred work environment
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Relevant skills & tools
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Career expectations
                    </div>
                    <div className="flex items-center text-gray-300 text-sm sm:col-span-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Availability & start date
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    This comprehensive data collection streamlines your hiring process by providing all the essential 
                    information you need before conducting human interviews.
                  </p>
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    Try Voice Interview
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Hirios */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
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
                <Target className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-white">Team Collaboration</h3>
              <p className="text-gray-300 text-sm">
                Invite hiring managers and recruiters to collaborate on screening results together.
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
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 relative">
        <Particles
          className="absolute inset-0"
          quantity={1000}
          color="#ffffff"
          size={0.4}
        />
        <div className="max-w-4xl mx-auto relative z-10">
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
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-950 relative">
        <Particles
          className="absolute inset-0"
          quantity={1000}
          color="#ffffff"
          size={0.4}
        />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-lg sm:text-xl text-gray-300">Everything you need to know about Hirios</p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How does the pricing work?",
                answer: "Hirios uses a point-based system perfect for B2B companies. it's pay-per-use: 1 point per resume screening and 2 points per voice interview. Companies purchase credit points and can buy more anytime. This flexible model means you only pay for what you use, making it cost-effective for any company size."
              },
              {
                question: "How does AI screening work?",
                answer: "Our AI agent deeply understands your job description, requirements, and responsibilities, then ranks uploaded resumes by relevance. It provides detailed justifications including strengths, weaknesses, and reasoning for each ranking. If you disagree with a ranking, you can always review the original resume for full transparency. All resumes are stored securely for reference."
              },
              {
                question: "What file formats and integrations do you support?",
                answer: "We support PDF resume uploads and are open to integrating with enterprise ATS systems like Workday and Greenhouse. You can bulk upload resumes from LinkedIn job posts with one simple step. There's no limit on the number of resumes you can process - you're only charged based on usage (1 point per resume)."
              },
              {
                question: "How accurate is the AI and can it handle different languages?",
                answer: "Our AI is highly accurate as it comprehensively analyzes job requirements against candidate qualifications. The LLM can easily handle multiple languages for both resume analysis and voice interviews. If the AI makes an assessment you disagree with, you have full access to review the original resume for complete transparency."
              },
              {
                question: "What are voice interviews and how do they work?",
                answer: "AI-powered voice interviews take about 10 minutes and collect key information like start date, motivation for the role, and past experience. The AI voice agent can be customized with enterprise-specific questions and supports multiple languages. Interview summaries are analyzed and saved to candidate profiles, giving hiring managers valuable insights before human interviews."
              },
              {
                question: "How is my data stored and secured?",
                answer: "All candidate resumes are stored in secure Supabase storage using AWS infrastructure. We're fully GDPR compliant and all hiring results and resumes can be exported as PDF. Data is retained for 3 years unless different requirements are specified by your enterprise. We follow industry best practices for data protection and privacy."
              },
              {
                question: "What kind of support do you provide?",
                answer: "We provide weekday support (9 AM - 5 PM, 5 days a week) for all users. While the system is self-explanatory and easy to use, we offer quick training sessions for recruiters. For enterprise clients, we can provide implementation assistance and custom onboarding to ensure smooth adoption."
              },
              {
                question: "Who is Hirios designed for?",
                answer: "Hirios is perfect for medium to large companies across all industries that spend significant time and resources screening resumes. Whether you're hiring for technical or non-technical roles, our AI helps you find the right candidates faster. The system works in any browser with no minimum or maximum limits - you only pay for what you use."
              },
              {
                question: "What do I need to get started?",
                answer: "Simply enter your job description, requirements, and responsibilities for the position you want to screen candidates for. Hirios handles the rest! The system runs on any browser and requires no special setup."
              },
              {
                question: "Can I export my data and results?",
                answer: "Yes! All hiring results and resumes can be exported as PDF files. You maintain full control over your data and can export candidate information, screening results, and interview summaries whenever needed. This ensures you have complete records for your hiring process."
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
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 relative">
        <Particles
          className="absolute inset-0"
          quantity={1000}
          color="#ffffff"
          size={0.4}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
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
      <footer className="bg-gray-900 text-white py-8 sm:py-12 border-t border-gray-800 relative">
        <Particles
          className="absolute inset-0"
          quantity={1000}
          color="#ffffff"
          size={0.4}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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