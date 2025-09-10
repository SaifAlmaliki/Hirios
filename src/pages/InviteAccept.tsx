import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, UserPlus, Building2 } from 'lucide-react';

interface InvitationDetails {
  id: string;
  job_id: string;
  invited_email: string;
  status: string;
  expires_at: string;
  jobs: {
    title: string;
    company: string;
    company_profiles: {
      company_name: string;
    };
  };
  company_profiles: {
    company_name: string;
  };
}

const InviteAccept: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setIsLoading(false);
      return;
    }

    fetchInvitationDetails();
  }, [token]);

  const fetchInvitationDetails = async () => {
    try {
      console.log('🔍 Fetching invitation with token:', token);
      
      // First, get the invitation
      const { data: invitationData, error: invitationError } = await supabase
        .from('job_invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (invitationError) {
        console.error('❌ Error fetching invitation:', invitationError);
        if (invitationError.code === 'PGRST116') {
          setError('Invitation not found');
        } else {
          setError(`Failed to load invitation details: ${invitationError.message}`);
        }
        return;
      }

      // Then get the job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          title,
          company,
          company_profiles!inner (
            company_name
          )
        `)
        .eq('id', invitationData.job_id)
        .single();

      if (jobError) {
        console.error('❌ Error fetching job details:', jobError);
        setError('Failed to load job details');
        return;
      }

      // Get the inviter company details
      const { data: inviterData, error: inviterError } = await supabase
        .from('company_profiles')
        .select('company_name')
        .eq('user_id', invitationData.invited_by)
        .single();

      if (inviterError) {
        console.error('❌ Error fetching inviter details:', inviterError);
        setError('Failed to load inviter details');
        return;
      }

      // Combine the data
      const data = {
        ...invitationData,
        jobs: jobData,
        company_profiles: inviterData
      };

      console.log('📊 Combined invitation data:', data);

      setInvitation(data as InvitationDetails);
    } catch (err) {
      console.error('💥 Unexpected error:', err);
      setError('Failed to load invitation details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to accept this invitation",
        variant: "destructive",
      });
      return;
    }

    if (!invitation) return;

    // Check if user's email matches the invitation
    if (user.email !== invitation.invited_email) {
      toast({
        title: "Email Mismatch",
        description: "This invitation was sent to a different email address",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Call the accept invitation function
      const { data, error } = await supabase.rpc('accept_job_invitation', {
        invitation_token: token
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Invitation Accepted! 🎉",
          description: `You can now collaborate on "${invitation.jobs.title}"`,
        });
        
        // Navigate to the job portal
        navigate('/job-portal');
      } else {
        throw new Error(data.error || 'Failed to accept invitation');
      }
    } catch (err: any) {
      toast({
        title: "Failed to Accept Invitation",
        description: err.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!invitation) return;

    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from('job_invitations')
        .update({ status: 'declined' })
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: "Invitation Declined",
        description: "You have declined this collaboration invitation",
      });

      navigate('/');
    } catch (err: any) {
      toast({
        title: "Failed to Decline Invitation",
        description: err.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Invalid Invitation</CardTitle>
              <CardDescription>
                {error || 'This invitation link is invalid or has expired'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isExpired = new Date(invitation.expires_at) < new Date();
  const isAccepted = invitation.status === 'accepted';
  const isDeclined = invitation.status === 'declined';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md mx-auto w-full">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Job Collaboration Invitation
            </CardTitle>
            <CardDescription>
              You've been invited to collaborate on a job posting
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Job Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Job Details</h3>
              </div>
              <p className="text-lg font-medium text-gray-900">{invitation.jobs.title}</p>
              <p className="text-gray-600">{invitation.jobs.company_profiles.company_name}</p>
            </div>

            {/* Invitation Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Invited by:</span>
                <span className="text-sm font-medium">{invitation.company_profiles.company_name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge 
                  variant={
                    isAccepted ? "default" : 
                    isDeclined ? "destructive" : 
                    isExpired ? "secondary" : 
                    "outline"
                  }
                >
                  {isAccepted ? "Accepted" : 
                   isDeclined ? "Declined" : 
                   isExpired ? "Expired" : 
                   "Pending"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expires:</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {new Date(invitation.expires_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {!isAccepted && !isDeclined && !isExpired && (
              <div className="space-y-3">
                {!user && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      Please sign in to accept this invitation
                    </p>
                  </div>
                )}
                
                {user && user.email !== invitation.invited_email && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      This invitation was sent to {invitation.invited_email}, but you're signed in as {user.email}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleAcceptInvitation}
                    disabled={isProcessing || !user || user.email !== invitation.invited_email}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Invitation
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleDeclineInvitation}
                    disabled={isProcessing}
                    variant="outline"
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Declining...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {(isAccepted || isDeclined || isExpired) && (
              <div className="text-center">
                <Button onClick={() => navigate('/')} className="w-full">
                  Go to Home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteAccept;
