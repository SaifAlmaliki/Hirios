import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Trash2, UserPlus, ArrowLeft, Crown, User } from "lucide-react";
import { toast } from "sonner";

export default function TeamManagement() {
  const navigate = useNavigate();
  const {
    currentProfile,
    teamMembers,
    pendingInvitations,
    isLoading,
    isOwner,
    sendInvitation,
    removeTeamMember,
    deleteInvitation,
    isSendingInvitation,
  } = useTeamManagement();

  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Redirect if not owner
  if (!isLoading && !isOwner) {
    toast.error("Only owners can access team management");
    navigate("/job-portal");
    return null;
  }

  const handleSendInvitation = () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    sendInvitation(inviteEmail);
    setInviteEmail("");
    setIsInviteDialogOpen(false);
  };

  const handleRemoveMember = (userId: string, memberEmail: string) => {
    if (userId === currentProfile?.user_id) {
      toast.error("You cannot remove yourself");
      return;
    }

    if (confirm(`Are you sure you want to remove ${memberEmail} from the team?`)) {
      removeTeamMember(userId);
    }
  };

  const handleDeleteInvitation = (invitationId: string, email: string) => {
    if (confirm(`Are you sure you want to delete the invitation for ${email}?`)) {
      deleteInvitation(invitationId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/job-portal")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job Portal
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Team Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your HR team members and invitations
              </p>
            </div>

            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Team Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation email to add a new member to your HR team.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSendInvitation();
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendInvitation}
                    disabled={isSendingInvitation}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {isSendingInvitation ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Team Members Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({teamMembers?.length || 0})
            </CardTitle>
            <CardDescription>
              Active members of your HR team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers && teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.email}
                        {member.user_id === currentProfile?.user_id && (
                          <Badge variant="outline" className="ml-2">You</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={member.role === "owner" ? "default" : "secondary"}
                          className={
                            member.role === "owner"
                              ? "bg-gradient-to-r from-purple-600 to-blue-600"
                              : ""
                          }
                        >
                          {member.role === "owner" ? (
                            <Crown className="mr-1 h-3 w-3" />
                          ) : (
                            <User className="mr-1 h-3 w-3" />
                          )}
                          {member.role === "owner" ? "Owner" : "Member"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(member.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.role !== "owner" && member.user_id !== currentProfile?.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.user_id, member.email || "")}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      No team members yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Invitations Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations ({pendingInvitations?.length || 0})
            </CardTitle>
            <CardDescription>
              Invitations that haven't been accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingInvitations && pendingInvitations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">
                        {invitation.invited_email}
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteInvitation(invitation.id, invitation.invited_email)
                          }
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No pending invitations
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
