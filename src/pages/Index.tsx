
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, ArrowRight, Briefcase, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <Briefcase className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Job Portal
              <span className="block text-blue-600">Admin Platform</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A comprehensive platform where companies can post job opportunities and talented individuals can discover their next career move.
            </p>
            <Link to="/job-portal">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Dual-Purpose Platform</h2>
          <p className="text-lg text-gray-600">Switch seamlessly between company and job seeker views</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Company View */}
          <Card className="border-l-4 border-l-blue-600 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-900">For Companies</CardTitle>
              <CardDescription className="text-gray-600">
                Post jobs and manage your recruitment process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Easy Job Posting</h4>
                  <p className="text-sm text-gray-600">Create detailed job listings with descriptions, requirements, and benefits</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Instant Publishing</h4>
                  <p className="text-sm text-gray-600">Jobs go live immediately and are visible to all job seekers</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Briefcase className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Manage Listings</h4>
                  <p className="text-sm text-gray-600">View and track all your posted positions in one dashboard</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Seeker View */}
          <Card className="border-l-4 border-l-green-600 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-900">For Job Seekers</CardTitle>
              <CardDescription className="text-gray-600">
                Discover opportunities and apply with ease
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Browse Jobs</h4>
                  <p className="text-sm text-gray-600">View detailed job descriptions, requirements, and company benefits</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Quick Applications</h4>
                  <p className="text-sm text-gray-600">Apply with your contact information and PDF resume</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Briefcase className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Instant Submission</h4>
                  <p className="text-sm text-gray-600">Applications are sent immediately to employers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-6">
              Whether you're hiring or job hunting, our platform makes the process simple and efficient.
            </p>
            <Link to="/job-portal">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                Launch Job Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
