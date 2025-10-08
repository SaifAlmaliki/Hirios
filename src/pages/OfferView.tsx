import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  DollarSign, 
  User, 
  Building2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useJobOfferById } from '@/hooks/useJobOffers';
import { useDownloadOffer } from '@/hooks/useDownload';
import { format } from 'date-fns';

const OfferView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const { data: offer, isLoading: offerLoading, error } = useJobOfferById(id || '');
  const downloadOfferMutation = useDownloadOffer();

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 OfferView Debug:', {
      offerId: id,
      isLoading: offerLoading,
      hasOffer: !!offer,
      error: error?.message
    });
  }, [id, offerLoading, offer, error]);

  useEffect(() => {
    setIsLoading(offerLoading);
  }, [offerLoading]);

  const handleDownloadOffer = () => {
    if (!offer?.pdf_file_url) return;
    
    // Extract filename from the offer data
    const candidateName = `${offer.resume_pool?.first_name || 'Candidate'}_${offer.resume_pool?.last_name || 'Name'}`;
    const jobTitle = offer.job?.title?.replace(/\s+/g, '_') || 'Position';
    const filename = `Job_Offer_${candidateName}_${jobTitle}.pdf`;
    
    // Check if it's a base64 data URL (fallback from storage failure)
    if (offer.pdf_file_url.startsWith('data:application/pdf;base64,')) {
      // Handle base64 PDF download
      const base64Data = offer.pdf_file_url.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return;
    }
    
    // Extract storage path from the PDF URL
    // The URL format is: https://...supabase.co/storage/v1/object/public/company_uploads/{path}
    const urlParts = offer.pdf_file_url.split('/company_uploads/');
    const storagePath = urlParts.length > 1 ? urlParts[1] : '';
    
    if (storagePath) {
      downloadOfferMutation.mutate({
        storagePath,
        filename
      });
    } else {
      // Fallback: open the URL directly
      window.open(offer.pdf_file_url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offer details...</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Offer Not Found</h1>
          <p className="text-gray-600 mb-4">
            The job offer you're looking for could not be found or may have expired.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {error.message}
              </p>
              <p className="text-xs text-red-600 mt-2">
                <strong>Offer ID:</strong> {id}
              </p>
            </div>
          )}
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    if (offer.pdf_file_url) {
      window.open(offer.pdf_file_url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Offer</h1>
            <p className="text-gray-600">
              {offer.resume_pool?.first_name} {offer.resume_pool?.last_name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Offer Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company & Position */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Position Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{offer.job?.title}</h3>
                  <p className="text-gray-600">{offer.job?.company}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Reports to</p>
                    <p className="font-medium">{offer.reports_to}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{offer.job?.department}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compensation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Compensation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {offer.salary_currency} {offer.salary_amount?.toLocaleString()}
                  </div>
                  <p className="text-gray-600">Annual Base Salary</p>
                </div>
                
                {offer.bonus_amount && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {offer.salary_currency} {offer.bonus_amount.toLocaleString()}
                    </div>
                    <p className="text-gray-600">
                      {offer.bonus_description || 'Performance Bonus'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Benefits & Perks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line">{offer.benefits}</p>
                </div>
                
                {offer.insurance_details && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Insurance Coverage</h4>
                    <p className="whitespace-pre-line">{offer.insurance_details}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Offer Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={offer.offer_status === 'sent' ? 'default' : 'secondary'}>
                    {offer.offer_status}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Offer Date</p>
                  <p className="font-medium">
                    {format(new Date(offer.offer_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Expires</p>
                  <p className="font-medium">
                    {format(new Date(offer.expiry_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleDownloadOffer}
                  className="w-full"
                  disabled={!offer.pdf_file_url}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.print()}
                >
                  Print Offer
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Candidate</p>
                  <p className="font-medium">
                    {offer.resume_pool?.first_name} {offer.resume_pool?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{offer.resume_pool?.email}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferView;
