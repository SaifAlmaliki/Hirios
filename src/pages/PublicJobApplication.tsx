import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, Loader2, Building2, MapPin, Briefcase } from 'lucide-react';
import { usePublicJobApplication } from '@/hooks/usePublicJobApplication';
import { supabase } from '@/integrations/supabase/client';

interface JobInfo {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  company_profile_id: string;
}

interface CompanyProfile {
  logo_url: string | null;
  company_name: string;
}

const PublicJobApplication = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [candidateName, setCandidateName] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
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
        .select('id, title, company, department, location, company_profile_id')
        .eq('id', jobId)
        .single();

      if (error || !data) {
        setJobNotFound(true);
        setLoading(false);
        return;
      }

      setJobInfo(data);

      // Fetch company profile for logo
      const { data: profileData } = await supabase
        .from('company_profiles')
        .select('logo_url, company_name')
        .eq('id', data.company_profile_id)
        .single();

      if (profileData) {
        console.log('📷 Company profile data:', profileData);
        
        // If logo_url exists, convert storage path to signed URL
        if (profileData.logo_url) {
          console.log('🔗 Converting logo path to signed URL:', profileData.logo_url);
          
          const { data: signedUrlData, error: urlError } = await supabase.storage
            .from('company-logos')
            .createSignedUrl(profileData.logo_url, 3600); // 1 hour expiry

          if (urlError) {
            console.error('❌ Error creating signed URL:', urlError);
          } else {
            console.log('✅ Signed URL created:', signedUrlData?.signedUrl);
          }

          setCompanyProfile({
            ...profileData,
            logo_url: signedUrlData?.signedUrl || null
          });
        } else {
          console.log('ℹ️ No logo URL found for company');
          setCompanyProfile(profileData);
        }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-0 shadow-2xl">
          <CardContent className="pt-12 pb-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-6 shadow-lg">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
            <p className="text-lg text-gray-600 mb-2">
              Thank you for applying to <strong className="text-blue-600">{jobInfo?.title}</strong>
            </p>
            <p className="text-lg text-gray-600 mb-6">
              at <strong className="text-blue-600">{jobInfo?.company}</strong>
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
              <p className="text-sm text-gray-700">
                ✨ We'll review your application and get back to you soon.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Job Information Card - Modern Design */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-start gap-6">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                {companyProfile?.logo_url ? (
                  <img
                    src={companyProfile.logo_url}
                    alt={jobInfo?.company}
                    className="w-20 h-20 rounded-xl object-cover bg-white p-2 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                )}
              </div>

              {/* Job Details */}
              <div className="flex-1 text-white">
                <h1 className="text-3xl font-bold mb-2">{jobInfo?.title}</h1>
                <p className="text-xl font-semibold text-blue-100 mb-3">{jobInfo?.company}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <MapPin className="h-4 w-4" />
                    <span>{jobInfo?.location}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Briefcase className="h-4 w-4" />
                    <span>{jobInfo?.department}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Application Form - Modern Design */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Submit Your Application</CardTitle>
            <p className="text-gray-600 mt-2">
              Fill in your details below to apply for this position
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Candidate Name */}
              <div className="space-y-2">
                <Label htmlFor="candidateName" className="text-base font-semibold text-gray-900">
                  Full Name *
                </Label>
                <Input
                  id="candidateName"
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>

              {/* Resume Upload */}
              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-900">
                  Resume (PDF only) *
                </Label>
                
                {!resumeFile ? (
                  <div
                    className="relative border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mb-4">
                        <Upload className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        Click to upload your resume
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        PDF only, max 5MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Select File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{resumeFile.name}</p>
                        <p className="text-sm text-gray-600">{formatFileSize(resumeFile.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-green-300 text-green-700 hover:bg-green-100"
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
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  disabled={applicationMutation.isPending}
                  className="h-12 px-6 text-base font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!candidateName.trim() || !resumeFile || applicationMutation.isPending}
                  className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {applicationMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 inline-block shadow-sm">
            🔒 By submitting this application, you agree to our processing of your personal data for recruitment purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicJobApplication;
