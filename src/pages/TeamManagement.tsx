import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
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
import { Users, Mail, Trash2, UserPlus, Crown, User, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function TeamManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invitationToDelete, setInvitationToDelete] = useState<{id: string, email: string} | null>(null);

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
    if (userId === user?.id) {
      toast.error("You cannot remove yourself");
      return;
    }

    if (confirm(`Are you sure you want to remove ${memberEmail} from the team?`)) {
      removeTeamMember(userId);
    }
  };

  const handleDeleteInvitation = (invitationId: string, email: string) => {
    setInvitationToDelete({ id: invitationId, email });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteInvitation = () => {
    if (invitationToDelete) {
      deleteInvitation(invitationToDelete.id);
      setIsDeleteDialogOpen(false);
      setInvitationToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Navbar title="Team Management" />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading team data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar title="Team Management" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 max-w-6xl">
        {/* Invite Button */}
        <div className="mb-6 sm:mb-8 flex justify-end">
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
            {/* Mobile view - Card layout */}
            <div className="block sm:hidden space-y-4">
              {teamMembers && teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{member.email}</span>
                          {member.user_id === user?.id && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                        <div className="mt-2">
                          <Badge
                            variant={member.role === "owner" ? "default" : "secondary"}
                            className={
                              member.role === "owner"
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-xs"
                                : "text-xs"
                            }
                          >
                            {member.role === "owner" ? (
                              <Crown className="mr-1 h-3 w-3" />
                            ) : (
                              <User className="mr-1 h-3 w-3" />
                            )}
                            {member.role === "owner" ? "Owner" : "Member"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Joined: {new Date(member.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {member.role !== "owner" && member.user_id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.user_id, member.email || "")}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No team members yet
                </div>
              )}
            </div>

            {/* Desktop view - Table layout */}
            <div className="hidden sm:block overflow-x-auto">
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
                          {member.user_id === user?.id && (
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
                          {member.role !== "owner" && member.user_id !== user?.id && (
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
            </div>
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
              <>
                {/* Mobile view - Card layout */}
                <div className="block sm:hidden space-y-4">
                  {pendingInvitations.map((invitation) => (
                    <div key={invitation.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{invitation.invited_email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Sent: {new Date(invitation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteInvitation(invitation.id, invitation.invited_email)
                          }
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop view - Table layout */}
                <div className="hidden sm:block overflow-x-auto">
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
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No pending invitations
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Invitation Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Delete Invitation</DialogTitle>
                <DialogDescription className="mt-1">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the invitation for{" "}
              <span className="font-semibold text-gray-900">
                {invitationToDelete?.email}
              </span>
              ? The recipient will no longer be able to accept this invitation.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setInvitationToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteInvitation}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
