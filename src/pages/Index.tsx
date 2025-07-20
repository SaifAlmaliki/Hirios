
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, ArrowRight, Star, CheckCircle, TrendingUp, Globe, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, userType, signOut, loading } = useAuth();

  // Redirect authenticated users directly to their dashboards
  React.useEffect(() => {
    if (!loading && user) {
      if (userType === 'job_seeker') {
        navigate('/job-portal');
      } else if (userType === 'company') {
        navigate('/job-portal');
      }
    }
  }, [user, userType, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // Only show landing page for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        {/* Floating Header */}
        <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-full">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">JobPortal Pro</span>
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
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Your Dream Job
                <br />
                <span className="text-blue-600">Awaits Here</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Connect top talent with exceptional opportunities. Whether you're seeking your next career move or building your dream team.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button 
                  onClick={() => navigate('/auth')}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold hover-scale"
                >
                  Find Jobs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold hover-scale"
                >
                  Post Jobs
                  <Building2 className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20">
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600">Jobs Posted</div>
              </div>
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="text-4xl font-bold text-blue-600 mb-2">5K+</div>
                <div className="text-gray-600">Companies</div>
              </div>
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
                <div className="text-gray-600">Success Stories</div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
              <p className="text-xl text-gray-600">Real people, real achievements, real impact</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="hover:shadow-xl transition-all duration-300 hover-scale border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Sarah Chen</CardTitle>
                  <CardDescription>Software Engineer at Google</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    "Found my dream job in just 2 weeks! The platform made it so easy to connect with top tech companies."
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 hover-scale border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Tech Innovations Inc.</CardTitle>
                  <CardDescription>Startup Company</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    "Hired 15 amazing developers in 3 months. The quality of candidates is exceptional!"
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 hover-scale border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Globe className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Marcus Johnson</CardTitle>
                  <CardDescription>Marketing Director</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    "Transitioned from finance to marketing seamlessly. The platform opened doors I never knew existed."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
              <p className="text-xl text-gray-600">Trusted by thousands of professionals worldwide</p>
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
                    "The best job platform I've ever used. Clean interface, relevant matches, and amazing support team."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      A
                    </div>
                    <div>
                      <div className="font-semibold">Alex Rodriguez</div>
                      <div className="text-gray-500 text-sm">Product Manager</div>
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
                    "Incredible ROI for our hiring budget. We've built our entire engineering team through this platform."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      L
                    </div>
                    <div>
                      <div className="font-semibold">Lisa Park</div>
                      <div className="text-gray-500 text-sm">HR Director</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose JobPortal Pro?</h2>
              <p className="text-xl text-gray-600">Everything you need for your career journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Instant Matching</h3>
                <p className="text-gray-600 leading-relaxed">
                  AI-powered matching connects you with the most relevant opportunities based on your skills and preferences.
                </p>
              </div>

              <div className="text-center group">
                <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-6 group-hover:bg-green-200 transition-colors duration-300">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Global Network</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access to thousands of companies worldwide, from startups to Fortune 500 enterprises.
                </p>
              </div>

              <div className="text-center group">
                <div className="bg-purple-100 p-4 rounded-full w-fit mx-auto mb-6 group-hover:bg-purple-200 transition-colors duration-300">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Verified Quality</h3>
                <p className="text-gray-600 leading-relaxed">
                  All companies and job postings are verified to ensure authentic, high-quality opportunities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of professionals who've found their perfect match
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-6 text-lg font-semibold hover-scale"
            >
              Start Your Journey Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Narrow Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="bg-blue-600 p-2 rounded-full">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">JobPortal Pro</span>
              </div>
              
              <div className="flex space-x-6 text-sm text-gray-400">
                <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                <span className="hover:text-white cursor-pointer transition-colors">Contact Us</span>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm text-gray-400">
              © 2025 JobPortal Pro. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // This return should never be reached due to the redirect effect above
  return null;
};

export default Index;
