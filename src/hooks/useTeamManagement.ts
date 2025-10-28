import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { TeamInvitation, TeamMember } from "@/integrations/supabase/types/team";

export const useTeamManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current user's company profile with role
  const { data: currentProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["currentCompanyProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Get all team members for the company
  const { data: teamMembers, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["teamMembers", currentProfile?.id],
    queryFn: async () => {
      if (!currentProfile?.id) return [];

      // Get all company profiles with the same company_name
      const { data: profiles, error: profilesError } = await supabase
        .from("company_profiles")
        .select("id, user_id, company_name, role, created_at, email")
        .eq("company_name", currentProfile.company_name);

      if (profilesError) throw profilesError;
      if (!profiles) return [];

      // Map profiles to team members with proper type casting
      const membersWithEmails: TeamMember[] = profiles.map((profile) => ({
        ...profile,
        role: profile.role as 'owner' | 'member',
        email: profile.email || "Unknown",
      }));

      return membersWithEmails;
    },
    enabled: !!currentProfile?.id,
  });

  // Get pending invitations
  const { data: pendingInvitations, isLoading: isLoadingInvitations } = useQuery({
    queryKey: ["pendingInvitations", currentProfile?.id],
    queryFn: async () => {
      if (!currentProfile?.id) return [];

      const { data, error } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("company_profile_id", currentProfile.id)
        .eq("used", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TeamInvitation[];
    },
    enabled: !!currentProfile?.id && currentProfile?.role === "owner",
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: async (invitedEmail: string) => {
      if (!currentProfile?.id || !user?.email) {
        throw new Error("Missing required data");
      }

      // Get inviter name from current user
      const { data: userData } = await supabase.auth.getUser();
      const inviterName = userData.user?.user_metadata?.full_name || userData.user?.email || "Team Admin";

      const response = await supabase.functions.invoke("send-team-invitation", {
        body: {
          invitedEmail,
          companyProfileId: currentProfile.id,
          inviterName,
          companyName: currentProfile.company_name,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["pendingInvitations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });

  // Remove team member mutation
  const removeTeamMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!currentProfile?.id) {
        throw new Error("Missing company profile");
      }

      // Delete the company profile for this user
      const { error } = await supabase
        .from("company_profiles")
        .delete()
        .eq("user_id", userId)
        .eq("company_name", currentProfile.company_name);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Team member removed successfully");
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove team member");
    },
  });

  // Delete invitation mutation
  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("team_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation deleted");
      queryClient.invalidateQueries({ queryKey: ["pendingInvitations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete invitation");
    },
  });

  return {
    currentProfile,
    teamMembers,
    pendingInvitations,
    isLoading: isLoadingProfile || isLoadingMembers || isLoadingInvitations,
    isOwner: currentProfile?.role === "owner",
    sendInvitation: sendInvitationMutation.mutate,
    removeTeamMember: removeTeamMemberMutation.mutate,
    deleteInvitation: deleteInvitationMutation.mutate,
    isSendingInvitation: sendInvitationMutation.isPending,
    isRemovingMember: removeTeamMemberMutation.isPending,
    isDeletingInvitation: deleteInvitationMutation.isPending,
  };
};
