
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
