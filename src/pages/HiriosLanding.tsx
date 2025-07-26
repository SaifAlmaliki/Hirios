import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  ArrowRight, 
  Star, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  Target,
  Upload,
  Brain,
  BarChart3,
  Users,
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
    <div className="min-h-screen bg-white">
      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-full animate-pulse">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Hirios</span>
          </div>
          <Button 
            onClick={() => navigate('/auth')} 
            size="sm"
            className="ml-8 bg-blue-600 hover:bg-blue-700"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Hire Smarter, Not Harder
              <br />
              <span className="text-blue-600">AI-Powered Candidate Screening in Seconds</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Upload a job description and resumes—our AI analyzes fit, ranks candidates, and explains why. No more manual screening.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                onClick={() => navigate('/auth')}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold hover:scale-105 transition-transform"
              >
                Start Screening with AI
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold hover:scale-105 transition-transform"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
                <BarChart3 className="ml-2 h-5 w-5" />
              </Button>
            </div>


          </div>


        </div>
      </section>

      {/* How It Works */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple workflow for smarter hiring decisions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            {/* Step 1: Company Posts Job */}
            <div className="text-center">
              <div className="bg-blue-100 p-6 rounded-full w-fit mx-auto mb-6 relative">
                <Building2 className="h-12 w-12 text-blue-600" />
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  1
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-3">Company Registers & Posts Jobs</h3>
              <p className="text-gray-600 text-sm">
                Companies sign up, complete their profile, and post jobs with detailed descriptions and requirements.
              </p>
            </div>

            {/* Step 2: Job Seekers Apply */}
            <div className="text-center">
              <div className="bg-green-100 p-6 rounded-full w-fit mx-auto mb-6 relative">
                <Users className="h-12 w-12 text-green-600" />
                <div className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  2
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-3">Job Seekers Apply</h3>
              <p className="text-gray-600 text-sm">
                Job seekers register for free, browse available positions, and submit applications with their resumes.
              </p>
            </div>

            {/* Step 3: AI Analysis */}
            <div className="text-center">
              <div className="bg-purple-100 p-6 rounded-full w-fit mx-auto mb-6 relative">
                <Brain className="h-12 w-12 text-purple-600" />
                <div className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-3">AI Analyzes Applications</h3>
              <p className="text-gray-600 text-sm">
                Our AI agent automatically analyzes each resume against job requirements, generating detailed insights.
              </p>
            </div>

            {/* Step 4: Company Reviews */}
            <div className="text-center">
              <div className="bg-orange-100 p-6 rounded-full w-fit mx-auto mb-6 relative">
                <BarChart3 className="h-12 w-12 text-orange-600" />
                <div className="absolute -top-2 -right-2 bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  4
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-3">Review AI Insights</h3>
              <p className="text-gray-600 text-sm">
                Companies receive scored candidates with strengths, weaknesses, and AI justifications for easy screening.
              </p>
            </div>
          </div>

          {/* Detailed Flow Explanation */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What Companies Get for Each Candidate</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Match Score</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  Percentage match based on skills, experience, and job requirements alignment.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Strengths & Weaknesses</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  Clear breakdown of candidate's strong points and areas that may need development.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">AI Justification</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  Detailed explanation of why the candidate is or isn't a good fit for the position.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Hirios?</h2>
            <p className="text-xl text-gray-600">Everything you need for intelligent hiring</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-6">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Smart Scoring</h3>
              <p className="text-gray-600 text-sm">
                AI compares resumes to job requirements with accurate % match scores.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-6">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Bias Reduction</h3>
              <p className="text-gray-600 text-sm">
                Focus on skills and experience, not names, schools, or demographics.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-fit mx-auto mb-6">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Time Saved</h3>
              <p className="text-gray-600 text-sm">
                Cut screening time by 80% and focus only on top candidates.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 p-4 rounded-full w-fit mx-auto mb-6">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">ATS Ready</h3>
              <p className="text-gray-600 text-sm">
                Ready to integrate with any ATS or use manual uploads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Companies Say</h2>
            <p className="text-xl text-gray-600">Trusted by hiring teams worldwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  "Hirios cut our screening time by 75%—we now focus only on top candidates. The AI insights are incredibly accurate."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    S
                  </div>
                  <div>
                    <div className="font-semibold">Sarah Mitchell</div>
                    <div className="text-gray-500 text-sm">HR Director, TechFlow Solutions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  "Game changer for our startup. We hired 5 engineers in 2 weeks instead of 2 months. The scoring is spot-on."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    M
                  </div>
                  <div>
                    <div className="font-semibold">Marcus Chen</div>
                    <div className="text-gray-500 text-sm">CEO, InnovateLab</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your hiring needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free Plan */}
            <Card className="relative border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for small teams</CardDescription>
                <div className="text-4xl font-bold text-gray-900">€0<span className="text-lg font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Screen 10 candidates/month</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Basic AI scoring</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>PDF resume upload</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Email support</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-6"
                  variant="outline"
                  onClick={() => navigate('/auth')}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative border-2 border-blue-500 bg-blue-50">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                Most Popular
              </Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription>For growing companies</CardDescription>
                <div className="text-4xl font-bold text-blue-600">€24.99<span className="text-lg font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Unlimited jobs</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>100 candidates/month</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Advanced AI insights</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Customizable scoring criteria</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>ATS integration ready</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-6 bg-gray-400 cursor-not-allowed"
                  disabled
                >
                  Premium (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about Hirios</p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How does scoring work?",
                answer: "AI weights skills, experience, and keywords from the job description to generate accurate match percentages."
              },
              {
                question: "Is my data secure?",
                answer: "Yes, all data is encrypted and stored securely. We follow industry best practices for data protection."
              },
              {
                question: "Can I integrate with my existing ATS?",
                answer: "Our platform is designed to integrate with popular ATS systems. Contact us for specific integration requirements."
              },
              {
                question: "What file formats do you support?",
                answer: "We currently support PDF resumes and job descriptions. More formats are coming soon."
              },
              {
                question: "How accurate is the AI scoring?",
                answer: "Our AI has been trained on thousands of successful hires and provides 90%+ accuracy in candidate-job matching."
              }
            ].map((faq, index) => (
              <Collapsible key={index}>
                <CollapsibleTrigger 
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-6 py-4 text-left hover:bg-gray-50"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 py-4 border-l border-r border-b border-gray-200 rounded-b-lg">
                  <p className="text-gray-600">{faq.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Hiring with AI Today
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join hundreds of companies who've transformed their hiring process with Hirios
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-6 text-lg font-semibold hover:scale-105 transition-transform"
          >
            Get Started - No Credit Card Needed
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-blue-600 p-2 rounded-full">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">Hirios</span>
            </div>
            
            <div className="flex space-x-6 text-sm text-gray-400">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-white cursor-pointer transition-colors">Contact Us</span>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm text-gray-400">
            © 2025 Hirios. All rights reserved. AI-powered hiring made simple.
          </div>
        </div>
      </footer>


    </div>
  );
};

export default HiriosLanding; 