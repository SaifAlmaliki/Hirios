import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Users, LogOut, Settings, Brain, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResponsiveHeaderProps {
  user: any;
  userType: string;
  onSignOut: () => void;
  onCompanySetup: () => void;
  onSubscription: () => void;
  onScreeningResults: () => void;
  onSignIn: () => void;
  isCompanyView?: boolean;
  onToggleView?: (isCompany: boolean) => void;
  showViewToggle?: boolean;
}

export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  user,
  userType,
  onSignOut,
  onCompanySetup,
  onSubscription,
  onScreeningResults,
  onSignIn,
  isCompanyView = true,
  onToggleView,
  showViewToggle = false
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Job Portal</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* View Toggle - only show if user is not authenticated */}
            {showViewToggle && !user && (
              <div className="flex items-center space-x-3 bg-gray-100 p-2 rounded-lg">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-colors ${!isCompanyView ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Job Seeker</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleView?.(!isCompanyView)}
                  className="px-2"
                >
                  Toggle
                </Button>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-colors ${isCompanyView ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Company</span>
                </div>
              </div>
            )}

            {/* User Actions */}
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 hidden lg:inline">
                  {user.email} ({userType})
                </span>
                
                {userType === 'company' && (
                  <>
                    <Button variant="outline" size="sm" onClick={onCompanySetup}>
                      <Settings className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Setup</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={onSubscription}>
                      <span className="hidden sm:inline">Subscription</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={onScreeningResults}>
                      <Brain className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">AI Screening</span>
                    </Button>
                  </>
                )}
                
                <Button variant="outline" size="sm" onClick={onSignOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button onClick={onSignIn} size="sm">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            {/* View Toggle for Mobile */}
            {showViewToggle && !user && (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                  <span className="text-sm font-medium">View Mode</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleView?.(!isCompanyView)}
                  >
                    {isCompanyView ? 'Switch to Job Seeker' : 'Switch to Company'}
                  </Button>
                </div>
              </div>
            )}

            {/* User Info for Mobile */}
            {user && (
              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600">
                  {user.email} ({userType})
                </p>
              </div>
            )}

            {/* Mobile Navigation Items */}
            <div className="space-y-2">
              {user ? (
                <>
                  {userType === 'company' && (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={onCompanySetup}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Setup
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={onSubscription}
                      >
                        Subscription
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={onScreeningResults}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        AI Screening
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600"
                    onClick={onSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  onClick={onSignIn}
                  className="w-full"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 