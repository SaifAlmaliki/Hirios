
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, userType, signOut } = useAuth();

  const handleJobSeekerRoute = () => {
    navigate('/job-portal');
  };

  const handleCompanyRoute = () => {
    if (user && userType === 'company') {
      navigate('/job-portal');
    } else {
      navigate('/auth');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Professional Job Portal</h1>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.email} ({userType})
                </span>
                <Button variant="outline" onClick={handleSignOut} size="sm">
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Match
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're seeking your next career opportunity or looking to hire top talent, 
            our platform connects the right people at the right time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Job Seeker Card */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto bg-blue-100 p-4 rounded-full w-fit mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Job Seeker
              </CardTitle>
              <CardDescription className="text-lg">
                Discover exciting career opportunities from top companies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 text-blue-600 mr-3" />
                  Browse hundreds of job listings
                </li>
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 text-blue-600 mr-3" />
                  Apply directly to companies
                </li>
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 text-blue-600 mr-3" />
                  No registration required
                </li>
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 text-blue-600 mr-3" />
                  Free to use
                </li>
              </ul>
              
              <Button 
                onClick={handleJobSeekerRoute}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
                size="lg"
              >
                Browse Jobs
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Company Card */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Company
              </CardTitle>
              <CardDescription className="text-lg">
                Post job openings and find qualified candidates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 text-green-600 mr-3" />
                  Post unlimited job listings
                </li>
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 text-green-600 mr-3" />
                  Manage applications easily
                </li>
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 text-green-600 mr-3" />
                  Subscription: €25/month
                </li>
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 text-green-600 mr-3" />
                  Professional features
                </li>
              </ul>
              
              <Button 
                onClick={handleCompanyRoute}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                size="lg"
              >
                {user && userType === 'company' ? 'Go to Portal' : 'Get Started'}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
              <p className="text-gray-600">Intuitive interface for both job seekers and employers</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Building2 className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <p className="text-gray-600">Designed for serious career connections</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 p-3 rounded-full w-fit mx-auto mb-4">
                <ArrowRight className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Results</h3>
              <p className="text-gray-600">Quick application process and immediate responses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
