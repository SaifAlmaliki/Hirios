import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Phone, PhoneOff, AlertCircle, CheckCircle } from 'lucide-react';
import { VoiceInterviewService, VoiceInterviewData } from '@/services/voiceInterviewService';
import { useToast } from '@/hooks/use-toast';

const VoiceInterview = () => {
  const { screeningResultId, applicationId } = useParams<{ screeningResultId: string; applicationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [interviewData, setInterviewData] = useState<VoiceInterviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoStart, setAutoStart] = useState(false);
  const [voiceInterviewService] = useState(() => VoiceInterviewService.getInstance());

  useEffect(() => {
    const loadInterviewData = async () => {
      if (!screeningResultId) {
        setError('Invalid interview link');
        setIsLoading(false);
        return;
      }

      try {
        const data = await VoiceInterviewService.getInterviewData(screeningResultId, applicationId);
        if (data) {
          setInterviewData(data);
          
          // Check URL params for auto-start
          const urlParams = new URLSearchParams(window.location.search);
          const shouldAutoStart = urlParams.get('autostart') === 'true';
          setAutoStart(shouldAutoStart);
          
        } else {
          setError('Interview data not found or not available');
        }
      } catch (err) {
        console.error('Failed to load interview data:', err);
        setError('Failed to load interview information');
      } finally {
        setIsLoading(false);
      }
    };

    loadInterviewData();
  }, [screeningResultId, applicationId]);

  // Auto-start interview if requested
  useEffect(() => {
    if (autoStart && interviewData && !isConnected && !isConnecting && !error && !voiceInterviewService.isConversationActive()) {
      handleStartInterview();
    }
  }, [autoStart, interviewData, isConnected, isConnecting, error, voiceInterviewService]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Clean up any active conversation when leaving the page
      if (voiceInterviewService.isConversationActive()) {
        voiceInterviewService.endConversation();
      }
    };
  }, [voiceInterviewService]);

  const handleStartInterview = async () => {
    if (!interviewData) return;

    setIsConnecting(true);
    setError(null);

    try {
      const result = await voiceInterviewService.startConversation(interviewData);
      
      if (result.success) {
        setIsConnected(true);
        toast({
          title: "Interview Started",
          description: "You are now connected to the AI interviewer. Speak clearly and answer the questions.",
        });
      } else {
        throw new Error(result.error || 'Failed to start interview');
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
      setError(err instanceof Error ? err.message : 'Failed to start interview');
      toast({
        title: "Connection Failed",
        description: "Unable to start the voice interview. Please check your microphone permissions and try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEndInterview = async () => {
    try {
      // Set states to prevent auto-restart
      setIsConnected(false);
      setIsConnecting(false);
      setAutoStart(false);
      
      // End the conversation
      await voiceInterviewService.endConversation();
      
      toast({
        title: "Interview Completed",
        description: "Thank you for completing the voice interview. Your responses have been recorded.",
      });

      // Redirect immediately to prevent any reconnection attempts
      navigate('/', { replace: true });
      
    } catch (err) {
      console.error('Failed to end interview:', err);
      toast({
        title: "Error",
        description: "There was an issue ending the interview, but your responses have been recorded.",
        variant: "destructive",
      });
      
      // Still redirect even if there was an error
      navigate('/', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading interview...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !interviewData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Interview Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {error || 'This interview is no longer available.'}
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Voice Interview
          </CardTitle>
          <CardDescription>
            {interviewData.job_title} Position
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Candidate Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Interview Details</h3>
            <p className="text-sm text-blue-800">
              <strong>Candidate:</strong> {interviewData.full_name}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Position:</strong> {interviewData.job_title}
            </p>
          </div>

          {/* Interview Status */}
          <div className="text-center">
            {isConnected ? (
              <div className="space-y-4">
                <Badge variant="default" className="bg-green-100 text-green-800 px-4 py-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Interview in Progress
                </Badge>
                <p className="text-sm text-gray-600">
                  You are now speaking with an AI interviewer. Answer questions naturally and speak clearly.
                </p>
                <Button
                  onClick={handleEndInterview}
                  variant="destructive"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <PhoneOff className="h-5 w-5" />
                  End Interview
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Badge variant="outline" className="px-4 py-2">
                  <Mic className="h-4 w-4 mr-2" />
                  Ready to Start
                </Badge>
                <p className="text-sm text-gray-600 mb-4">
                  Click the button below to start your voice interview. Make sure you're in a quiet environment 
                  and have granted microphone permissions.
                </p>
                <Button
                  onClick={handleStartInterview}
                  disabled={isConnecting}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Phone className="h-5 w-5" />
                      Start Interview
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-2">Interview Instructions</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Ensure you're in a quiet environment</li>
              <li>• Speak clearly and at a normal pace</li>
              <li>• Answer questions honestly and completely</li>
              <li>• The interview will be recorded for evaluation</li>
              <li>• You can end the interview at any time</li>
            </ul>
          </div>

          {/* Debug Information (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-2">🔧 Debug Information</h3>
              <div className="text-xs text-yellow-800 space-y-1">
                <p><strong>Screening ID:</strong> {screeningResultId}</p>
                <p><strong>Auto-start:</strong> {autoStart ? 'Yes' : 'No'}</p>
                <p><strong>Current URL:</strong> {window.location.href}</p>
                <p><strong>Interview Data Loaded:</strong> {interviewData ? 'Yes' : 'No'}</p>
                {interviewData && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">View Interview Variables</summary>
                    <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto">
                      {JSON.stringify({
                        user_name: interviewData.full_name,
                        job_title: interviewData.job_title,
                        job_requirements: interviewData.job_requirements?.substring(0, 100) + '...',
                        job_description: interviewData.job_description?.substring(0, 100) + '...',
                        resume_length: interviewData.resume?.length || 0
                      }, null, 2)}
                    </pre>
                  </details>
                )}
                <p className="text-xs text-yellow-600 mt-2">
                  💡 Open browser console for detailed logs. Use <code>voiceInterviewService.logCurrentState()</code> for more info.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceInterview; 