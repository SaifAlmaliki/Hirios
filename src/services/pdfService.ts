import { renderToBuffer } from '@react-pdf/renderer';
import { OfferPDFData } from '@/types/jobOffers';
import React from 'react';

// Create a professional job offer PDF template
export const generateOfferPDF = async (data: OfferPDFData): Promise<Blob> => {
  const { OfferPDFDocument } = await import('@/components/OfferPDFDocument');
  const doc = React.createElement(OfferPDFDocument, { data });
  const buffer = await renderToBuffer(doc as any);
  return new Blob([new Uint8Array(buffer)], { type: 'application/pdf' });
};

// Upload PDF to Supabase Storage
export const uploadOfferPDF = async (
  blob: Blob, 
  fileName: string
): Promise<string> => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const fileExt = fileName.split('.').pop();
  const filePath = `job-offers/${fileName}`;

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, blob, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

// Generate and upload offer PDF
export const generateAndUploadOfferPDF = async (
  offerData: OfferPDFData
): Promise<{ filePath: string; fileUrl: string }> => {
  // Generate PDF blob
  const pdfBlob = await generateOfferPDF(offerData);
  
  // Create filename
  const fileName = `offer_${offerData.candidate_name.replace(/\s+/g, '_')}_${offerData.job_title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Upload to storage
  const fileUrl = await uploadOfferPDF(pdfBlob, fileName);
  
  return {
    filePath: `job-offers/${fileName}`,
    fileUrl,
  };
};