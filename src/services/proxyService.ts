// Proxy service to handle CORS issues with n8n webhook
export const sendApplicationToWebhookViaProxy = async (data: any): Promise<boolean> => {
  try {
    console.log('📤 Sending webhook via proxy for:', data.full_name);
    
    // Use a CORS proxy service (you can replace this with your own proxy)
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const targetUrl = import.meta.env.VITE_WEBHOOK_URL;
    
    if (!targetUrl) {
      console.warn('⚠️ No webhook URL configured');
      return false;
    }

    const response = await fetch(`${proxyUrl}${targetUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // Required by cors-anywhere
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ Webhook delivered successfully via proxy');
    return true;
  } catch (error) {
    console.error('❌ Proxy webhook failed:', error);
    return false;
  }
};
