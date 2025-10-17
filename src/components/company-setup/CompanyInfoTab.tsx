import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Save } from 'lucide-react';
import { LogoUpload } from '@/components/LogoUpload';
import { CompanyData } from '@/types/companySetup';

interface CompanyInfoTabProps {
  companyData: CompanyData;
  isSaving: boolean;
  onInputChange: (field: string, value: string) => void;
  onLogoUploaded: (logoUrl: string) => void;
  onLogoRemoved: () => void;
  onSave: () => void;
}

export const CompanyInfoTab: React.FC<CompanyInfoTabProps> = ({
  companyData,
  isSaving,
  onInputChange,
  onLogoUploaded,
  onLogoRemoved,
  onSave,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            value={companyData.company_name}
            onChange={(e) => onInputChange('company_name', e.target.value)}
            placeholder="Enter company name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company_website">Website</Label>
          <Input
            id="company_website"
            value={companyData.company_website}
            onChange={(e) => onInputChange('company_website', e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Description */}
        <div className="space-y-2">
          <Label htmlFor="company_description">Company Description</Label>
          <Textarea
            id="company_description"
            value={companyData.company_description}
            onChange={(e) => onInputChange('company_description', e.target.value)}
            placeholder="Describe your company..."
            rows={8}
          />
        </div>

        {/* Company Logo */}
        <div className="space-y-2">
          <LogoUpload
            currentLogoUrl={companyData.logo_url}
            onLogoUploaded={onLogoUploaded}
            onLogoRemoved={onLogoRemoved}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_size">Company Size</Label>
          <Select value={companyData.company_size} onValueChange={(value) => onInputChange('company_size', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="500+">500+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select value={companyData.industry} onValueChange={(value) => onInputChange('industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={companyData.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            placeholder="Company address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={companyData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            placeholder="Company phone number"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t mt-6">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="px-8"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Company Information
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
