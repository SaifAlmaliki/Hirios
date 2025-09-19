import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Upload, 
  FileText, 
  Building, 
  Users, 
  CheckCircle,
  Briefcase
} from 'lucide-react';
import { Job } from '../hooks/useJobs';
import { useCreateApplication } from '../hooks/useApplications';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) {
          console.error('Error fetching job:', error);
          toast({
            title: "Error",
            description: "Failed to load job details.",
            variant: "destructive",
          });
          navigate('/job-portal');
          return;
        }

        setJob(data);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load job details.",
          variant: "destructive",
        });
        navigate('/job-portal');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId, navigate, toast]);

  const handleApply = () => {
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
        .from('company_uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Storage upload error:', error);
        throw error;
      }

      console.log('✅ Resume uploaded:', data.path);
      
      // Get the signed URL for private bucket (valid for 1 hour)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('company_uploads')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (urlError) {
        console.error('❌ Error creating signed URL:', urlError);
        throw urlError;
      }

      return urlData.signedUrl;
    } catch (error) {
      console.error('❌ Resume upload failed:', error);
      return null;
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!applicationData.full_name || !applicationData.email || !applicationData.phone || !job) {
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
        job_id: job.id,
        full_name: applicationData.full_name,
        email: applicationData.email,
        phone: applicationData.phone,
        resume_url: resumeUrl,
        status: 'pending',
        job_title: job.title,
        company: job.company,
        resume_file: applicationData.resume || undefined,
        job_details: job
      }, {
        onSuccess: () => {
          setApplicationData({
            full_name: '',
            email: '',
            phone: '',
            resume: null
          });
          setIsDialogOpen(false);
          setIsUploading(false);
          toast({
            title: "Application Submitted!",
            description: "Your application has been successfully submitted.",
          });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-16 w-16 mx-auto mb-6 text-gray-400" />
          <h3 className="text-xl font-semibold mb-3">Job Not Found</h3>
          <p className="text-lg text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/job-portal')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job Portal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar 
        title="Job Details" 
        showBackButton={true}
        backButtonText="Back to Jobs"
        backButtonPath="/job-portal"
        maxWidth="4xl"
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="space-y-8">
          {/* Job Header */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-bold text-white mb-3">{job.title}</CardTitle>
                    <CardDescription className="text-xl font-semibold text-blue-100 mb-4 flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      {job.company}
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center text-sm text-blue-100 bg-blue-800 px-3 py-1 rounded-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </div>
                    <Button 
                      onClick={handleApply}
                      className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center text-blue-100 bg-blue-800 px-3 py-2 rounded-lg">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="font-medium">{job.department}</span>
                  </div>
                  <div className="flex items-center text-blue-100 bg-blue-800 px-3 py-2 rounded-lg">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-medium">{job.location}</span>
                  </div>
                  <div className="flex items-center text-blue-100 bg-blue-800 px-3 py-2 rounded-lg">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium">{job.employment_type}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Job Details - Single Column Layout */}
          <div className="space-y-6">
            {/* Job Description */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900">Job Description</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Key Responsibilities */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900">Key Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {job.responsibilities ? (
                  <div className="grid grid-cols-1 gap-2">
                    {job.responsibilities.split('\n').filter(resp => resp.trim()).map((resp, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{resp.trim()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">Responsibilities will be discussed during the interview process.</p>
                )}
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {job.requirements ? (
                  <div className="grid grid-cols-1 gap-2">
                    {job.requirements.split('\n').filter(req => req.trim()).map((req, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{req.trim()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">Basic qualifications and experience preferred.</p>
                )}
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900">Benefits</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {job.benefits ? (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{job.benefits}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">Competitive salary and benefits package available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Application Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
    </div>
  );
};

export default JobDetails;
