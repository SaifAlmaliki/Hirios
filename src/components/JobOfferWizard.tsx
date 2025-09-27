import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  DollarSign, 
  Gift, 
  Users, 
  FileText,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  useCreateJobOffer, 
  useSendJobOffer,
  useJobOffer 
} from '@/hooks/useJobOffers';
import { 
  OfferFormData, 
  CURRENCY_OPTIONS, 
  EXPIRY_PERIOD_OPTIONS,
  OFFER_STATUS_CONFIG 
} from '@/types/jobOffers';
import { generateAndUploadOfferPDF } from '@/services/pdfService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface JobOfferWizardProps {
  isOpen: boolean;
  onClose: () => void;
  resumePoolId: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  logoUrl?: string;
  companyId?: string;
}

const STEPS = [
  { id: 1, title: 'Salary & Compensation', icon: DollarSign },
  { id: 2, title: 'Benefits & Insurance', icon: Gift },
  { id: 3, title: 'Reporting & Contacts', icon: Users },
  { id: 4, title: 'Review & Send', icon: FileText },
];

export const JobOfferWizard: React.FC<JobOfferWizardProps> = ({
  isOpen,
  onClose,
  resumePoolId,
  jobId,
  candidateName,
  candidateEmail,
  jobTitle,
  companyName,
  companyAddress,
  companyPhone,
  logoUrl,
  companyId,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OfferFormData>({
    salary_amount: 0,
    salary_currency: 'USD',
    bonus_amount: undefined,
    bonus_description: '',
    benefits: '',
    reports_to: '',
    insurance_details: '',
    expiry_period_days: 14,
    email_cc_addresses: [],
  });
  const [ccEmailsInput, setCcEmailsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const createOfferMutation = useCreateJobOffer();
  const sendOfferMutation = useSendJobOffer();
  const { data: existingOffer } = useJobOffer(resumePoolId, jobId);

  const updateFormData = (updates: Partial<OfferFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCcEmailsChange = (value: string) => {
    setCcEmailsInput(value);
    const emails = value.split(',').map(email => email.trim()).filter(email => email);
    updateFormData({ email_cc_addresses: emails });
  };

  const handleSubmit = async () => {
    if (!formData.salary_amount || !formData.benefits || !formData.reports_to) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let offerId: string;

      if (existingOffer) {
        // Update existing offer
        offerId = existingOffer.id;
      } else {
        // Create new offer
        const newOffer = await createOfferMutation.mutateAsync({
          resume_pool_id: resumePoolId,
          job_id: jobId,
          salary_amount: formData.salary_amount,
          salary_currency: formData.salary_currency,
          bonus_amount: formData.bonus_amount,
          bonus_description: formData.bonus_description,
          benefits: formData.benefits,
          reports_to: formData.reports_to,
          insurance_details: formData.insurance_details,
          expiry_period_days: formData.expiry_period_days,
          email_cc_addresses: formData.email_cc_addresses,
          offer_status: 'draft',
        });
        offerId = newOffer.id;
      }

      // Generate PDF
      const pdfData = {
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        job_title: jobTitle,
        company_name: companyName,
        company_address: companyAddress,
        company_phone: companyPhone,
        salary_amount: formData.salary_amount,
        salary_currency: formData.salary_currency,
        bonus_amount: formData.bonus_amount,
        bonus_description: formData.bonus_description,
        benefits: formData.benefits,
        reports_to: formData.reports_to,
        insurance_details: formData.insurance_details,
        offer_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + formData.expiry_period_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        offer_id: offerId,
      };

      const { fileUrl } = await generateAndUploadOfferPDF(pdfData, companyId || 'default');

      // Send offer
      await sendOfferMutation.mutateAsync({
        offerId,
        pdfUrl: fileUrl,
      });

      toast({
        title: 'Offer Sent Successfully',
        description: `Job offer has been sent to ${candidateName}`,
      });

      onClose();
    } catch (error) {
      console.error('Error creating/sending offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to create or send job offer',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="salary_amount">Base Salary *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.salary_currency}
                  onValueChange={(value) => updateFormData({ salary_currency: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="salary_amount"
                  type="number"
                  placeholder="e.g., 75000"
                  value={formData.salary_amount || ''}
                  onChange={(e) => updateFormData({ salary_amount: Number(e.target.value) })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus_amount">Bonus Amount (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="bonus_amount"
                  type="number"
                  placeholder="e.g., 10000"
                  value={formData.bonus_amount || ''}
                  onChange={(e) => updateFormData({ bonus_amount: Number(e.target.value) || undefined })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus_description">Bonus Description (Optional)</Label>
              <Input
                id="bonus_description"
                placeholder="e.g., Performance bonus, Annual bonus"
                value={formData.bonus_description || ''}
                onChange={(e) => updateFormData({ bonus_description: e.target.value })}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits & Perks *</Label>
              <Textarea
                id="benefits"
                placeholder="e.g., Health insurance, 401(k) matching, Paid time off, Flexible work hours, Professional development budget"
                value={formData.benefits}
                onChange={(e) => updateFormData({ benefits: e.target.value })}
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance_details">Insurance Details (Optional)</Label>
              <Textarea
                id="insurance_details"
                placeholder="e.g., Comprehensive health, dental, and vision coverage. 80% company contribution."
                value={formData.insurance_details || ''}
                onChange={(e) => updateFormData({ insurance_details: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reports_to">Reports To *</Label>
              <Input
                id="reports_to"
                placeholder="e.g., John Smith, Engineering Manager"
                value={formData.reports_to}
                onChange={(e) => updateFormData({ reports_to: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_period">Offer Expiry Period</Label>
              <Select
                value={formData.expiry_period_days.toString()}
                onValueChange={(value) => updateFormData({ expiry_period_days: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cc_emails">Additional CC Emails (Optional)</Label>
              <Input
                id="cc_emails"
                placeholder="e.g., hr@company.com, manager@company.com"
                value={ccEmailsInput}
                onChange={(e) => handleCcEmailsChange(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Separate multiple emails with commas
              </p>
            </div>
          </div>
        );

      case 4:
        const expiryDate = new Date(Date.now() + formData.expiry_period_days * 24 * 60 * 60 * 1000);
        
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Offer Summary</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Candidate:</strong> {candidateName}</p>
                <p><strong>Email:</strong> {candidateEmail}</p>
                <p><strong>Position:</strong> {jobTitle}</p>
                <p><strong>Company:</strong> {companyName}</p>
                <p><strong>Salary:</strong> {formData.salary_currency} {formData.salary_amount?.toLocaleString()}</p>
                {formData.bonus_amount && (
                  <p><strong>Bonus:</strong> {formData.salary_currency} {formData.bonus_amount.toLocaleString()}</p>
                )}
                <p><strong>Reports to:</strong> {formData.reports_to}</p>
                <p><strong>Expires:</strong> {format(expiryDate, 'MMM dd, yyyy')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Benefits & Perks</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{formData.benefits}</p>
              </div>

              {formData.insurance_details && (
                <div>
                  <h4 className="font-semibold mb-2">Insurance Details</h4>
                  <p className="text-sm text-gray-700">{formData.insurance_details}</p>
                </div>
              )}

              {formData.email_cc_addresses && formData.email_cc_addresses.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">CC Recipients</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.email_cc_addresses.map((email, index) => (
                      <Badge key={index} variant="secondary">{email}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Important</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Please review all details carefully before sending. Once sent, the offer will be delivered to the candidate via email with a PDF attachment.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.salary_amount > 0;
      case 2:
        return formData.benefits.trim().length > 0;
      case 3:
        return formData.reports_to.trim().length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const canProceed = isStepValid();
  const isLastStep = currentStep === STEPS.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Job Offer
          </DialogTitle>
          <DialogDescription>
            Create and send a job offer to {candidateName} for the {jobTitle} position
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive 
                    ? 'border-blue-600 bg-blue-600 text-white' 
                    : isCompleted 
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 bg-white text-gray-500'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(STEPS[currentStep - 1].icon, { className: "h-5 w-5" })}
              {STEPS[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Offer
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobOfferWizard;
