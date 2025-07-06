
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Clock, DollarSign, Calendar, Upload, FileText, Building, ChevronDown, ChevronUp, Users, Briefcase } from 'lucide-react';
import { Job } from '../hooks/useJobs';
import { useCreateApplication } from '../hooks/useApplications';

interface UserViewProps {
  jobs: Job[];
}

const UserView: React.FC<UserViewProps> = ({ jobs }) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [applicationData, setApplicationData] = useState({
    full_name: '',
    email: '',
    phone: '',
    resume: null as File | null
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const createApplicationMutation = useCreateApplication();

  const toggleJobExpansion = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

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
      status: 'pending',
      job_title: selectedJob.title,
      company: selectedJob.company,
      resume_file: applicationData.resume || undefined,
      job_details: selectedJob
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Current Job Postings</h2>
        <p className="text-lg text-gray-600">Discover your next career opportunity</p>
      </div>

      {/* Job Listings */}
      <div className="space-y-6">
        {jobs.length === 0 ? (
          <Card className="text-center py-16 bg-gray-50">
            <CardContent>
              <div className="text-gray-500">
                <Briefcase className="h-16 w-16 mx-auto mb-6 text-gray-400" />
                <h3 className="text-xl font-semibold mb-3">No Jobs Available</h3>
                <p className="text-lg">Check back later for new opportunities!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => {
            const isExpanded = expandedJobs.has(job.id);
            return (
              <Card key={job.id} className="hover:shadow-lg transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 bg-white">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{job.title}</CardTitle>
                        <CardDescription className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                          <Building className="h-5 w-5 mr-2" />
                          {job.company}
                        </CardDescription>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-700 bg-white px-3 py-2 rounded-lg shadow-sm">
                          <Users className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-medium">{job.department}</span>
                        </div>
                        <div className="flex items-center text-gray-700 bg-white px-3 py-2 rounded-lg shadow-sm">
                          <MapPin className="h-4 w-4 mr-2 text-green-600" />
                          <span className="font-medium">{job.location}</span>
                        </div>
                        <div className="flex items-center text-gray-700 bg-white px-3 py-2 rounded-lg shadow-sm">
                          <Clock className="h-4 w-4 mr-2 text-purple-600" />
                          <span className="font-medium">{job.employment_type}</span>
                        </div>
                      </div>

                      {job.salary && (
                        <div className="flex items-center text-lg font-bold text-green-700 bg-green-50 px-4 py-2 rounded-lg inline-flex w-fit">
                          <DollarSign className="h-5 w-5 mr-2" />
                          {job.salary}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3 ml-6">
                      <div className="flex items-center text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </div>
                      <Button 
                        onClick={() => handleApply(job)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        size="lg"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6 pb-6 space-y-6">
                  {/* Job Description */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-lg">Job Description</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">
                        {isExpanded ? job.description : `${job.description.substring(0, 300)}${job.description.length > 300 ? '...' : ''}`}
                      </p>
                    </div>
                  </div>

                  {/* Requirements */}
                  {job.requirements && (isExpanded || job.requirements.length < 200) && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 text-lg">Requirements</h4>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-gray-700 space-y-2">
                          {job.requirements.split('\n').filter(req => req.trim()).map((req, index) => (
                            <div key={index} className="flex items-start">
                              <span className="text-blue-600 mr-3 mt-1">•</span>
                              <span>{req.trim()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {job.benefits && (isExpanded || job.benefits.length < 200) && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 text-lg">Benefits</h4>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">{job.benefits}</p>
                      </div>
                    </div>
                  )}

                  {/* Show More/Less Button */}
                  {(job.description.length > 300 || (job.requirements && job.requirements.length > 200) || (job.benefits && job.benefits.length > 200)) && (
                    <div className="flex justify-center pt-4 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        onClick={() => toggleJobExpansion(job.id)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium"
                      >
                        {isExpanded ? (
                          <>
                            Show Less <ChevronUp className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          <>
                            Show More Details <ChevronDown className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Application Dialog */}
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
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl text-blue-900">Apply for {job.title}</DialogTitle>
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
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={applicationData.phone}
                            onChange={(e) => setApplicationData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Enter your phone number"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {createApplicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserView;
