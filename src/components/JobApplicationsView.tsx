
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Mail, Phone, User, Calendar, FileText } from 'lucide-react';
import { useJobApplications } from '../hooks/useJobApplications';
import { useScreeningResults } from '../hooks/useScreeningResults';
import { Job } from '../hooks/useJobs';
import ApplicationCard from './ApplicationCard';

interface JobApplicationsViewProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

const JobApplicationsView: React.FC<JobApplicationsViewProps> = ({ job, isOpen, onClose }) => {
  const { data: applications = [], isLoading } = useJobApplications(job?.id || '');
  const { data: screeningResults = [] } = useScreeningResults();

  if (!job) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'shortlisted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hired': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-900">
            Applications for {job.title}
          </DialogTitle>
          <p className="text-gray-600">{job.company} • {applications.length} applications</p>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Loading applications...</div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No applications yet for this position.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {applications.map((application) => {
                // Find matching screening result for this application
                const screeningResult = screeningResults.find(sr => sr.application_id === application.id);
                
                return (
                  <ApplicationCard 
                    key={application.id} 
                    application={application}
                    screeningResult={screeningResult}
                    getStatusColor={getStatusColor}
                  />
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationsView;
