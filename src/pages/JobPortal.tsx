
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, Users, LogOut, Settings, Brain, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CompanyView from '../components/CompanyView';
import UserView from '../components/UserView';
import { useJobs } from '../hooks/useJobs';
import { useAuth } from '@/contexts/AuthContext';

const JobPortal = () => {
  const [isCompanyView, setIsCompanyView] = useState(true);
  const { data: jobs = [], isLoading } = useJobs(); // This fetches all public jobs for UserView
  const { user, userType, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Track window width for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Job Portal</h1>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* View Toggle - only show if user is not authenticated */}
              {!user && (
                <div className="flex items-center space-x-3 bg-gray-100 p-2 rounded-lg">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-colors ${!isCompanyView ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                    <Users className="h-4 w-4" />
                    <Label htmlFor="view-toggle" className="text-sm font-medium cursor-pointer">
                      Job Seeker
                    </Label>
                  </div>
                  <Switch
                    id="view-toggle"
                    checked={isCompanyView}
                    onCheckedChange={setIsCompanyView}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-colors ${isCompanyView ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                    <Building2 className="h-4 w-4" />
                    <Label htmlFor="view-toggle" className="text-sm font-medium cursor-pointer">
                      Company
                    </Label>
                  </div>
                </div>
              )}

              {/* User Actions */}
              {user ? (
                <div className="flex items-center space-x-3 flex-wrap">
                  <span className="text-sm text-gray-600 hidden lg:inline">
                    {user.email} ({userType})
                  </span>
                  
                  {userType === 'company' && (
                    <>
                      <Button variant="outline" size="sm" onClick={handleCompanySetup}>
                        <Settings className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Setup</span>
                      </Button>

                      <Button variant="outline" size="sm" onClick={handleScreeningResults}>
                        <Brain className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">AI Screening</span>
                        <span className="sm:hidden">AI</span>
                      </Button>
                    </>
                  )}
                  
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Sign Out</span>
                    <span className="sm:hidden">Out</span>
                  </Button>
                </div>
              ) : (
                <Button onClick={() => navigate('/auth')} size="sm">
                  Sign In
                </Button>
              )}
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 space-y-4">
              {!user && (
                <div className="flex items-center justify-center space-x-3 bg-gray-100 p-2 rounded-lg mx-auto w-fit">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-colors ${!isCompanyView ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                    <Users className="h-4 w-4" />
                    <Label htmlFor="mobile-view-toggle" className="text-sm font-medium cursor-pointer">
                      Job Seeker
                    </Label>
                  </div>
                  <Switch
                    id="mobile-view-toggle"
                    checked={isCompanyView}
                    onCheckedChange={setIsCompanyView}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-colors ${isCompanyView ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                    <Building2 className="h-4 w-4" />
                    <Label htmlFor="mobile-view-toggle" className="text-sm font-medium cursor-pointer">
                      Company
                    </Label>
                  </div>
                </div>
              )}
              
              {user && (
                <div className="space-y-3 px-4">
                  <div className="text-sm text-gray-600 text-center">
                    {user.email} ({userType})
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {userType === 'company' && (
                      <>
                        <Button variant="outline" size="sm" onClick={handleCompanySetup} className="w-full">
                          <Settings className="h-4 w-4 mr-1" />
                          Setup
                        </Button>

                        <Button variant="outline" size="sm" onClick={handleScreeningResults} className="w-full">
                          <Brain className="h-4 w-4 mr-1" />
                          AI Screening
                        </Button>
                      </>
                    )}
                    
                    <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
                      <LogOut className="h-4 w-4 mr-1" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}
              
              {!user && (
                <div className="px-4">
                  <Button onClick={() => navigate('/auth')} size="sm" className="w-full">
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
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
