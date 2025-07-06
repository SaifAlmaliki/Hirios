
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CompanySetup = () => {
  const [companyData, setCompanyData] = useState({
    company_name: '',
    company_description: '',
    company_website: '',
    company_size: '',
    industry: '',
    address: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || userType !== 'company') {
      navigate('/auth');
      return;
    }

    // Check if company profile already exists
    const checkProfile = async () => {
      const { data } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setHasProfile(true);
        setCompanyData(data);
      }
    };

    checkProfile();
  }, [user, userType, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (hasProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('company_profiles')
          .update(companyData)
          .eq('user_id', user!.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('company_profiles')
          .insert([{ ...companyData, user_id: user!.id }]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Company profile saved successfully!",
      });

      navigate('/subscription');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save company profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscription = () => {
    navigate('/subscription');
  };

  if (!user || userType !== 'company') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-600 p-3 rounded-full w-fit mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Company Setup
            </CardTitle>
            <CardDescription>
              Complete your company profile to start posting jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={companyData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company_website">Website</Label>
                  <Input
                    id="company_website"
                    value={companyData.company_website}
                    onChange={(e) => handleInputChange('company_website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_description">Company Description</Label>
                <Textarea
                  id="company_description"
                  value={companyData.company_description}
                  onChange={(e) => handleInputChange('company_description', e.target.value)}
                  placeholder="Describe your company..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_size">Company Size</Label>
                  <Select value={companyData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
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
                  <Select value={companyData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
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
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Company address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={companyData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Company phone number"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Saving...' : hasProfile ? 'Update Profile' : 'Save Profile'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSubscription}
                  className="flex-1"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySetup;
