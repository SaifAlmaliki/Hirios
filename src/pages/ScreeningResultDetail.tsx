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
  Download
} from 'lucide-react';
import { useScreeningResults, ScreeningResult } from '@/hooks/useScreeningResults';
import { useAuth } from '@/contexts/AuthContext';
import { VoiceInterviewService } from '@/services/voiceInterviewService';
import { useToast } from '@/hooks/use-toast';
import ScreeningResultActions from '@/components/ScreeningResultActions';

const ScreeningResultDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [requestingInterview, setRequestingInterview] = useState<string | null>(null);
  
  const { data: screeningResults, isLoading, error } = useScreeningResults();
  
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
          <Button onClick={() => navigate('/screening-results')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Screening Results
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/screening-results')}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Results
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold text-gray-900">
                {result.first_name} {result.last_name}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className={`${getScoreBadgeColor(result.overall_fit || 0)} font-semibold`}>
                {result.overall_fit}% Fit
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Candidate Info & Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Candidate Profile Card */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-semibold">
                      {result.first_name.charAt(0)}{result.last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl text-gray-900">
                      {result.first_name} {result.last_name}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {result.job?.title || 'Candidate'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{result.email}</span>
                </div>
                
                {result.phone && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{result.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Applied {new Date(result.created_at).toLocaleDateString()}</span>
                </div>
                
                {result.job && (
                  <>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">{result.job.title}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">{result.job.company} - {result.job.department}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Overall Score Card */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span>Overall Fit Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`text-4xl font-bold ${getScoreColor(result.overall_fit || 0)}`}>
                    {result.overall_fit}%
                  </div>
                  <Progress 
                    value={result.overall_fit || 0} 
                    className="h-3"
                  />
                  <Badge className={`${getScoreBadgeColor(result.overall_fit || 0)} text-sm px-3 py-1`}>
                    {result.overall_fit && result.overall_fit >= 80 ? 'Excellent' : 
                     result.overall_fit && result.overall_fit >= 60 ? 'Good' : 'Needs Review'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-3">
                  {/* Resume Button */}
                  {result.resume_url && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(result.resume_url, '_blank')}
                      className="flex items-center justify-center gap-2 border-green-300 text-green-600 hover:bg-green-50 w-full h-10"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View Resume</span>
                    </Button>
                  )}
                  
                  {/* Voice Interview Button */}
                  <Button
                    variant="outline"
                    onClick={() => handleRequestVoiceScreening(result)}
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
                        <span>Sending Interview...</span>
                      </>
                    ) : result.voice_screening_requested ? (
                      <>
                        <Mic className="h-4 w-4" />
                        <span>Interview Sent</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        <span>Send Voice Interview</span>
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
                    className="flex items-center justify-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50 w-full h-10"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Copy Interview Link</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Strengths Card */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <TrendingUp className="w-5 h-5" />
                  <span>Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  {result.strengths ? (
                    <p>{result.strengths}</p>
                  ) : (
                    <p className="text-gray-500 italic">No strengths analysis available</p>
                  )}
                </div>
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
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  {result.weaknesses ? (
                    <p>{result.weaknesses}</p>
                  ) : (
                    <p className="text-gray-500 italic">No areas for development identified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Risk & Reward Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risk Factors */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Risk Factors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    {result.risk_factor ? (
                      <p>{result.risk_factor}</p>
                    ) : (
                      <p className="text-gray-500 italic">No risk factors identified</p>
                    )}
                  </div>
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
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    {result.reward_factor ? (
                      <p>{result.reward_factor}</p>
                    ) : (
                      <p className="text-gray-500 italic">No potential rewards identified</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Analysis Justification */}
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
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  {result.justification ? (
                    <p>{result.justification}</p>
                  ) : (
                    <p className="text-gray-500 italic">No AI analysis justification available</p>
                  )}
                </div>
              </CardContent>
            </Card>

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
                        <p className="text-gray-700 text-sm leading-relaxed">{result.interview_summary}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes Section */}
            {result.notes && (
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-700">
                    <FileText className="w-5 h-5" />
                    <span>Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{result.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreeningResultDetail;
