import React from 'react';
import CompanyView from '../components/CompanyView';
import Navbar from '../components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

const JobPortal = () => {
  const { loading } = useAuth();

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar title="AI Screening" />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-3 sm:pt-24 sm:pb-4 md:pt-24 md:pb-6">
        <CompanyView />
      </div>
    </div>
  );
};

export default JobPortal;