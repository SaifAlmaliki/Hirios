
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateWebhookUrl } from '../services/webhookService';
import { supabase } from '@/integrations/supabase/client';

const WebhookSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWebhookUrl();
  }, []);

  const loadWebhookUrl = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'webhook_url')
        .maybeSingle();

      if (error) {
        console.error('Error loading webhook URL:', error);
        return;
      }

      setWebhookUrl(data?.value || 'https://n8n.cognitechx.com/webhook-test/application');
    } catch (error) {
      console.error('Error loading webhook URL:', error);
    }
  };

  const handleSave = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await updateWebhookUrl(webhookUrl.trim());
      
      if (success) {
        toast({
          title: "Success",
          description: "Webhook URL updated successfully",
        });
        setIsOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to update webhook URL",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update webhook URL",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Webhook Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Webhook Configuration</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">n8n Webhook URL</Label>
            <Input
              id="webhook-url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-n8n.com/webhook/application"
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              This URL will receive job application data when candidates apply
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WebhookSettings;
