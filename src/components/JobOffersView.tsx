import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  DollarSign,
  User,
  Building,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Gift
} from 'lucide-react';
import { useJobOffers, useUpdateOfferStatus, useOfferComments, useAddOfferComment } from '@/hooks/useJobOffers';
import { useCompanyJobs } from '@/hooks/useCompanyJobs';
import { OFFER_STATUS_CONFIG, OfferStatus } from '@/types/jobOffers';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface JobOffersViewProps {
  className?: string;
}

export const JobOffersView: React.FC<JobOffersViewProps> = ({ className }) => {
  const [filters, setFilters] = useState({
    jobId: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showOfferDetails, setShowOfferDetails] = useState(false);
  const [responseComment, setResponseComment] = useState('');

  const { toast } = useToast();
  const { data: offers = [], isLoading } = useJobOffers(filters);
  const { data: jobs = [] } = useCompanyJobs();
  const updateStatusMutation = useUpdateOfferStatus();
  const addCommentMutation = useAddOfferComment();

  const handleStatusUpdate = async (offerId: string, status: OfferStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        offerId,
        status,
        responseComment: responseComment || undefined,
      });

      // Add a comment about the status change if there's a response comment
      if (responseComment && selectedOffer) {
        await addCommentMutation.mutateAsync({
          resumePoolId: selectedOffer.resume_pool_id,
          jobId: selectedOffer.job_id,
          comment: responseComment,
          commentType: status === 'accepted' ? 'acceptance_note' : 
                      status === 'rejected' ? 'rejection_reason' : 'general',
        });
      }

      setShowOfferDetails(false);
      setResponseComment('');
    } catch (error) {
      console.error('Error updating offer status:', error);
    }
  };

  const getStatusIcon = (status: OfferStatus) => {
    switch (status) {
      case 'sent':
        return <Mail className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4" />;
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'withdrawn':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (filters.jobId && offer.job_id !== filters.jobId) return false;
    if (filters.status && offer.offer_status !== filters.status) return false;
    if (filters.dateFrom && new Date(offer.created_at) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(offer.created_at) > new Date(filters.dateTo)) return false;
    return true;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Offers</h1>
          <p className="text-gray-600">Track and manage all job offers sent to candidates</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredOffers.length} offers
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job-filter">Job Position</Label>
              <Select
                value={filters.jobId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, jobId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  {Object.entries(OFFER_STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-from">From Date</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to">To Date</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offers List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading offers...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
              <p className="text-gray-500">
                {Object.values(filters).some(f => f) 
                  ? 'No offers match your current filters.' 
                  : 'No job offers have been created yet.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOffers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {offer.resume_pool.first_name} {offer.resume_pool.last_name}
                      </h3>
                      <Badge 
                        variant={OFFER_STATUS_CONFIG[offer.offer_status as OfferStatus]?.variant || 'secondary'}
                        className={OFFER_STATUS_CONFIG[offer.offer_status as OfferStatus]?.className}
                      >
                        {getStatusIcon(offer.offer_status as OfferStatus)}
                        {OFFER_STATUS_CONFIG[offer.offer_status as OfferStatus]?.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>{offer.job.title} - {offer.job.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          {offer.salary_currency} {offer.salary_amount.toLocaleString()}
                          {offer.bonus_amount && ` + ${offer.salary_currency} ${offer.bonus_amount.toLocaleString()} bonus`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Sent: {offer.sent_at ? format(new Date(offer.sent_at), 'MMM dd, yyyy') : 'Not sent'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-500">
                      <p>Expires: {format(new Date(offer.expiry_date), 'MMM dd, yyyy')}</p>
                      {offer.response_comment && (
                        <p className="mt-1">Response: {offer.response_comment}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {offer.pdf_file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(offer.pdf_file_url, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOffer(offer);
                        setShowOfferDetails(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Offer Details Dialog */}
      <Dialog open={showOfferDetails} onOpenChange={setShowOfferDetails}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Offer Details</DialogTitle>
            <DialogDescription>
              View and manage job offer for {selectedOffer?.resume_pool.first_name} {selectedOffer?.resume_pool.last_name}
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-6">
              {/* Candidate Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Candidate Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{selectedOffer.resume_pool.first_name} {selectedOffer.resume_pool.last_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{selectedOffer.resume_pool.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>{selectedOffer.job.title} - {selectedOffer.job.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {format(new Date(selectedOffer.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Offer Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Offer Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge 
                        variant={OFFER_STATUS_CONFIG[selectedOffer.offer_status as OfferStatus]?.variant || 'secondary'}
                        className={OFFER_STATUS_CONFIG[selectedOffer.offer_status as OfferStatus]?.className}
                      >
                        {OFFER_STATUS_CONFIG[selectedOffer.offer_status as OfferStatus]?.label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Base Salary:</span>
                      <span>{selectedOffer.salary_currency} {selectedOffer.salary_amount.toLocaleString()}</span>
                    </div>
                    {selectedOffer.bonus_amount && (
                      <div className="flex justify-between">
                        <span className="font-medium">Bonus:</span>
                        <span>{selectedOffer.salary_currency} {selectedOffer.bonus_amount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Reports to:</span>
                      <span>{selectedOffer.reports_to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Expires:</span>
                      <span>{format(new Date(selectedOffer.expiry_date), 'MMM dd, yyyy')}</span>
                    </div>
                    {selectedOffer.sent_at && (
                      <div className="flex justify-between">
                        <span className="font-medium">Sent:</span>
                        <span>{format(new Date(selectedOffer.sent_at), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{selectedOffer.benefits}</p>
                  {selectedOffer.insurance_details && (
                    <div className="mt-3">
                      <h4 className="font-medium text-sm">Insurance Details:</h4>
                      <p className="text-sm text-gray-700 mt-1">{selectedOffer.insurance_details}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Management */}
              {selectedOffer.offer_status === 'sent' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Update Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="response-comment">Response Comment (Optional)</Label>
                        <Input
                          id="response-comment"
                          placeholder="Add a comment about the candidate's response..."
                          value={responseComment}
                          onChange={(e) => setResponseComment(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleStatusUpdate(selectedOffer.id, 'accepted')}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark as Accepted
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleStatusUpdate(selectedOffer.id, 'rejected')}
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Mark as Rejected
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleStatusUpdate(selectedOffer.id, 'withdrawn')}
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Withdraw Offer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobOffersView;
