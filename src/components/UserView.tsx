import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Clock, DollarSign, Calendar, Upload, FileText, Building, ChevronDown, ChevronUp, Users, Briefcase, CheckCircle } from 'lucide-react';
import { Job } from '../hooks/useJobs';
import { useCreateApplication } from '../hooks/useApplications';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [isUploading, setIsUploading] = useState(false);
  
  const createApplicationMutation = useCreateApplication();
  const { toast } = useToast();

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
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file only.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setApplicationData(prev => ({ ...prev, resume: file }));
    }
  };

  const uploadResumeToStorage = async (file: File, applicantEmail: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${applicantEmail}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Uploading resume to storage:', filePath);
      
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      console.log('Resume uploaded successfully:', data);
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Failed to upload resume:', error);
      return null;
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!applicationData.full_name || !applicationData.email || !applicationData.phone || !selectedJob) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicationData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Phone validation (must include country code with + prefix)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(applicationData.phone.replace(/[\s\-()]/g, ''))) {
      toast({
        title: "Invalid phone number format",
        description: "Please enter a valid phone number with country code (e.g., +49151234567).",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      let resumeUrl: string | null = null;
      
      // Upload resume to Supabase storage if provided
      if (applicationData.resume) {
        console.log('Starting resume upload...');
        resumeUrl = await uploadResumeToStorage(applicationData.resume, applicationData.email);
        
        if (!resumeUrl) {
          toast({
            title: "Upload failed",
            description: "Failed to upload resume. Please try again.",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
        console.log('Resume uploaded, URL:', resumeUrl);
      }

      // Submit application with resume URL
      createApplicationMutation.mutate({
        job_id: selectedJob.id,
        full_name: applicationData.full_name,
        email: applicationData.email,
        phone: applicationData.phone,
        resume_url: resumeUrl,
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
          setIsUploading(false);
        },
        onError: () => {
          setIsUploading(false);
        }
      });
    } catch (error) {
      console.error('Application submission failed:', error);
      toast({
        title: "Submission failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Current Job Postings</h2>
        <p className="text-lg text-gray-600">Discover your next career opportunity</p>
      </div>

      {/* Job Listings */}
      <div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job) => {
              const isExpanded = expandedJobs.has(job.id);
              return (
                <Card key={job.id} className="hover:shadow-lg transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 bg-white h-fit">
                  <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-900 mb-2">{job.title}</CardTitle>
                          <CardDescription className="text-base font-semibold text-blue-700 mb-3 flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            {job.company}
                          </CardDescription>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center text-xs text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </div>
                          <Button 
                            onClick={() => handleApply(job)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                            size="sm"
                          >
                            Apply Now
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center text-gray-700 bg-white px-2 py-1 rounded-lg shadow-sm">
                          <Users className="h-3 w-3 mr-2 text-blue-600" />
                          <span className="font-medium truncate">{job.department}</span>
                        </div>
                        <div className="flex items-center text-gray-700 bg-white px-2 py-1 rounded-lg shadow-sm">
                          <MapPin className="h-3 w-3 mr-2 text-green-600" />
                          <span className="font-medium truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center text-gray-700 bg-white px-2 py-1 rounded-lg shadow-sm">
                          <Clock className="h-3 w-3 mr-2 text-purple-600" />
                          <span className="font-medium truncate">{job.employment_type}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-4 pb-4 space-y-4">
                    {/* Job Description */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-base">Job Description</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {isExpanded ? job.description : `${job.description.substring(0, 200)}${job.description.length > 200 ? '...' : ''}`}
                        </p>
                      </div>
                    </div>

                    {/* Responsibilities */}
                    {job.responsibilities && (isExpanded || job.responsibilities.length < 150) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-base">Key Responsibilities</h4>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-gray-700 space-y-1 text-sm">
                            {job.responsibilities.split('\n').filter(resp => resp.trim()).map((resp, index) => (
                              <div key={index} className="flex items-start">
                                <span className="text-blue-600 mr-2 mt-1">•</span>
                                <span>{resp.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Requirements */}
                    {job.requirements && (isExpanded || job.requirements.length < 150) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-base">Requirements</h4>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-gray-700 space-y-1 text-sm">
                            {job.requirements.split('\n').filter(req => req.trim()).map((req, index) => (
                              <div key={index} className="flex items-start">
                                <span className="text-blue-600 mr-2 mt-1">•</span>
                                <span>{req.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    {job.benefits && (isExpanded || job.benefits.length < 150) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-base">Benefits</h4>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-gray-700 leading-relaxed text-sm">{job.benefits}</p>
                        </div>
                      </div>
                    )}

                    {/* Show More/Less Button */}
                    {(job.description.length > 200 || (job.responsibilities && job.responsibilities.length > 150) || (job.requirements && job.requirements.length > 150) || (job.benefits && job.benefits.length > 150)) && (
                      <div className="flex justify-center pt-3 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          onClick={() => toggleJobExpansion(job.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          {isExpanded ? (
                            <>
                              Show Less <ChevronUp className="h-3 w-3 ml-2" />
                            </>
                          ) : (
                            <>
                              Show More <ChevronDown className="h-3 w-3 ml-2" />
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
                              disabled={isUploading}
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
                              disabled={isUploading}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                            <Input
                              id="phone"
                              value={applicationData.phone}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="Enter your phone number with country code (e.g., +49151234567)"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              disabled={isUploading}
                            />
                            <p className="text-xs text-gray-500">
                              Please include country code (e.g., +49 for Germany, +1 for US/Canada)
                            </p>
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
                                disabled={isUploading}
                              />
                              <Upload className="h-4 w-4 text-gray-400" />
                            </div>
                            {applicationData.resume && (
                              <p className="text-sm text-green-600 flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                {applicationData.resume.name}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
                          </div>
                          
                          <div className="flex justify-end space-x-3 pt-4">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsDialogOpen(false)}
                              disabled={isUploading}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              disabled={createApplicationMutation.isPending || isUploading}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {isUploading ? 'Uploading Resume...' : createApplicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserView;
