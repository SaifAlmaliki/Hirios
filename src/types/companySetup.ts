export interface CompanyData {
  company_name: string;
  company_description: string;
  company_website: string;
  company_size: string;
  industry: string;
  address: string;
  phone: string;
  logo_url: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;
  smtp_secure: boolean;
}

export const getDefaultCompanyData = (): CompanyData => ({
  company_name: '',
  company_description: '',
  company_website: '',
  company_size: '',
  industry: '',
  address: '',
  phone: '',
  logo_url: '',
  smtp_host: '',
  smtp_port: 587,
  smtp_user: '',
  smtp_password: '',
  smtp_from_email: '',
  smtp_from_name: '',
  smtp_secure: true,
});
