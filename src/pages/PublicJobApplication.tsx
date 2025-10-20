import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, Loader2, Building, Briefcase } from 'lucide-react';
import { usePublicJobApplication } from '@/hooks/usePublicJobApplication';
import { supabase } from '@/integrations/supabase/client';

interface JobInfo {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
}

const PublicJobApplication = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [candidateName, setCandidateName] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobNotFound, setJobNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fileError, setFileError] = useState('');

  const applicationMutation = usePublicJobApplication();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Fetch job information
  useEffect(() => {
    const fetchJobInfo = async () => {
      if (!jobId) {
        setJobNotFound(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company, department, location')
        .eq('id', jobId)
        .single();

      if (error || !data) {
        setJobNotFound(true);
      } else {
        setJobInfo(data);
      }
      setLoading(false);
    };

    fetchJobInfo();
  }, [jobId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');

    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setFileError('Only PDF files are allowed');
      setResumeFile(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File size must be less than 5MB');
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!candidateName.trim()) {
      setFileError('Please enter your name');
      return;
    }

    if (!resumeFile) {
      setFileError('Please upload your resume');
      return;
    }

    if (!jobId) return;

    await applicationMutation.mutateAsync({
      jobId,
      candidateName: candidateName.trim(),
      resumeFile
    });

    // Show success state
    setSubmitted(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (jobNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <Briefcase className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-6">
              The job posting you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-green-500 mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-2">
              Thank you for applying to <strong>{jobInfo?.title}</strong> at <strong>{jobInfo?.company}</strong>.
            </p>
            <p className="text-gray-600 mb-6">
              We'll review your application and get back to you soon.
            </p>
            <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Job Information */}
        <Card className="mb-6">
          <CardHeader className="bg-blue-50 border-b">
            <div className="flex items-start gap-3">
              <Building className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <CardTitle className="text-2xl text-gray-900 mb-2">{jobInfo?.title}</CardTitle>
                <p className="text-lg text-blue-600 font-semibold">{jobInfo?.company}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                  <span>📍 {jobInfo?.location}</span>
                  <span>🏢 {jobInfo?.department}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Submit Your Application</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Fill in your details below to apply for this position
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Candidate Name */}
              <div className="space-y-2">
                <Label htmlFor="candidateName" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="candidateName"
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Enter your full name"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Resume Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Resume (PDF only) *
                </Label>
                
                {!resumeFile ? (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Click to upload your resume
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      PDF only, max 5MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white hover:bg-gray-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Select File
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{resumeFile.name}</p>
                        <p className="text-sm text-gray-600">{formatFileSize(resumeFile.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setResumeFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      Change
                    </Button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {fileError && (
                  <p className="text-sm text-red-600">{fileError}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  disabled={applicationMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!candidateName.trim() || !resumeFile || applicationMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {applicationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By submitting this application, you agree to our processing of your personal data for recruitment purposes.
        </p>
      </div>
    </div>
  );
};

export default PublicJobApplication;
