import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CompanyData, getDefaultCompanyData } from '@/types/companySetup';

export const useCompanySetup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [hasProfile, setHasProfile] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLocalStorageData, setHasLocalStorageData] = useState(false);
  const [smtpSaved, setSmtpSaved] = useState(false);
  
  // Initialize company data with localStorage fallback
  const [companyData, setCompanyData] = useState<CompanyData>(() => {
    const savedData = localStorage.getItem('company-setup-draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setHasLocalStorageData(true);
        return parsed;
      } catch (error) {
        console.error('Failed to parse saved company data:', error);
      }
    }
    return getDefaultCompanyData();
  });

  // Check if company profile already exists
  useEffect(() => {
    if (!user) return;

    const checkProfile = async () => {
      const { data } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setHasProfile(true);
        // Only update companyData if we don't have localStorage data or unsaved changes
        if (!hasLocalStorageData && !hasUnsavedChanges) {
          setCompanyData({
            company_name: data.company_name || '',
            company_description: data.company_description || '',
            company_website: data.company_website || '',
            company_size: data.company_size || '',
            industry: data.industry || '',
            address: data.address || '',
            phone: data.phone || '',
            logo_url: data.logo_url || '',
            smtp_host: data.smtp_host || '',
            smtp_port: data.smtp_port || 587,
            smtp_user: data.smtp_user || '',
            smtp_password: data.smtp_password || '',
            smtp_from_email: data.smtp_from_email || '',
            smtp_from_name: data.smtp_from_name || '',
            smtp_secure: data.smtp_secure !== false,
          });
        }
      } else {
        // If no profile exists, create a basic one
        const { data: newProfile, error } = await supabase
          .from('company_profiles')
          .insert([{
            user_id: user.id,
            company_name: 'My Company',
            subscription_plan: 'trial'
          }])
          .select()
          .single();
        
        if (newProfile && !error) {
          setHasProfile(true);
          if (!hasLocalStorageData) {
            setCompanyData({
              company_name: newProfile.company_name || '',
              company_description: newProfile.company_description || '',
              company_website: newProfile.company_website || '',
              company_size: newProfile.company_size || '',
              industry: newProfile.industry || '',
              address: newProfile.address || '',
              phone: newProfile.phone || '',
              logo_url: newProfile.logo_url || '',
              smtp_host: '',
              smtp_port: 587,
              smtp_user: '',
              smtp_password: '',
              smtp_from_email: '',
              smtp_from_name: '',
              smtp_secure: true,
            });
          }
        }
      }
    };

    checkProfile();
  }, [user, hasLocalStorageData, hasUnsavedChanges]);

  // Check if SMTP is configured and saved
  useEffect(() => {
    if (companyData.smtp_host && companyData.smtp_user && companyData.smtp_password && companyData.smtp_from_email && !hasUnsavedChanges) {
      setSmtpSaved(true);
    } else if (hasUnsavedChanges) {
      setSmtpSaved(false);
    }
  }, [companyData.smtp_host, companyData.smtp_user, companyData.smtp_password, companyData.smtp_from_email, hasUnsavedChanges]);

  // Debounced localStorage save - only save after user stops typing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce localStorage writes (500ms after last change)
    if (hasUnsavedChanges) {
      saveTimeoutRef.current = setTimeout(() => {
        if (companyData && Object.keys(companyData).length > 0) {
          localStorage.setItem('company-setup-draft', JSON.stringify(companyData));
        }
      }, 500);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [companyData, hasUnsavedChanges]);

  // Warn user before navigating away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const handleLogoUploaded = useCallback((logoUrl: string) => {
    setCompanyData(prev => ({ ...prev, logo_url: logoUrl }));
    setHasUnsavedChanges(true);
  }, []);

  const handleLogoRemoved = useCallback(() => {
    setCompanyData(prev => ({ ...prev, logo_url: '' }));
    setHasUnsavedChanges(true);
  }, []);

  const saveCompanyInfo = useCallback(async () => {
    setIsSaving(true);
    try {
      const companyFields = {
        company_name: companyData.company_name,
        company_description: companyData.company_description,
        company_website: companyData.company_website,
        company_size: companyData.company_size,
        industry: companyData.industry,
        address: companyData.address,
        phone: companyData.phone,
        logo_url: companyData.logo_url,
      };

      const { data: existingProfile } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      let error;
      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('company_profiles')
          .update(companyFields)
          .eq('user_id', user!.id);
        error = updateError;
        setHasProfile(true);
      } else {
        const { error: insertError } = await supabase
          .from('company_profiles')
          .insert([{ ...companyFields, user_id: user!.id }]);
        error = insertError;
        if (!error) setHasProfile(true);
      }

      if (error) {
        toast({
          title: "Failed to save",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setHasUnsavedChanges(false);
        localStorage.removeItem('company-setup-draft');
        toast({
          title: "✅ Saved Successfully",
          description: "Company information has been saved.",
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save company information.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [companyData, user, toast]);

  const saveSMTPConfig = useCallback(async () => {
    setIsSaving(true);
    try {
      const smtpFields = {
        smtp_host: companyData.smtp_host,
        smtp_port: companyData.smtp_port,
        smtp_user: companyData.smtp_user,
        smtp_password: companyData.smtp_password,
        smtp_from_email: companyData.smtp_from_email,
        smtp_from_name: companyData.smtp_from_name,
        smtp_secure: companyData.smtp_secure,
      };

      const { data: existingProfile } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      let error;
      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('company_profiles')
          .update(smtpFields)
          .eq('user_id', user!.id);
        error = updateError;
        setHasProfile(true);
      } else {
        const { error: insertError } = await supabase
          .from('company_profiles')
          .insert([{ ...smtpFields, user_id: user!.id, company_name: 'My Company' }]);
        error = insertError;
        if (!error) setHasProfile(true);
      }

      if (error) {
        toast({
          title: "Failed to save",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setHasUnsavedChanges(false);
        setSmtpSaved(true);
        localStorage.removeItem('company-setup-draft');
        toast({
          title: "✅ Saved Successfully",
          description: "SMTP configuration has been saved. You can now test the connection.",
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save SMTP configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [companyData, user, toast]);

  return {
    companyData,
    isSaving,
    smtpSaved,
    handleInputChange,
    handleLogoUploaded,
    handleLogoRemoved,
    saveCompanyInfo,
    saveSMTPConfig,
  };
};
