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

      console.log('📄 Uploading resume:', file.name);
      
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Storage upload error:', error);
        throw error;
      }

      console.log('✅ Resume uploaded:', data.path);
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ Resume upload failed:', error);
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

    setIsUploading(true);

    try {
      let resumeUrl: string | null = null;
      
      // Upload resume to Supabase storage if provided
      if (applicationData.resume) {
        console.log('📤 Starting resume upload...');
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
        console.log('✅ Resume URL ready');
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {jobs.map((job) => {
              const isExpanded = expandedJobs.has(job.id);
              return (
                <Card key={job.id} className="hover:shadow-xl transition-all duration-300 border border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 h-full flex flex-col shadow-md">
                  <CardHeader className="pb-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-white mb-2">{job.title}</CardTitle>
                          <CardDescription className="text-base font-semibold text-blue-200 mb-3 flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            {job.company}
                          </CardDescription>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded-full shadow-sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </div>
                          <Button 
                            onClick={() => handleApply(job)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-blue-400"
                            size="sm"
                          >
                            Apply Now
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center text-gray-200 bg-gray-700 px-2 py-1 rounded-lg shadow-sm">
                          <Users className="h-3 w-3 mr-2 text-blue-300" />
                          <span className="font-medium truncate">{job.department}</span>
                        </div>
                        <div className="flex items-center text-gray-200 bg-gray-700 px-2 py-1 rounded-lg shadow-sm">
                          <MapPin className="h-3 w-3 mr-2 text-green-300" />
                          <span className="font-medium truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center text-gray-200 bg-gray-700 px-2 py-1 rounded-lg shadow-sm">
                          <Clock className="h-3 w-3 mr-2 text-purple-300" />
                          <span className="font-medium truncate">{job.employment_type}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-4 pb-4 space-y-4 flex-1 bg-white flex flex-col">
                    {/* Job Description - Always shown */}
                    <div className="flex-shrink-0">
                      <h4 className="font-semibold text-gray-800 mb-2 text-base">Job Description</h4>
                      <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 min-h-[80px]">
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {isExpanded ? job.description : `${job.description.substring(0, 150)}${job.description.length > 150 ? '...' : ''}`}
                        </p>
                      </div>
                    </div>

                    {/* Key Responsibilities - Always shown */}
                    <div className="flex-shrink-0">
                      <h4 className="font-semibold text-gray-800 mb-2 text-base">Key Responsibilities</h4>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 min-h-[80px]">
                        {job.responsibilities ? (
                          <div className="text-gray-700 space-y-1 text-sm">
                            {(isExpanded ? job.responsibilities : job.responsibilities.substring(0, 120) + (job.responsibilities.length > 120 ? '...' : ''))
                              .split('\n').filter(resp => resp.trim()).slice(0, isExpanded ? undefined : 2).map((resp, index) => (
                              <div key={index} className="flex items-start">
                                <span className="text-blue-600 mr-2 mt-1">•</span>
                                <span>{resp.trim()}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">Responsibilities will be discussed during the interview process.</p>
                        )}
                      </div>
                    </div>

                    {/* Requirements - Always shown */}
                    <div className="flex-shrink-0">
                      <h4 className="font-semibold text-gray-800 mb-2 text-base">Requirements</h4>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100 min-h-[80px]">
                        {job.requirements ? (
                          <div className="text-gray-700 space-y-1 text-sm">
                            {(isExpanded ? job.requirements : job.requirements.substring(0, 120) + (job.requirements.length > 120 ? '...' : ''))
                              .split('\n').filter(req => req.trim()).slice(0, isExpanded ? undefined : 2).map((req, index) => (
                              <div key={index} className="flex items-start">
                                <span className="text-green-600 mr-2 mt-1">•</span>
                                <span>{req.trim()}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">Basic qualifications and experience preferred.</p>
                        )}
                      </div>
                    </div>

                    {/* Benefits - Always shown */}
                    <div className="flex-shrink-0">
                      <h4 className="font-semibold text-gray-800 mb-2 text-base">Benefits</h4>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 min-h-[60px]">
                        {job.benefits ? (
                          <p className="text-gray-700 leading-relaxed text-sm">
                            {isExpanded ? job.benefits : `${job.benefits.substring(0, 100)}${job.benefits.length > 100 ? '...' : ''}`}
                          </p>
                        ) : (
                          <p className="text-gray-500 text-sm italic">Competitive salary and benefits package available.</p>
                        )}
                      </div>
                    </div>

                    {/* Show More/Less Button - Always shown at bottom */}
                    <div className="flex justify-center pt-3 border-t border-gray-200 mt-auto">
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
                  </CardContent>

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
                              placeholder="Enter your phone number"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              disabled={isUploading}
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
