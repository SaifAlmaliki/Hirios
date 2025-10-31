import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AcceptInvitationResponse {
  success: boolean;
  error?: string;
  profile_id?: string;
}

interface TeamInvitation {
  id: string;
  company_profile_id: string;
  invited_email: string;
  invited_by: string;
  token: string;
  used: boolean;
  created_at: string;
  company_profiles?: {
    company_name: string;
  };
}

export default function JoinTeam() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [invitation, setInvitation] = useState<TeamInvitation | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const hasAttemptedAutoAccept = useRef(false);

  const fetchInvitation = useCallback(async () => {
    try {
      const { data, error: invitationError } = await supabase
        .from("team_invitations")
        .select("*, company_profiles(company_name)")
        .eq("token", token)
        .eq("used", false)
        .single();

      if (invitationError || !data) {
        console.error("Invitation fetch error:", invitationError);
        setError("This invitation is invalid or has already been used");
        setIsLoading(false);
        return;
      }

      // Log for debugging if company_profiles is missing
      if (!data.company_profiles) {
        console.warn("Company profile not found for invitation:", {
          token,
          company_profile_id: data.company_profile_id,
          invitation_id: data.id,
        });
      }

      setInvitation(data as TeamInvitation);
      setCompanyName(data.company_profiles?.company_name || "Unknown Company");
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching invitation:", err);
      setError("Failed to load invitation");
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link");
      setIsLoading(false);
      return;
    }

    fetchInvitation();
  }, [token, fetchInvitation]);

  // Auto-accept invitation if user is logged in and email matches
  useEffect(() => {
    const checkAndAccept = async () => {
      // Don't run if still loading auth or invitation, or if we already attempted
      if (authLoading || isLoading || !invitation || hasAttemptedAutoAccept.current) return;

      // Wait a bit for auth state to settle if user just logged in
      if (user && user.email === invitation.invited_email && !hasAttemptedAutoAccept.current) {
        hasAttemptedAutoAccept.current = true;
        
        try {
          setIsLoading(true);
          const { data, error } = await supabase.rpc("accept_team_invitation", {
            invitation_token: token,
          });

          if (error) throw error;

          const response = data as unknown as AcceptInvitationResponse;

          if (response && response.success) {
            toast.success("Welcome to the team! 🎉");
            navigate("/job-portal");
          } else {
            setError(response?.error || "Failed to accept invitation");
            setIsLoading(false);
          }
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : "Failed to accept invitation";
          console.error("Error auto-accepting invitation:", err);
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    checkAndAccept();
  }, [invitation, token, navigate, user, authLoading, isLoading]);

  const handleAcceptInvitation = async () => {
    // Check if user is logged in
    if (!user) {
      // Store redirect URL in session storage and redirect to auth
      sessionStorage.setItem("postLoginRedirectUrl", `/join/${token}`);
      navigate(`/auth`);
      return;
    }

    // Check if user's email matches invitation
    if (user.email !== invitation?.invited_email) {
      toast.error(`This invitation is for ${invitation?.invited_email}. Please log in with that email.`);
      await supabase.auth.signOut();
      sessionStorage.setItem("postLoginRedirectUrl", `/join/${token}`);
      navigate(`/auth`);
      return;
    }

    // Accept the invitation
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("accept_team_invitation", {
        invitation_token: token,
      });

      if (error) throw error;

      const response = data as unknown as AcceptInvitationResponse;

      if (response && response.success) {
        toast.success("Welcome to the team! 🎉");
        navigate("/job-portal");
      } else {
        toast.error(response?.error || "Failed to accept invitation");
        setError(response?.error || "Failed to accept invitation");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to accept invitation";
      console.error("Error accepting invitation:", err);
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">You're Invited! 🎉</CardTitle>
          <CardDescription>
            Join the {companyName} team on Hirios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">As a team member, you'll be able to:</h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>View and create job postings</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Access the resume pool</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Screen candidates with AI</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Send interview invitations and rejections</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Collaborate with your HR team</span>
              </li>
            </ul>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <p className="font-medium mb-1">Invitation for:</p>
            <p className="text-gray-900">{invitation?.invited_email}</p>
          </div>

          <Button
            onClick={handleAcceptInvitation}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            By accepting, you'll be added to the {companyName} team
          </p>
          
          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">Don't have an account?</p>
              <p>You can sign up with the email <strong>{invitation?.invited_email}</strong> to accept this invitation. No separate company setup needed!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
