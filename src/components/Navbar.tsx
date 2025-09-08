import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, LogOut, Settings, Brain, Menu, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  title?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl';
}

const Navbar: React.FC<NavbarProps> = ({
  title = "Job Portal",
  showBackButton = false,
  backButtonText = "Back",
  backButtonPath = "/job-portal",
  maxWidth = "7xl"
}) => {
  const { user, signOut, loading } = useAuth();
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

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCompanySetup = () => {
    navigate('/company-setup');
  };

  const handleScreeningResults = () => {
    navigate('/screening-results');
  };

  const handleBackClick = () => {
    navigate(backButtonPath);
  };

  // Get max width class
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '4xl': return 'max-w-4xl';
      case '7xl': return 'max-w-7xl';
      default: return 'max-w-7xl';
    }
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className={`${getMaxWidthClass()} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo/Title or Back Button */}
          <div className="flex items-center space-x-3">
            {showBackButton ? (
              <Button
                variant="ghost"
                onClick={handleBackClick}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                {backButtonText}
              </Button>
            ) : (
              <>
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h1 
                  className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-700"
                  onClick={() => navigate('/job-portal')}
                >
                  {title}
                </h1>
              </>
            )}
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
            {/* User Actions */}
            {user ? (
              <>
                <div className="text-sm text-gray-600">
                  {user.email}
                </div>
                
                <Button variant="outline" size="sm" onClick={handleCompanySetup}>
                  <Settings className="h-4 w-4 mr-1" />
                  Setup
                </Button>

                <Button variant="outline" size="sm" onClick={handleScreeningResults}>
                  <Brain className="h-4 w-4 mr-1" />
                  AI Screening
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </>
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
            {user ? (
              <div className="space-y-3 px-4">
                <div className="text-sm text-gray-600 text-center">
                  {user.email}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={handleCompanySetup} className="w-full">
                    <Settings className="h-4 w-4 mr-1" />
                    Setup
                  </Button>

                  <Button variant="outline" size="sm" onClick={handleScreeningResults} className="w-full">
                    <Brain className="h-4 w-4 mr-1" />
                    AI Screening
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
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
  );
};

export default Navbar;
