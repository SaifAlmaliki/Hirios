
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
import CompanySetup from "./pages/CompanySetup";
import Subscription from "./pages/Subscription";
import ScreeningResults from "./pages/ScreeningResults";
import VoiceInterview from "./pages/VoiceInterview";
import NotFound from "./pages/NotFound";
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
            <Route path="/job-portal" element={<JobPortal />} />
            <Route path="/company-setup" element={<CompanySetup />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/screening-results" element={<ScreeningResults />} />
            <Route path="/interview/:screeningResultId" element={<VoiceInterview />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
