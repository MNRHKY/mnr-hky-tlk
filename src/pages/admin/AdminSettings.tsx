import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Settings, Users, Shield, Database } from 'lucide-react';

const AdminSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Forum settings state
  const [forumName, setForumName] = useState('Minor Hockey Talks');
  const [forumDescription, setForumDescription] = useState('A community forum for minor hockey discussions');
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [allowAnonymousPosts, setAllowAnonymousPosts] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);

  // User settings
  const [maxPostsPerDay, setMaxPostsPerDay] = useState('10');
  const [minAccountAge, setMinAccountAge] = useState('0');
  const [autoModeration, setAutoModeration] = useState(false);

  // Security settings
  const [enableCaptcha, setEnableCaptcha] = useState(false);
  const [enableRateLimit, setEnableRateLimit] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('24');

  const handleSaveGeneral = async () => {
    setIsLoading(true);
    // In a real app, these would be saved to a settings table
    toast({
      title: 'Settings Saved',
      description: 'General forum settings have been updated',
    });
    setIsLoading(false);
  };

  const handleSaveUsers = async () => {
    setIsLoading(true);
    toast({
      title: 'Settings Saved',
      description: 'User settings have been updated',
    });
    setIsLoading(false);
  };

  const handleSaveSecurity = async () => {
    setIsLoading(true);
    toast({
      title: 'Settings Saved',
      description: 'Security settings have been updated',
    });
    setIsLoading(false);
  };

  const handleBackupDatabase = async () => {
    setIsLoading(true);
    toast({
      title: 'Backup Started',
      description: 'Database backup has been initiated',
    });
    setIsLoading(false);
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    toast({
      title: 'Cache Cleared',
      description: 'Application cache has been cleared',
    });
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure forum settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">General Settings</h2>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="forum-name">Forum Name</Label>
                  <Input
                    id="forum-name"
                    value={forumName}
                    onChange={(e) => setForumName(e.target.value)}
                    placeholder="Enter forum name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="forum-description">Forum Description</Label>
                  <Textarea
                    id="forum-description"
                    value={forumDescription}
                    onChange={(e) => setForumDescription(e.target.value)}
                    placeholder="Enter forum description"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow User Registration</Label>
                    <div className="text-sm text-muted-foreground">
                      Allow new users to register accounts
                    </div>
                  </div>
                  <Switch
                    checked={allowRegistration}
                    onCheckedChange={setAllowRegistration}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Anonymous Posts</Label>
                    <div className="text-sm text-muted-foreground">
                      Allow users to post anonymously
                    </div>
                  </div>
                  <Switch
                    checked={allowAnonymousPosts}
                    onCheckedChange={setAllowAnonymousPosts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <div className="text-sm text-muted-foreground">
                      Require users to verify their email
                    </div>
                  </div>
                  <Switch
                    checked={requireEmailVerification}
                    onCheckedChange={setRequireEmailVerification}
                  />
                </div>
              </div>

              <Button onClick={handleSaveGeneral} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">User Settings</h2>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-posts">Maximum Posts Per Day</Label>
                  <Input
                    id="max-posts"
                    type="number"
                    value={maxPostsPerDay}
                    onChange={(e) => setMaxPostsPerDay(e.target.value)}
                    placeholder="10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-age">Minimum Account Age (hours)</Label>
                  <Input
                    id="min-age"
                    type="number"
                    value={minAccountAge}
                    onChange={(e) => setMinAccountAge(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Moderation</Label>
                    <div className="text-sm text-muted-foreground">
                      Automatically moderate suspicious content
                    </div>
                  </div>
                  <Switch
                    checked={autoModeration}
                    onCheckedChange={setAutoModeration}
                  />
                </div>
              </div>

              <Button onClick={handleSaveUsers} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save User Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable CAPTCHA</Label>
                    <div className="text-sm text-muted-foreground">
                      Require CAPTCHA for registration and posts
                    </div>
                  </div>
                  <Switch
                    checked={enableCaptcha}
                    onCheckedChange={setEnableCaptcha}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Rate Limiting</Label>
                    <div className="text-sm text-muted-foreground">
                      Limit request frequency per user
                    </div>
                  </div>
                  <Switch
                    checked={enableRateLimit}
                    onCheckedChange={setEnableRateLimit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    placeholder="24"
                  />
                </div>
              </div>

              <Button onClick={handleSaveSecurity} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">System Settings</h2>
              </div>

              <div className="grid gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Database Management</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Backup and maintain database integrity
                    </p>
                    <Button onClick={handleBackupDatabase} disabled={isLoading}>
                      <Database className="h-4 w-4 mr-2" />
                      Create Database Backup
                    </Button>
                  </div>

                  <div>
                    <h3 className="font-medium">Cache Management</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Clear application cache to improve performance
                    </p>
                    <Button onClick={handleClearCache} disabled={isLoading} variant="outline">
                      Clear Application Cache
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;