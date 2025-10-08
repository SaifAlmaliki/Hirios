import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function OfferDownload() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'downloading' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  console.log('OfferDownload component rendered with ID:', id);

  useEffect(() => {
    console.log('OfferDownload component mounted with ID:', id);
    if (!id) {
      setError('Invalid offer ID');
      setStatus('error');
      return;
    }

    const downloadOffer = async () => {
      try {
        setStatus('downloading');

        // Fetch the offer data
        const { data: offer, error: offerError } = await supabase
          .from('job_offers')
          .select(`
            *,
            resume_pool:resume_pool_id (
              id,
              first_name,
              last_name,
              email
            ),
            job:job_id (
              id,
              title,
              company,
              department
            )
          `)
          .eq('id', id)
          .single();

        if (offerError || !offer) {
          throw new Error('Offer not found');
        }

        // Check if PDF URL exists
        if (!offer.pdf_file_url) {
          throw new Error('PDF not available');
        }

        // Handle base64 PDF URLs
        if (offer.pdf_file_url.startsWith('data:application/pdf;base64,')) {
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
          link.download = `Job_Offer_${offer.resume_pool.first_name}_${offer.resume_pool.last_name}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          // Redirect after download
          setTimeout(() => {
            navigate('/');
          }, 2000);
          return;
        }

        // Handle storage URLs - redirect to the signed URL
        window.location.href = offer.pdf_file_url;

      } catch (err) {
        console.error('Error downloading offer:', err);
        setError(err instanceof Error ? err.message : 'Failed to download offer');
        setStatus('error');
      }
    };

    downloadOffer();
  }, [id, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your offer download...</p>
        </div>
      </div>
    );
  }

  if (status === 'downloading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Downloading your offer letter...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Download Failed</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
