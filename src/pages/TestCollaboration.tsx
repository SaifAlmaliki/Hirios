import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useJobInvitations, useJobCollaborators } from '@/hooks/useJobInvitations';
import { useCompanyJobs } from '@/hooks/useCompanyJobs';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Mail, Plus } from 'lucide-react';

const TestCollaboration: React.FC = () => {
  const { user } = useAuth();
  const { data: jobs = [] } = useCompanyJobs();
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const { data: invitations = [] } = useJobInvitations(selectedJobId);
  const { data: collaborators = [] } = useJobCollaborators(selectedJobId);

  const selectedJob = jobs.find(job => job.id === selectedJobId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Job Collaboration Test
          </h1>
          <p className="text-gray-600">
            Test the job collaboration feature by selecting a job and managing collaborators
          </p>
        </div>

        {!user && (
          <Card className="mb-6">
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Please sign in to test the collaboration feature</p>
            </CardContent>
          </Card>
        )}

        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Select a Job
                </CardTitle>
                <CardDescription>
                  Choose a job to test collaboration features
                </CardDescription>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No jobs found. Create a job first to test collaboration.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {jobs.map((job) => (
                      <Button
                        key={job.id}
                        variant={selectedJobId === job.id ? "default" : "outline"}
                        onClick={() => setSelectedJobId(job.id)}
                        className="w-full justify-start"
                      >
                        {job.title}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Collaboration Status */}
            {selectedJobId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Collaboration Status
                  </CardTitle>
                  <CardDescription>
                    Current collaborators and pending invitations for "{selectedJob?.title}"
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Collaborators */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Collaborators ({collaborators.length})
                    </h4>
                    {collaborators.length === 0 ? (
                      <p className="text-sm text-gray-500">No collaborators yet</p>
                    ) : (
                      <div className="space-y-2">
                        {collaborators.map((collaborator) => (
                          <div
                            key={collaborator.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                          >
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {collaborator.company_profiles?.company_name?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <span className="text-sm">
                              {collaborator.company_profiles?.company_name || 'Unknown Company'}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              ({collaborator.role})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Invitations */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Pending Invitations ({invitations.filter(inv => inv.status === 'pending').length})
                    </h4>
                    {invitations.length === 0 ? (
                      <p className="text-sm text-gray-500">No invitations sent yet</p>
                    ) : (
                      <div className="space-y-2">
                        {invitations.map((invitation) => (
                          <div
                            key={invitation.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                          >
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{invitation.invited_email}</span>
                            <span className="text-xs text-gray-500">
                              ({invitation.status})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Test Instructions */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Test Instructions:</h4>
                    <ol className="text-sm text-blue-800 space-y-1">
                      <li>1. Go to the job portal and edit this job</li>
                      <li>2. Scroll down to see the "Collaboration Manager" section</li>
                      <li>3. Click "Invite Collaborator" and enter an email</li>
                      <li>4. Check the console for the invitation link</li>
                      <li>5. Visit the invitation link to test acceptance</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCollaboration;
