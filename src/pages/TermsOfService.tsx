import React from 'react';
import { Particles } from '@/components/ui/particles';
import { Brain, ArrowLeft, FileText, AlertTriangle, Scale, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 relative">
      <Particles
        className="absolute inset-0"
        quantity={1000}
        color="#3B82F6"
        size={0.4}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate(-1)}
                  className="hover:bg-gray-800 text-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-full">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-white text-lg">Hirios</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Terms of <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Please read these terms carefully before using our AI-powered hiring platform.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8">
            {/* Acceptance of Terms */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-600/20 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Acceptance of Terms</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <p>
                  By accessing and using Hirios ("the Service"), you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These Terms of Service apply to all users of the Service, including without limitation users who are 
                  browsers, job seekers, companies, and/or contributors of content.
                </p>
              </div>
            </section>

            {/* Service Description */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-purple-600/20 p-3 rounded-full">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Service Description</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <p>
                  Hirios is an AI-powered hiring platform that provides:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Automated resume screening and candidate evaluation</li>
                  <li>AI-powered voice interviews and assessments</li>
                  <li>Job posting and application management</li>
                  <li>Candidate matching and ranking algorithms</li>
                  <li>Collaborative hiring tools for teams</li>
                </ul>
                <p>
                  We reserve the right to modify, suspend, or discontinue the Service at any time without notice.
                </p>
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-600/20 p-3 rounded-full">
                  <Scale className="h-6 w-6 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">User Responsibilities</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Accurate Information</h3>
                    <p>Provide accurate, current, and complete information during registration and use of the Service.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Account Security</h3>
                    <p>Maintain the security of your account credentials and notify us of any unauthorized access.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Compliance</h3>
                    <p>Use the Service in compliance with all applicable laws and regulations.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Prohibited Uses</h3>
                    <p>Do not use the Service for illegal, harmful, or unauthorized purposes.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Services and Limitations */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-orange-600/20 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">AI Services and Limitations</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-orange-400 mb-3">Important Disclaimers</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• AI screening results are recommendations, not final hiring decisions</li>
                    <li>• Human oversight and judgment should always be applied</li>
                    <li>• AI may not be 100% accurate and may contain biases</li>
                    <li>• Users are responsible for final hiring decisions</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">AI Processing</h3>
                  <p>
                    Our AI systems analyze resumes, conduct interviews, and provide candidate assessments. 
                    These are tools to assist in the hiring process, not replacements for human judgment.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-white">Data Processing</h3>
                  <p>
                    By using our AI services, you consent to the processing of candidate data through our 
                    AI algorithms for screening and assessment purposes.
                  </p>
                </div>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-cyan-600/20 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Intellectual Property</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Our Content</h3>
                    <p>The Service and its original content, features, and functionality are owned by Hirios and are protected by international copyright, trademark, and other intellectual property laws.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Your Content</h3>
                    <p>You retain ownership of content you submit to the Service, but grant us a license to use, modify, and display such content in connection with the Service.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">Limitation of Liability</h2>
              
              <div className="space-y-4 text-gray-300">
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-400 mb-3">Important Legal Notice</h3>
                  <p className="text-sm">
                    In no event shall Hirios, its directors, employees, partners, agents, suppliers, or affiliates 
                    be liable for any indirect, incidental, special, consequential, or punitive damages, including 
                    without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting 
                    from your use of the Service.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">AI Service Limitations</h3>
                  <p>
                    We do not guarantee the accuracy, completeness, or reliability of AI-generated assessments, 
                    recommendations, or screening results. Users assume full responsibility for hiring decisions.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-white">Service Availability</h3>
                  <p>
                    We do not guarantee that the Service will be available at all times or that it will be free 
                    from errors, viruses, or other harmful components.
                  </p>
                </div>
              </div>
            </section>

            {/* Termination */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">Termination</h2>
              
              <div className="space-y-4 text-gray-300">
                <p>
                  We may terminate or suspend your account and bar access to the Service immediately, without 
                  prior notice or liability, under our sole discretion, for any reason whatsoever and without 
                  limitation, including but not limited to a breach of the Terms.
                </p>
                
                <p>
                  If you wish to terminate your account, you may simply discontinue using the Service or contact 
                  us to request account deletion.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">Changes to Terms</h2>
              
              <div className="space-y-4 text-gray-300">
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                  If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                </p>
                
                <p>
                  Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
              
              <div className="space-y-4 text-gray-300">
                <p>
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                    <p>legal@hirios.com</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Support</h3>
                    <p>support@hirios.com</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
