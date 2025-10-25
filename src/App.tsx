
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import * as Sentry from '@sentry/react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import HiriosLanding from "./pages/HiriosLanding";
import JobPortal from "./pages/JobPortal";
import Auth from "./pages/Auth";
import AuthConfirm from "./pages/AuthConfirm";
import ResetPassword from "./pages/ResetPassword";
import CompanySetup from "./pages/CompanySetup";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ContactUs from "./pages/ContactUs";

import ScreeningResults from "./pages/ScreeningResults";
import ScreeningResultDetail from "./pages/ScreeningResultDetail";
import VoiceInterview from "./pages/VoiceInterview";
import InviteAccept from "./pages/InviteAccept";
import TestCollaboration from "./pages/TestCollaboration";
import ResumePool from "./pages/ResumePool";
import InterviewVote from "./pages/InterviewVote";
import NotFound from "./pages/NotFound";
import { ButtonAlignmentDemo } from "./components/ui/button-alignment-demo";
import { VoiceInterviewService } from "./services/voiceInterviewService";
import OfferDownload from "./pages/OfferDownload";
import TestRoute from "./pages/TestRoute";
import PublicJobApplication from "./pages/PublicJobApplication";

const queryClient = new QueryClient();

// Component to handle route changes and cleanup
const RouteCleanup = () => {
  const location = useLocation();
  
  React.useEffect(() => {
    // If we're not on an interview page, clean up any active conversations
    if (!location.pathname.startsWith('/interview/')) {
      VoiceInterviewService.forceEndAllConversations();
    }
  }, [location.pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SpeedInsights />
      <Analytics />
      <BrowserRouter>
        <RouteCleanup />
        <Routes>
          {/* Public routes - no authentication required */}
          <Route path="/" element={
            <LanguageProvider>
              <HiriosLanding />
            </LanguageProvider>
          } />
          <Route path="/job-portal-old" element={<Index />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/invite/:token" element={<InviteAccept />} />
          <Route path="/interview-vote/:voteToken" element={<InterviewVote />} />
          <Route path="/interview/:screeningResultId/:applicationId" element={<VoiceInterview />} />
          <Route path="/offer-download/:id" element={<OfferDownload />} />
          <Route path="/download-offer/:id" element={<OfferDownload />} />
          <Route path="/test-route/:id" element={<TestRoute />} />
          <Route path="/apply/:jobId" element={<PublicJobApplication />} />
          
          {/* Routes that need AuthProvider context */}
          <Route path="/*" element={
            <AuthProvider>
              <SubscriptionGuard>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/confirm" element={<AuthConfirm />} />
                  <Route path="/auth/reset-password" element={<ResetPassword />} />
                  <Route path="/job-portal" element={<JobPortal />} />
                  <Route path="/company-setup" element={<CompanySetup />} />
                  <Route path="/screening-results/:id" element={<ScreeningResultDetail />} />
                  <Route path="/screening-results/job/:jobId" element={<ScreeningResults />} />
                  <Route path="/test-collaboration" element={<TestCollaboration />} />
                  <Route path="/button-demo" element={<ButtonAlignmentDemo />} />
                  <Route path="/resume-pool" element={<ResumePool />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SubscriptionGuard>
            </AuthProvider>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
