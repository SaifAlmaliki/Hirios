import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  Building2,
  TrendingUp,
  AlertTriangle,
  Award,
  Brain,
  Mic,
  FileText,
  ExternalLink,
  Star,
  Download,
  X
} from 'lucide-react';
import { useScreeningResults, useUpdateFavoriteStatus, ScreeningResult } from '@/hooks/useScreeningResults';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { VoiceInterviewService } from '@/services/voiceInterviewService';
import { useToast } from '@/hooks/use-toast';
import ScreeningResultActions from '@/components/ScreeningResultActions';
import InlineCandidateStatusManager from '@/components/InlineCandidateStatusManager';
import InterviewAvailabilityMatrix from '@/components/InterviewAvailabilityMatrix';
import { downloadResume } from '@/lib/resumeUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ScreeningResultDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [requestingInterview, setRequestingInterview] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Bullet point parsing function
  const parseContentToBullets = (content: string) => {
    // Common abbreviations that should not end sentences
    const abbreviations = [
      'M.Sc.', 'B.Sc.', 'Ph.D.', 'M.D.', 'B.A.', 'M.A.', 'B.Eng.', 'M.Eng.',
      'B.Tech.', 'M.Tech.', 'B.Com.', 'M.Com.', 'B.B.A.', 'M.B.A.',
      'LL.B.', 'LL.M.', 'J.D.', 'D.D.S.', 'D.V.M.', 'D.O.', 'D.P.T.',
      'R.N.', 'L.P.N.', 'C.N.A.', 'P.A.', 'N.P.', 'C.R.N.A.',
      'A.A.', 'A.S.', 'A.A.S.', 'B.S.', 'M.S.', 'Ed.D.', 'Psy.D.',
      'Inc.', 'Ltd.', 'Corp.', 'Co.', 'LLC.', 'LLP.', 'P.C.',
      'St.', 'Ave.', 'Blvd.', 'Rd.', 'Dr.', 'Prof.', 'Sr.', 'Jr.',
      'vs.', 'etc.', 'i.e.', 'e.g.', 'a.m.', 'p.m.', 'U.S.', 'U.K.',
      'A.I.', 'M.L.', 'D.L.', 'C.V.', 'R&D', 'IT', 'HR', 'CEO', 'CTO', 'CFO'
    ];
    
    // First, protect abbreviations by replacing them with placeholders
    let protectedContent = content;
    const abbreviationMap: { [key: string]: string } = {};
    
    abbreviations.forEach((abbr, index) => {
      const placeholder = `__ABBR_${index}__`;
      abbreviationMap[placeholder] = abbr;
      // Use case-insensitive replacement
      const regex = new RegExp(abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      protectedContent = protectedContent.replace(regex, placeholder);
    });
    
    // Now split on sentence boundaries
    const sentences = protectedContent
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    // Restore abbreviations in each sentence
    const bullets: string[] = [];
    
    sentences.forEach((sentence) => {
      if (sentence.length > 0) {
        let restoredSentence = sentence;
        Object.entries(abbreviationMap).forEach(([placeholder, abbr]) => {
          restoredSentence = restoredSentence.replace(new RegExp(placeholder, 'g'), abbr);
        });
        bullets.push(restoredSentence);
      }
    });
    
    return bullets;
  };
  
  // Add mutation hooks
  const updateFavoriteMutation = useUpdateFavoriteStatus();
  
  const { data: screeningResults, isLoading, error } = useScreeningResults();
  const { data: companyProfile } = useCompanyProfile();
  
  const result = screeningResults?.find(r => r.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading screening result...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Screening Result Not Found</h2>
          <p className="text-gray-600 mb-6">The screening result you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/job-portal')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Portal
          </Button>
        </div>
      </div>
    );
  }

  const handleRequestVoiceScreening = (screeningResult: ScreeningResult) => {
    setRequestingInterview(screeningResult.id);
    // Add voice screening logic here
    setTimeout(() => setRequestingInterview(null), 2000);
  };

  const handleResumeDownload = async () => {
    if (!result?.resume_pool_id) {
      toast({
        title: "Resume not available",
        description: "No resume found for this candidate.",
        variant: "destructive",
      });
      return;
    }

    // Fetch resume URL from resume_pool
    const { supabase } = await import('@/integrations/supabase/client');
    const { data } = await supabase
      .from('resume_pool')
      .select('storage_path')
      .eq('id', result.resume_pool_id)
      .single();
    
    if (!data?.storage_path) {
      toast({
        title: "Resume not available",
        description: "Could not retrieve resume file.",
        variant: "destructive",
      });
      return;
    }

    const filename = `${result.first_name} ${result.last_name}_Resume.pdf`;
    await downloadResume(data.storage_path, filename);
  };

  const getScoreColor = (score: number) => {
    if (score > 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score > 70) return 'bg-green-100 text-green-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                onClick={() => {
                  // Navigate back to the specific job's results if job_id is available
                  if (result.job_id) {
                    navigate(`/screening-results/job/${result.job_id}`);
                  } else {
                    // Fallback to job portal if no job_id
                    navigate('/job-portal');
                  }
                }}
                className="hover:bg-gray-100 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Results</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {result.first_name} {result.last_name}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Favorite Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFavoriteMutation.mutate({ 
                  id: result.id, 
                  is_favorite: !result.is_favorite 
                })}
                disabled={updateFavoriteMutation.isPending}
                className={`flex items-center gap-1 sm:gap-2 ${
                  result.is_favorite 
                    ? 'border-yellow-300 text-yellow-600 hover:bg-yellow-50 bg-yellow-50' 
                    : 'border-yellow-300 text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                <Star className={`h-4 w-4 ${result.is_favorite ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{result.is_favorite ? 'Favorited' : 'Favorite'}</span>
              </Button>


              <Badge className={`${getScoreBadgeColor(result.overall_fit || 0)} font-semibold text-xs sm:text-sm`}>
                {result.overall_fit}% Fit
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          
          {/* Left Column - Candidate Info & Actions */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            
            {/* Candidate Profile Card */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <Avatar className="w-16 h-16 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-semibold">
                      {result.first_name.charAt(0)}{result.last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl text-gray-900 truncate">
                      {result.first_name} {result.last_name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm sm:text-base break-words leading-relaxed">
                      {result.job?.title || 'Candidate'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-3 text-gray-600">
                  <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="text-sm break-all">{result.email}</span>
                </div>
                
                {result.phone && (
                  <div className="flex items-start space-x-3 text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{result.phone}</span>
                  </div>
                )}
                
                {result.job && (
                  <>
                    <div className="flex items-start space-x-3 text-gray-600">
                      <Briefcase className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="text-sm break-words leading-relaxed">{result.job.title}</span>
                    </div>
                    
                    <div className="flex items-start space-x-3 text-gray-600">
                      <Building2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="text-sm break-words leading-relaxed">{result.job.company} - {result.job.department}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Status Management Card */}
            {result.resume_pool_id && result.job_id && (
              <InlineCandidateStatusManager
                resumePoolId={result.resume_pool_id}
                jobId={result.job_id}
                candidateName={`${result.first_name} ${result.last_name}`}
                candidateEmail={result.email}
                jobTitle={result.job?.title}
                companyName={companyProfile?.company_name || result.job?.company}
                companyAddress={companyProfile?.address}
                companyPhone={companyProfile?.phone}
                logoUrl={companyProfile?.logo_url}
                companyId={companyProfile?.id}
              />
            )}

            {/* Actions Card */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                  {/* Resume Button */}
                  {result.resume_pool_id && (
                    <Button
                      variant="outline"
                      onClick={handleResumeDownload}
                      className="flex items-center justify-center gap-2 border-green-300 text-green-600 hover:bg-green-50 w-full h-10"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="truncate">View Resume</span>
                    </Button>
                  )}
                  
                  {/* Voice Interview Button */}
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={requestingInterview === result.id || result.voice_screening_requested}
                    className={`flex items-center justify-center gap-2 w-full h-10 ${
                      result.voice_screening_requested 
                        ? 'border-green-300 text-green-600 hover:bg-green-50' 
                        : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {requestingInterview === result.id ? (
                      <>
                        <Mic className="h-4 w-4 animate-spin" />
                        <span className="truncate">Sending...</span>
                      </>
                    ) : result.voice_screening_requested ? (
                      <>
                        <Mic className="h-4 w-4" />
                        <span className="truncate">Interview Sent</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        <span className="truncate">Invite</span>
                      </>
                    )}
                  </Button>

                  {/* Copy Interview Link Button */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = VoiceInterviewService.generateInterviewLink(result.id, result.application_id || '', true);
                      VoiceInterviewService.copyInterviewLink(result.id, result.application_id || '', true);
                      toast({
                        title: "Interview Link Copied",
                        description: "Direct interview link copied to clipboard (auto-start enabled)",
                      });
                    }}
                    className="flex items-center justify-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50 w-full h-10 sm:col-span-2 xl:col-span-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="truncate">Copy Interview Link</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Analysis Details */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            
            {/* AI Analysis Justification Card - Moved to top */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-700">
                  <Brain className="w-5 h-5" />
                  <span>AI Analysis Justification</span>
                </CardTitle>
                <CardDescription>
                  Detailed reasoning behind the overall fit score
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.justification ? (
                  <div className="space-y-2">
                    {parseContentToBullets(result.justification).map((bullet, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-gray-600 mr-2 mt-1 flex-shrink-0">•</span>
                        <span className="text-sm leading-relaxed text-gray-700">{bullet}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No AI analysis justification available</p>
                )}
              </CardContent>
            </Card>
            
            {/* Strengths Card */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <TrendingUp className="w-5 h-5" />
                  <span>Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.strengths ? (
                  <div className="space-y-2">
                    {parseContentToBullets(result.strengths).map((bullet, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-gray-600 mr-2 mt-1 flex-shrink-0">•</span>
                        <span className="text-sm leading-relaxed text-gray-700">{bullet}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No strengths analysis available</p>
                )}
              </CardContent>
            </Card>

            {/* Areas for Development Card */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Areas for Development</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.weaknesses ? (
                  <div className="space-y-2">
                    {parseContentToBullets(result.weaknesses).map((bullet, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-gray-600 mr-2 mt-1 flex-shrink-0">•</span>
                        <span className="text-sm leading-relaxed text-gray-700">{bullet}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No areas for development identified</p>
                )}
              </CardContent>
            </Card>

            {/* Risk & Reward Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Risk Factors */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Risk Factors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.risk_factor ? (
                    <div className="space-y-2">
                      {parseContentToBullets(result.risk_factor).map((bullet, index) => (
                        <div key={index} className="flex items-start">
                          <span className="text-gray-600 mr-2 mt-1 flex-shrink-0">•</span>
                          <span className="text-sm leading-relaxed text-gray-700">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No risk factors identified</p>
                  )}
                </CardContent>
              </Card>

              {/* Potential Rewards */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-700">
                    <Award className="w-5 h-5" />
                    <span>Potential Rewards</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.reward_factor ? (
                    <div className="space-y-2">
                      {parseContentToBullets(result.reward_factor).map((bullet, index) => (
                        <div key={index} className="flex items-start">
                          <span className="text-gray-600 mr-2 mt-1 flex-shrink-0">•</span>
                          <span className="text-sm leading-relaxed text-gray-700">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No potential rewards identified</p>
                  )}
                </CardContent>
              </Card>
            </div>


            {/* Voice Interview Section */}
            {(result.voice_screening_requested || result.interview_summary) && (
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-indigo-700">
                    <Mic className="w-5 h-5" />
                    <span>Voice Screening Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.voice_screening_requested && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-blue-800 mb-2">
                        <Mic className="w-4 h-4" />
                        <span className="font-medium">Voice Interview Requested</span>
                      </div>
                      <p className="text-blue-700 text-sm">
                        Voice screening interview has been requested. Candidate will receive an email with the interview link.
                      </p>
                    </div>
                  )}
                  
                  {result.interview_summary && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Interview Summary</h4>
                        {result.interview_completed_at && (
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            Completed {new Date(result.interview_completed_at).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2">
                          {parseContentToBullets(result.interview_summary).map((bullet, index) => (
                            <div key={index} className="flex items-start">
                              <span className="text-gray-600 mr-2 mt-1 flex-shrink-0">•</span>
                              <span className="text-sm leading-relaxed text-gray-700">{bullet}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Interview Scheduling Section */}
            {result.application_id && (
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Interview Scheduling</CardTitle>
                  <CardDescription>Coordinate interview times with participants</CardDescription>
                </CardHeader>
                <CardContent>
                  <InterviewAvailabilityMatrix applicationId={result.application_id} />
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send AI Voice Interview Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to send an email to the candidate with a link for an AI voice interview. 
              The candidate will receive an email invitation to complete the voice interview process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleRequestVoiceScreening(result)}>
              Send Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default ScreeningResultDetail;
