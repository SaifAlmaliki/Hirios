import React from 'react';
import { Particles } from '@/components/ui/particles';
import { Brain, ArrowLeft, Shield, Eye, Database, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
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
              Privacy <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8">
            {/* Information We Collect */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-600/20 p-3 rounded-full">
                  <Database className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Information We Collect</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Name, email address, and contact information</li>
                    <li>Resume and job application materials</li>
                    <li>Professional background and work experience</li>
                    <li>Voice recordings from AI interviews (with consent)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Usage Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>How you interact with our platform</li>
                    <li>Job search preferences and behavior</li>
                    <li>Device information and IP address</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-purple-600/20 p-3 rounded-full">
                  <Eye className="h-6 w-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">How We Use Your Information</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">AI Screening</h3>
                    <p>We use your information to provide AI-powered candidate screening and job matching services.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Platform Improvement</h3>
                    <p>We analyze usage patterns to improve our services and develop new features.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Communication</h3>
                    <p>We send you updates about your applications, job matches, and platform notifications.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Legal Compliance</h3>
                    <p>We process data to comply with legal obligations and protect our rights.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Protection */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-600/20 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Data Protection & Security</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Encryption</h3>
                    <p>All data is encrypted in transit and at rest using industry-standard protocols.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Access Controls</h3>
                    <p>Strict access controls ensure only authorized personnel can access your data.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Regular Audits</h3>
                    <p>We conduct regular security audits and assessments to maintain data protection.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Secure Infrastructure</h3>
                    <p>We use secure cloud infrastructure with enterprise-grade security measures.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-orange-600/20 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Your Rights</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Access & Portability</h3>
                    <p>Request a copy of your data or transfer it to another service.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Correction</h3>
                    <p>Update or correct any inaccurate personal information.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Deletion</h3>
                    <p>Request deletion of your personal data (subject to legal requirements).</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Opt-out</h3>
                    <p>Unsubscribe from marketing communications at any time.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Processing */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">AI Processing & Transparency</h2>
              
              <div className="space-y-4 text-gray-300">
                <p>
                  Our AI systems process your information to provide screening and matching services. 
                  We are committed to transparency in our AI decision-making processes.
                </p>
                
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">AI Decision Transparency</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• We provide explanations for AI screening decisions</li>
                    <li>• You can request information about how AI processed your data</li>
                    <li>• We regularly audit our AI systems for bias and fairness</li>
                    <li>• Human oversight is maintained for critical decisions</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
              
              <div className="space-y-4 text-gray-300">
                <p>
                  If you have questions about this Privacy Policy or want to exercise your rights, 
                  please contact us:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                    <p>privacy@hirios.com</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Response Time</h3>
                    <p>We respond to privacy requests within 30 days</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Changes to Policy */}
            <section className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">Changes to This Policy</h2>
              
              <div className="space-y-4 text-gray-300">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any 
                  material changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
                
                <p>
                  Your continued use of our services after any changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
