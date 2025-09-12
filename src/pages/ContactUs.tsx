import React from 'react';
import { Particles } from '@/components/ui/particles';
import { Brain, ArrowLeft, Mail, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 relative">
      <Particles
        className="absolute inset-0"
        quantity={1000}
        color="#3B82F6"
        size={0.4}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate(-1)}
                  className="hover:bg-gray-800 text-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-full">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-white text-lg">Hirios</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Contact <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Us</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get in touch with our team. We're here to help with any questions or support you need.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Get in Touch</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-600/20 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Email</h3>
                      <p className="text-gray-300">support@idraq.com</p>
                      <p className="text-sm text-gray-400">General inquiries and support</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-600/20 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Office</h3>
                      <p className="text-gray-300">Duisburg, 47057 Germany</p>
                      <p className="text-sm text-gray-400">Visit us by appointment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Hours */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-400" />
                    Support Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="text-blue-400">9:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="text-gray-500">Closed</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="text-gray-500">Closed</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-300">
                      <strong>Emergency Support:</strong> For critical issues, email us at 
                      <span className="text-blue-400"> support@idraq.com</span> and we'll respond within 2 hours.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Response Times */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Response Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span>General Inquiries</span>
                      <span className="text-green-400">Within 24 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Technical Support</span>
                      <span className="text-yellow-400">Within 12 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bug Reports</span>
                      <span className="text-orange-400">Within 6 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency Issues</span>
                      <span className="text-red-400">Within 2 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;
