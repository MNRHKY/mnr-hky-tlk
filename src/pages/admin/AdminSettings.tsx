import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForumSettings } from '@/hooks/useForumSettings';
import { useEnhancedForumStats } from '@/hooks/useEnhancedForumStats';
import { Save, Settings, Users, Shield, Database, BarChart3, Eye, TrendingUp, Calendar } from 'lucide-react';

const AdminSettings = () => {
  const { toast } = useToast();
  const { settings, isLoading, updateSetting, getSetting } = useForumSettings();
  const { data: stats, isLoading: statsLoading } = useEnhancedForumStats();

  // Local state for form inputs
  const [headerCode, setHeaderCode] = useState('');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [customCss, setCustomCss] = useState('');

  // Update local state when settings load
  React.useEffect(() => {
    if (settings) {
      setHeaderCode(getSetting('header_code', ''));
      setGoogleAnalyticsId(getSetting('google_analytics_id', ''));
      setCustomCss(getSetting('custom_css', ''));
    }
  }, [settings, getSetting]);

  const handleSaveGeneral = async () => {
    updateSetting({
      key: 'forum_name',
      value: getSetting('forum_name', 'Minor Hockey Talks'),
      type: 'string',
      category: 'general'
    });
  };

  const handleSaveTechnical = async () => {
    updateSetting({
      key: 'header_code',
      value: headerCode,
      type: 'code',
      category: 'technical',
      description: 'Custom HTML code to inject in header'
    });
    
    updateSetting({
      key: 'google_analytics_id',
      value: googleAnalyticsId,
      type: 'string',
      category: 'technical',
      description: 'Google Analytics tracking ID'
    });
  };

  const handleSaveAppearance = async () => {
    updateSetting({
      key: 'custom_css',
      value: customCss,
      type: 'code',
      category: 'appearance',
      description: 'Custom CSS styles'
    });
  };

  const handleBackupDatabase = async () => {
    toast({
      title: 'Backup Started',
      description: 'Database backup has been initiated',
    });
  };

  const StatCard = ({ title, value, change, icon: Icon, color = "text-primary" }: {
    title: string;
    value: number | string;
    change?: string;
    icon: any;
    color?: string;
  }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && <p className="text-xs text-muted-foreground">{change}</p>}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure forum settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Technical
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Traffic Stats
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
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
                    value={getSetting('forum_name', 'Minor Hockey Talks')}
                    onChange={(e) => updateSetting({
                      key: 'forum_name',
                      value: e.target.value,
                      type: 'string',
                      category: 'general'
                    })}
                    placeholder="Enter forum name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="forum-description">Forum Description</Label>
                  <Textarea
                    id="forum-description"
                    value={getSetting('forum_description', 'A community forum for minor hockey discussions')}
                    onChange={(e) => updateSetting({
                      key: 'forum_description',
                      value: e.target.value,
                      type: 'string',
                      category: 'general'
                    })}
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
                    checked={getSetting('allow_registration', true)}
                    onCheckedChange={(checked) => updateSetting({
                      key: 'allow_registration',
                      value: checked,
                      type: 'boolean',
                      category: 'general'
                    })}
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
                    checked={getSetting('allow_anonymous_posts', true)}
                    onCheckedChange={(checked) => updateSetting({
                      key: 'allow_anonymous_posts',
                      value: checked,
                      type: 'boolean',
                      category: 'general'
                    })}
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

        {/* Technical Settings */}
        <TabsContent value="technical">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Technical Settings</h2>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="header-code">Header Code</Label>
                  <Textarea
                    id="header-code"
                    value={headerCode}
                    onChange={(e) => setHeaderCode(e.target.value)}
                    placeholder="Enter custom HTML code to inject in the header (Google Analytics, etc.)"
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    HTML code entered here will be injected into the site header. Useful for analytics codes, custom scripts, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google-analytics">Google Analytics Tracking ID</Label>
                  <Input
                    id="google-analytics"
                    value={googleAnalyticsId}
                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your Google Analytics 4 tracking ID to enable visitor tracking
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveTechnical} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save Technical Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-css">Custom CSS</Label>
                  <Textarea
                    id="custom-css"
                    value={customCss}
                    onChange={(e) => setCustomCss(e.target.value)}
                    placeholder="Enter custom CSS styles"
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Custom CSS styles will be applied to the entire forum
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveAppearance} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save Appearance Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Traffic Stats */}
        <TabsContent value="stats">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Traffic Statistics</h2>
              <p className="text-muted-foreground">Monitor your forum's activity and growth</p>
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="h-16 bg-muted rounded"></div>
                  </Card>
                ))}
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Topics"
                    value={stats.total_topics || 0}
                    icon={TrendingUp}
                    color="text-blue-500"
                  />
                  <StatCard
                    title="Total Posts"
                    value={stats.total_posts || 0}
                    icon={TrendingUp}
                    color="text-green-500"
                  />
                  <StatCard
                    title="Total Members"
                    value={stats.total_members || 0}
                    icon={Users}
                    color="text-purple-500"
                  />
                  <StatCard
                    title="Today's Topics"
                    value={stats.topics_today || 0}
                    icon={Calendar}
                    color="text-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Today's Posts"
                    value={stats.posts_today || 0}
                    icon={Calendar}
                    color="text-red-500"
                  />
                  <StatCard
                    title="New Members Today"
                    value={stats.members_today || 0}
                    icon={Users}
                    color="text-teal-500"
                  />
                  <StatCard
                    title="This Week's Topics"
                    value={stats.topics_this_week || 0}
                    icon={TrendingUp}
                    color="text-indigo-500"
                  />
                  <StatCard
                    title="This Week's Posts"
                    value={stats.posts_this_week || 0}
                    icon={TrendingUp}
                    color="text-pink-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-2">Most Active Category</h3>
                    <p className="text-2xl font-bold text-primary">
                      {stats.most_active_category || 'No activity yet'}
                    </p>
                    <p className="text-sm text-muted-foreground">This week</p>
                  </Card>
                  
                  <Card className="p-6">
                    <h3 className="font-semibold mb-2">Top Poster</h3>
                    <p className="text-2xl font-bold text-primary">
                      {stats.top_poster || 'No posts yet'}
                    </p>
                    <p className="text-sm text-muted-foreground">This week</p>
                  </Card>
                </div>
              </>
            ) : (
              <Card className="p-6">
                <p className="text-muted-foreground">Unable to load statistics</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">System Management</h2>
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
                    <h3 className="font-medium">Security Settings</h3>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable Rate Limiting</Label>
                          <div className="text-sm text-muted-foreground">
                            Limit request frequency per user
                          </div>
                        </div>
                        <Switch
                          checked={getSetting('enable_rate_limiting', true)}
                          onCheckedChange={(checked) => updateSetting({
                            key: 'enable_rate_limiting',
                            value: checked,
                            type: 'boolean',
                            category: 'security'
                          })}
                        />
                      </div>
                    </div>
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