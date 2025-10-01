
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
import OfferView from "./pages/OfferView";
import InterviewVote from "./pages/InterviewVote";
import NotFound from "./pages/NotFound";
import { ButtonAlignmentDemo } from "./components/ui/button-alignment-demo";
import { VoiceInterviewService } from "./services/voiceInterviewService";

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
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteCleanup />
          <Routes>
            <Route path="/" element={<HiriosLanding />} />
            <Route path="/job-portal-old" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/confirm" element={<AuthConfirm />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/job-portal" element={<JobPortal />} />
            <Route path="/company-setup" element={<CompanySetup />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/screening-results/:id" element={<ScreeningResultDetail />} />
            <Route path="/screening-results/job/:jobId" element={<ScreeningResults />} />
            <Route path="/interview/:screeningResultId/:applicationId" element={<VoiceInterview />} />
            <Route path="/invite/:token" element={<InviteAccept />} />
            <Route path="/interview-vote/:voteToken" element={<InterviewVote />} />
            <Route path="/test-collaboration" element={<TestCollaboration />} />
            <Route path="/button-demo" element={<ButtonAlignmentDemo />} />
            <Route path="/resume-pool" element={<ResumePool />} />
            <Route path="/offer/:id" element={<OfferView />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
