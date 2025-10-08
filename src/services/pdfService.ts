import { pdf } from '@react-pdf/renderer';
import { OfferPDFData } from '@/types/jobOffers';
import React from 'react';

// Create a professional job offer PDF template
export const generateOfferPDF = async (data: OfferPDFData): Promise<Blob> => {
  // Debug: Log the data to see what might be empty
  console.log('PDF Data:', data);
  
  // Clean the data to ensure no empty strings
  const cleanData = {
    ...data,
    candidate_name: data.candidate_name?.trim() || 'Candidate',
    candidate_email: data.candidate_email?.trim() || 'candidate@example.com',
    job_title: data.job_title?.trim() || 'Position',
    company_name: data.company_name?.trim() || 'Company',
    company_address: data.company_address?.trim() || '',
    company_phone: data.company_phone?.trim() || '',
    reports_to: data.reports_to?.trim() || 'To be determined',
    benefits: data.benefits?.trim() || 'Standard company benefits apply',
    insurance_details: data.insurance_details?.trim() || '',
    salary_currency: data.salary_currency || 'USD',
    salary_amount: data.salary_amount || 0,
    bonus_amount: data.bonus_amount || 0,
    bonus_description: data.bonus_description?.trim() || '',
    expiry_date: data.expiry_date || new Date().toISOString(),
  };
  
  console.log('Cleaned PDF Data:', cleanData);
  
  try {
    const { OfferPDFDocument } = await import('@/components/OfferPDFDocument');
    const doc = React.createElement(OfferPDFDocument, { data: cleanData });
    console.log('PDF Document created successfully');
    const blob = await pdf(doc as any).toBlob();
    console.log('PDF Blob generated successfully, size:', blob.size);
    return blob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Upload PDF to Supabase Storage
export const uploadOfferPDF = async (
  blob: Blob, 
  fileName: string,
  companyId: string
): Promise<string> => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  // Use the same bucket structure as resumes: {companyId}/offers/{fileName}
  const bucketName = 'company_uploads';
  const filePath = `${companyId}/offers/${fileName}`;

  console.log(`Uploading offer PDF to: ${bucketName}/${filePath}`);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, blob, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading PDF:', error);
    console.error('Upload details:', {
      bucketName,
      filePath,
      fileName,
      error: error.message,
      statusCode: error.statusCode
    });
    throw error;
  }

  // Get signed URL (valid for 1 hour) since company_uploads is a private bucket
  const { data: urlData, error: urlError } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (urlError) {
    console.error('Error creating signed URL:', urlError);
    throw urlError;
  }

  console.log('PDF uploaded successfully:', urlData.signedUrl);
  return urlData.signedUrl;
};

// Generate and upload offer PDF
export const generateAndUploadOfferPDF = async (
  offerData: OfferPDFData,
  companyId: string
): Promise<{ filePath: string; fileUrl: string; pdfBlob: Blob }> => {
  console.log('🎯 Starting offer PDF generation and upload process');
  console.log('👤 Candidate:', offerData.candidate_name);
  console.log('💼 Position:', offerData.job_title);
  console.log('🏢 Company ID:', companyId);
  
  // Generate PDF blob
  console.log('📄 Generating PDF document...');
  const pdfBlob = await generateOfferPDF(offerData);
  console.log('✅ PDF generated successfully, size:', pdfBlob.size, 'bytes');
  
  // Create filename
  const fileName = `offer_${offerData.candidate_name?.replace(/\s+/g, '_') || 'candidate'}_${offerData.job_title?.replace(/\s+/g, '_') || 'position'}_${new Date().toISOString().split('T')[0]}.pdf`;
  const filePath = `${companyId}/offers/${fileName}`;
  
  console.log('📁 File path:', filePath);
  
  try {
    // Upload to storage with proper company folder structure
    console.log('☁️ Uploading to Supabase storage...');
    const fileUrl = await uploadOfferPDF(pdfBlob, fileName, companyId);
    console.log('✅ Offer PDF uploaded successfully');
    console.log('🔗 File URL:', fileUrl);
    
    return {
      filePath,
      fileUrl,
      pdfBlob,
    };
  } catch (error) {
    console.warn('⚠️ Storage upload failed, using base64 fallback:', error);
    // Fallback to base64 if storage fails
    const fileUrl = `data:application/pdf;base64,${await blobToBase64(pdfBlob)}`;
    console.log('🔄 Using base64 fallback URL');
    
    return {
      filePath,
      fileUrl,
      pdfBlob,
    };
  }
};

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};