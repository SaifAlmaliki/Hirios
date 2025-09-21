import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  ExternalLink,
  FileText,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RAG_WEBHOOK_URL = import.meta.env.VITE_RAG_RETRIVE;

// Animated loading dots component
const LoadingDots = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    candidateName: string;
    resumeUrl: string;
    filename: string;
  }>;
  isLoading?: boolean;
}

interface ResumePoolChatProps {
  isOpen: boolean;
  onToggle: () => void;
  resumePoolData: any[];
}

const suggestedQuestions = [
  "Who has Python experience?",
  "Show me candidates with 5+ years experience",
  "Find resumes with management experience",
  "Who has worked at tech companies?",
  "Show me candidates with AI/ML background",
  "Find people with startup experience"
];

const ResumePoolChat: React.FC<ResumePoolChatProps> = ({ 
  isOpen, 
  onToggle, 
  resumePoolData 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'assistant',
        content: `Hello! I'm your AI assistant for the resume pool. I can help you find candidates based on their experience, skills, and background. You have ${resumePoolData.length} resumes in your pool. What would you like to know?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, resumePoolData.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsStreaming(true);

    if (!RAG_WEBHOOK_URL) {
      console.error('VITE_RAG_RETRIVE is not configured.');
      toast({
        title: "Configuration Error",
        description: "RAG webhook URL is not set. Please check your environment variables.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('📤 Sending RAG chat webhook for:', userMessage.content);
      
      const response = await fetch(RAG_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.content
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ RAG chat webhook delivered successfully');

      // Handle response - try both streaming and direct JSON
      let assistantContent = '';
      let sources: Array<{ candidateName: string; resumeUrl: string; filename: string }> = [];

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        sources: [],
        isLoading: true
      };

      setMessages(prev => [...prev, assistantMessage]);

      try {
        // First, try to get the response as JSON (for non-streaming responses)
        const responseText = await response.text();
        console.log('📥 Raw response from webhook:', responseText);

        try {
          // Try to parse as JSON array (n8n format)
          const jsonResponse = JSON.parse(responseText);
          console.log('📋 Parsed JSON response:', jsonResponse);

          if (Array.isArray(jsonResponse) && jsonResponse.length > 0) {
            // Handle n8n array format
            const firstItem = jsonResponse[0];
            if (firstItem.output) {
              assistantContent = firstItem.output;
            } else if (firstItem.content) {
              assistantContent = firstItem.content;
            } else if (typeof firstItem === 'string') {
              assistantContent = firstItem;
            }
          } else if (jsonResponse.output) {
            assistantContent = jsonResponse.output;
          } else if (jsonResponse.content) {
            assistantContent = jsonResponse.content;
          } else if (typeof jsonResponse === 'string') {
            assistantContent = jsonResponse;
          }

          // Extract sources if available
          if (jsonResponse.sources) {
            sources = jsonResponse.sources;
          }

        } catch (jsonError) {
          console.log('📝 Response is not JSON, treating as plain text');
          assistantContent = responseText;
        }

        // Update the assistant message with the content
        if (assistantContent.trim()) {
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: assistantContent, sources, isLoading: false }
              : msg
          ));
        } else {
          // If no content, show a fallback message
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: "I received your question but didn't get a proper response. Please try again.", sources, isLoading: false }
              : msg
          ));
        }

      } catch (error) {
        console.error('❌ Error processing response:', error);
        throw error;
      }

    } catch (error) {
      console.error('❌ RAG chat webhook failed:', error);
      
      toast({
        title: "Chat Error",
        description: "Sorry, I couldn't process your question. Please try again.",
        variant: "destructive",
      });

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error while processing your question. Please try again or rephrase your question.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 rounded-full shadow-lg h-10 sm:h-12 md:h-14 px-2 sm:px-3 md:px-6"
        size="lg"
      >
        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">AI Assistant</span>
        <span className="sm:hidden">AI</span>
        <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 ml-1 sm:ml-2" />
      </Button>

      {/* Chat Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="flex-1 bg-black/20 backdrop-blur-sm"
            onClick={onToggle}
          />
          
          {/* Sidebar */}
          <div className="w-full sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[700px] bg-white shadow-2xl flex flex-col h-full">
            {/* Header */}
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Resume Assistant</CardTitle>
                    <p className="text-sm text-gray-600">
                      {resumePoolData.length} resumes available
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-lg px-3 sm:px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'assistant' && (
                        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      {message.type === 'user' && (
                        <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        {message.isLoading ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">AI is thinking</span>
                            <LoadingDots />
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                        {isStreaming && message.type === 'assistant' && message.id === messages[messages.length - 1]?.id && !message.isLoading && (
                          <div className="flex items-center mt-2">
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs opacity-70">AI is thinking...</span>
                          </div>
                        )}
                        <p className="text-xs opacity-70 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <p className="text-xs font-medium mb-2">Sources:</p>
                        <div className="space-y-1">
                          {message.sources.map((source, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <FileText className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                                {source.candidateName}
                              </span>
                              <ExternalLink className="h-3 w-3 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <div className="p-3 sm:p-4 md:p-6 border-t bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">Try asking:</p>
                <div className="space-y-2">
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start text-xs h-auto py-2 px-3 disabled:opacity-50"
                      onClick={() => handleSuggestedQuestion(question)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-1">
                          <LoadingDots />
                        </div>
                      ) : (
                        question
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 sm:p-4 md:p-6 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your resumes..."
                  disabled={isLoading}
                  className="flex-1 text-sm sm:text-base"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-auto md:px-3"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-1">
                      <LoadingDots />
                    </div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResumePoolChat;
