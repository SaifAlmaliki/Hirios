
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyView from '../components/CompanyView';
import UserView from '../components/UserView';
import { useJobs } from '../hooks/useJobs';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveHeader } from '@/components/ResponsiveHeader';

const JobPortal = () => {
  const [isCompanyView, setIsCompanyView] = useState(true);
  const { data: jobs = [], isLoading } = useJobs(); // This fetches all public jobs for UserView
  const { user, userType, signOut } = useAuth();
  const navigate = useNavigate();

  // If user is logged in, set view based on their user type
  React.useEffect(() => {
    if (userType === 'company') {
      setIsCompanyView(true);
    } else if (userType === 'job_seeker') {
      setIsCompanyView(false);
    }
  }, [userType]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCompanySetup = () => {
    navigate('/company-setup');
  };

  const handleSubscription = () => {
    navigate('/subscription');
  };

  const handleScreeningResults = () => {
    navigate('/screening-results');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ResponsiveHeader
        user={user}
        userType={userType}
        onSignOut={handleSignOut}
        onCompanySetup={handleCompanySetup}
        onSubscription={handleSubscription}
        onScreeningResults={handleScreeningResults}
        onSignIn={() => navigate('/auth')}
        isCompanyView={isCompanyView}
        onToggleView={setIsCompanyView}
        showViewToggle={!user}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isCompanyView ? (
          <CompanyView />
        ) : (
          <UserView jobs={jobs} />
        )}
      </div>
    </div>
  );
};

export default JobPortal;
