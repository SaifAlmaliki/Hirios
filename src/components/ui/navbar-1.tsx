"use client" 

import * as React from "react"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Building2, Settings, Brain, LogOut, FileText, Clock } from "lucide-react"
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Navbar1Props {
  title?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl';
}

const Navbar1: React.FC<Navbar1Props> = ({
  title = "Talent Pool",
  showBackButton = false,
  backButtonText = "Back",
  backButtonPath = "/job-portal",
  maxWidth = "7xl"
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const subscriptionStatus = useSubscriptionStatus();
  const { data: companyProfile } = useCompanyProfile();

  const toggleMenu = () => setIsOpen(!isOpen)

  // Determine active route based on current location
  const getActiveRoute = () => {
    const path = location.pathname;
    
    if (path.startsWith('/resume-pool')) {
      return 'talent-pool';
    } else if (path.startsWith('/screening-results') || path.startsWith('/job-portal')) {
      return 'ai-screening';
    } else if (path.startsWith('/company-setup')) {
      return 'setup';
    }
    
    // Default to talent-pool for root or unknown routes
    return 'talent-pool';
  };

  const activeRoute = getActiveRoute();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleCompanySetup = () => {
    navigate('/company-setup');
    setIsOpen(false);
  };

  const handleScreeningResults = () => {
    navigate('/job-portal');
    setIsOpen(false);
  };


  const handleResumePool = () => {
    navigate('/resume-pool');
    setIsOpen(false);
  };


  const handleSignIn = () => {
    navigate('/auth');
    setIsOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/resume-pool');
  };


  // Render subscription badge conditionally
  const renderSubscriptionBadge = () => {
    if (!user || subscriptionStatus.loading) {
      return null;
    }

    if (subscriptionStatus.daysRemaining === null) {
      return null;
    }

    const isExpiringSoon = subscriptionStatus.daysRemaining <= 7;
    const badgeColor = subscriptionStatus.plan === 'trial' 
      ? (isExpiringSoon ? 'bg-red-100 text-red-700 border-red-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300')
      : (isExpiringSoon ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-green-100 text-green-700 border-green-300');

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${badgeColor} cursor-help`}
            >
              <Clock className="h-3 w-3 mr-1" />
              {subscriptionStatus.daysRemaining} {subscriptionStatus.daysRemaining === 1 ? 'day' : 'days'} left
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              {subscriptionStatus.plan === 'trial' 
                ? `Trial expires in ${subscriptionStatus.daysRemaining} ${subscriptionStatus.daysRemaining === 1 ? 'day' : 'days'}.` 
                : `Your subscription expires in ${subscriptionStatus.daysRemaining} ${subscriptionStatus.daysRemaining === 1 ? 'day' : 'days'}.`
              }
              <br />
              {subscriptionStatus.plan === 'trial' 
                ? <>Contact <strong>support@hirios.com</strong> to upgrade to a paid plan.</>
                : <>Contact <strong>support@hirios.com</strong> to renew your subscription.</>
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
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

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="flex justify-center w-full py-6 px-4">
        <div className="flex items-center justify-center px-6 py-3 bg-white rounded-full shadow-lg w-full max-w-3xl">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full py-2 px-4 fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className={`flex items-center justify-between px-4 py-2 bg-white rounded-full shadow-lg w-full ${getMaxWidthClass()} relative z-10`}>
        <div className="flex items-center">
          <motion.div
            className="w-8 h-8 mr-2 sm:mr-4 cursor-pointer flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
            onClick={handleLogoClick}
          >
            {companyProfile?.logo_url ? (
              <img 
                src={companyProfile.logo_url} 
                alt="Company Logo" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="bg-blue-600 p-1.5 rounded-full">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            )}
          </motion.div>
          <motion.h1 
            className="text-base sm:text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-700"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleLogoClick}
          >
            {title}
          </motion.h1>
        </div>
        
        {/* Tablet Navigation - Medium screens */}
        <nav className="hidden md:flex lg:hidden items-center space-x-1">
          {user ? (
            <>
              {renderSubscriptionBadge()}
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <button
                  onClick={handleResumePool}
                  className={`flex items-center px-1.5 py-1 text-sm font-medium rounded-full transition-colors ${
                    activeRoute === 'talent-pool' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-900 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Talent Pool</span>
                </button>
              </motion.div>


              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <button
                  onClick={handleScreeningResults}
                  className={`flex items-center px-1.5 py-1 text-sm font-medium rounded-full transition-colors ${
                    activeRoute === 'ai-screening' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-900 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Brain className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">AI Screening</span>
                </button>
              </motion.div>


              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-1.5 py-1 text-sm text-gray-900 hover:text-red-600 transition-colors font-medium rounded-full hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <button
                onClick={handleSignIn}
                className="inline-flex items-center justify-center px-4 py-2 text-sm text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>
            </motion.div>
          )}
        </nav>

        {/* Desktop Navigation - Large screens */}
        <nav className="hidden lg:flex items-center space-x-2">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden xl:inline">
                {user.email}
              </span>
              
              {renderSubscriptionBadge()}
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <button
                  onClick={handleResumePool}
                  className={`flex items-center px-2 py-1 text-sm font-medium rounded-full transition-colors ${
                    activeRoute === 'talent-pool' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-900 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Talent Pool
                </button>
              </motion.div>


              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                whileHover={{ scale: 1.05 }}
              >
                <button
                  onClick={handleScreeningResults}
                  className={`flex items-center px-2 py-1 text-sm font-medium rounded-full transition-colors ${
                    activeRoute === 'ai-screening' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-900 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Brain className="h-4 w-4 mr-1" />
                  AI Screening
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                whileHover={{ scale: 1.05 }}
              >
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <button
                  onClick={handleCompanySetup}
                  className={`flex items-center px-2 py-1 text-sm font-medium rounded-full transition-colors ${
                    activeRoute === 'setup' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-900 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Setup
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
                whileHover={{ scale: 1.05 }}
              >
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-2 py-1 text-sm text-gray-900 hover:text-red-600 transition-colors font-medium rounded-full hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </button>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <button
                onClick={handleSignIn}
                className="inline-flex items-center justify-center px-5 py-2 text-sm text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>
            </motion.div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <motion.button 
          className="md:hidden flex items-center" 
          onClick={toggleMenu} 
          whileTap={{ scale: 0.9 }}
        >
          <Menu className="h-6 w-6 text-gray-900" />
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-50 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-gray-900" />
            </motion.button>
            <div className="flex flex-col space-y-6">
              {user ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="text-center pb-4 border-b border-gray-200"
                  >
                    <p className="text-sm text-gray-600 mb-3">{user.email}</p>
                    <div className="flex justify-center">
                      {renderSubscriptionBadge()}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <button
                      onClick={handleResumePool}
                      className={`flex items-center w-full text-base font-medium py-3 rounded-lg transition-colors ${
                        activeRoute === 'talent-pool' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <FileText className="h-5 w-5 mr-3" />
                      Talent Pool
                    </button>
                  </motion.div>


                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <button
                      onClick={handleScreeningResults}
                      className={`flex items-center w-full text-base font-medium py-3 rounded-lg transition-colors ${
                        activeRoute === 'ai-screening' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Brain className="h-5 w-5 mr-3" />
                      AI Screening
                    </button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <button
                      onClick={handleCompanySetup}
                      className={`flex items-center w-full text-base font-medium py-3 rounded-lg transition-colors ${
                        activeRoute === 'setup' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      Setup
                    </button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full text-base text-red-600 font-medium py-3 rounded-lg transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sign Out
                    </button>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="pt-6"
                >
                  <button
                    onClick={handleSignIn}
                    className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
                  >
                    Sign In
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Navbar1 }
