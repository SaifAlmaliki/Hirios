
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Clock, DollarSign, Calendar, Upload, FileText, Building } from 'lucide-react';
import { Job } from '../hooks/useJobs';
import { useCreateApplication } from '../hooks/useApplications';

interface UserViewProps {
  jobs: Job[];
}

const UserView: React.FC<UserViewProps> = ({ jobs }) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationData, setApplicationData] = useState({
    full_name: '',
    email: '',
    phone: '',
    resume: null as File | null
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const createApplicationMutation = useCreateApplication();

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        return;
      }
      setApplicationData(prev => ({ ...prev, resume: file }));
    }
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!applicationData.full_name || !applicationData.email || !applicationData.phone || !selectedJob) {
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicationData.email)) {
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(applicationData.phone)) {
      return;
    }

    createApplicationMutation.mutate({
      job_id: selectedJob.id,
      full_name: applicationData.full_name,
      email: applicationData.email,
      phone: applicationData.phone,
      resume_url: applicationData.resume?.name || null,
      status: 'pending'
    }, {
      onSuccess: () => {
        setApplicationData({
          full_name: '',
          email: '',
          phone: '',
          resume: null
        });
        setIsDialogOpen(false);
        setSelectedJob(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Available Positions</h2>
        <p className="text-gray-600 mt-1">Find your next career opportunity</p>
      </div>

      {/* Job Listings */}
      <div className="grid gap-6">
        {jobs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Jobs Available</h3>
                <p>Check back later for new opportunities!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-green-900">{job.title}</CardTitle>
                    <CardDescription className="text-lg font-medium text-gray-700">{job.company}</CardDescription>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-1" />
                    {job.department}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {job.employment_type}
                  </div>
                  {job.salary && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {job.salary}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{job.description}</p>
                
                {job.requirements && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                    <p className="text-gray-700 text-sm">{job.requirements}</p>
                  </div>
                )}
                
                {job.benefits && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                    <p className="text-gray-700 text-sm">{job.benefits}</p>
                  </div>
                )}
                
                <Dialog open={isDialogOpen && selectedJob?.id === job.id} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setSelectedJob(null);
                    setApplicationData({
                      full_name: '',
                      email: '',
                      phone: '',
                      resume: null
                    });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => handleApply(job)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Apply Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-green-900">Apply for {job.title}</DialogTitle>
                      <DialogDescription>
                        Please fill in your information to apply for this position at {job.company}.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmitApplication} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                        <Input
                          id="full_name"
                          value={applicationData.full_name}
                          onChange={(e) => setApplicationData(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Enter your full name"
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={applicationData.email}
                          onChange={(e) => setApplicationData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email address"
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={applicationData.phone}
                          onChange={(e) => setApplicationData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter your phone number"
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="resume" className="text-sm font-medium text-gray-700">Resume (PDF only)</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="resume"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                          <Upload className="h-4 w-4 text-gray-400" />
                        </div>
                        {applicationData.resume && (
                          <p className="text-sm text-green-600 flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {applicationData.resume.name}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createApplicationMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {createApplicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default UserView;
