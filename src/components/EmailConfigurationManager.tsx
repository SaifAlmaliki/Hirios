import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ExternalLink,
  Settings
} from 'lucide-react';
import { 
  useEmailConfigurations, 
  useCreateEmailConfiguration, 
  useUpdateEmailConfiguration, 
  useDeleteEmailConfiguration,
  EmailConfiguration 
} from '@/hooks/useEmailConfigurations';
import { useToast } from '@/hooks/use-toast';

const EmailConfigurationManager: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<EmailConfiguration | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<EmailConfiguration | null>(null);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});

  const { data: configurations = [], isLoading } = useEmailConfigurations();
  const createMutation = useCreateEmailConfiguration();
  const updateMutation = useUpdateEmailConfiguration();
  const deleteMutation = useDeleteEmailConfiguration();
  const { toast } = useToast();

  const toggleSecretVisibility = (configId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }));
  };

  const handleCreateConfig = async (formData: FormData) => {
    try {
      await createMutation.mutateAsync({
        email_address: formData.get('email_address') as string,
        refresh_token: formData.get('refresh_token') as string || undefined,
        access_token: formData.get('access_token') as string || undefined,
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleUpdateConfig = async (formData: FormData) => {
    if (!editingConfig) return;

    try {
      await updateMutation.mutateAsync({
        id: editingConfig.id,
        email_address: formData.get('email_address') as string,
        refresh_token: formData.get('refresh_token') as string || undefined,
        access_token: formData.get('access_token') as string || undefined,
        is_active: formData.get('is_active') === 'on',
      });
      setEditingConfig(null);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleDeleteConfig = async () => {
    if (!deletingConfig) return;

    try {
      await deleteMutation.mutateAsync(deletingConfig.id);
      setDeletingConfig(null);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleToggleActive = async (config: EmailConfiguration) => {
    try {
      await updateMutation.mutateAsync({
        id: config.id,
        is_active: !config.is_active,
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const getGmailOAuthUrl = async () => {
    try {
      const response = await fetch('/api/supabase/functions/gmail-oauth?action=get-oauth-url');
      const data = await response.json();
      return data.oauthUrl;
    } catch (error) {
      console.error('Failed to get OAuth URL:', error);
      return '#';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading email configurations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Processing</h2>
          <p className="text-gray-600 mt-1">
            Configure email accounts to automatically process resume attachments
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Email Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Email Configuration</DialogTitle>
              <DialogDescription>
                Configure Gmail OAuth2 credentials for automatic resume processing
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateConfig} className="space-y-4">
              <div>
                <Label htmlFor="email_address">Email Address</Label>
                <Input
                  id="email_address"
                  name="email_address"
                  type="email"
                  placeholder="your-email@gmail.com"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  The Gmail account to monitor for resume attachments
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">✅ Gmail OAuth2 Configured</h4>
                <p className="text-sm text-green-800 mb-3">
                  Your Gmail OAuth2 credentials are already configured in Supabase environment variables. 
                  You only need to provide the OAuth2 tokens for your specific Gmail account.
                </p>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="refresh_token">Refresh Token</Label>
                    <Input
                      id="refresh_token"
                      name="refresh_token"
                      placeholder="OAuth2 Refresh Token (obtained from Google OAuth flow)"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get this by authorizing your Gmail account with Google OAuth2
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="access_token">Access Token (Optional)</Label>
                    <Input
                      id="access_token"
                      name="access_token"
                      placeholder="OAuth2 Access Token (optional, will be refreshed automatically)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional - the system will automatically refresh tokens as needed
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>To get your OAuth2 tokens:</strong>
                  </p>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                    <li>Create OAuth2 credentials for your project</li>
                    <li>Use the OAuth2 playground to get tokens for your Gmail account</li>
                    <li>Copy the refresh token and paste it above</li>
                  </ol>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Configuration'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Configurations List */}
      {configurations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Configurations</h3>
            <p className="text-gray-600 mb-4">
              Set up email processing to automatically capture resumes from your email inbox.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Email Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {configurations.map((config) => (
            <Card key={config.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {config.email_address}
                        </p>
                        <Badge variant={config.is_active ? 'default' : 'secondary'}>
                          {config.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Created {new Date(config.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(config)}
                      disabled={updateMutation.isPending}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingConfig(config)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingConfig(config)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Configuration Details */}
                <div className="mt-4 space-y-3 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-green-800 font-medium">✅ OAuth2 Credentials</p>
                    <p className="text-green-700 text-xs">
                      Client ID and Client Secret are securely managed by the system using environment variables
                    </p>
                  </div>
                  {config.refresh_token && (
                    <div>
                      <Label className="text-gray-500">Refresh Token</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={config.refresh_token}
                          readOnly
                          type={showSecrets[`${config.id}_refresh_token`] ? 'text' : 'password'}
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecretVisibility(`${config.id}_refresh_token`)}
                        >
                          {showSecrets[`${config.id}_refresh_token`] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingConfig} onOpenChange={() => setEditingConfig(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Email Configuration</DialogTitle>
            <DialogDescription>
              Update your email configuration settings
            </DialogDescription>
          </DialogHeader>
          {editingConfig && (
            <form action={handleUpdateConfig} className="space-y-4">
              <div>
                <Label htmlFor="edit_email_address">Email Address</Label>
                <Input
                  id="edit_email_address"
                  name="email_address"
                  type="email"
                  defaultValue={editingConfig.email_address}
                  required
                />
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Gmail OAuth2 credentials are managed by the system using environment variables
                </p>
              </div>
              <div>
                <Label htmlFor="edit_refresh_token">Refresh Token</Label>
                <Input
                  id="edit_refresh_token"
                  name="refresh_token"
                  defaultValue={editingConfig.refresh_token || ''}
                />
              </div>
              <div>
                <Label htmlFor="edit_access_token">Access Token</Label>
                <Input
                  id="edit_access_token"
                  name="access_token"
                  defaultValue={editingConfig.access_token || ''}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_active"
                  name="is_active"
                  defaultChecked={editingConfig.is_active}
                />
                <Label htmlFor="edit_is_active">Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingConfig(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Configuration'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingConfig} onOpenChange={() => setDeletingConfig(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the email configuration for "{deletingConfig?.email_address}"? 
              This will stop automatic resume processing from this email account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfig}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmailConfigurationManager;
