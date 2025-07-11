import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Users, MapPin, Eye, Clock, Shield, Wifi } from 'lucide-react';
import { useActiveVisitors, useGeographicSummary } from '@/hooks/useActiveVisitors';
import { formatDistanceToNow } from 'date-fns';

export const LiveVisitorMonitor: React.FC = () => {
  const { data: activeVisitors, isLoading: visitorsLoading, refetch } = useActiveVisitors();
  const { data: geoSummary, isLoading: geoLoading } = useGeographicSummary(24);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode === 'Unknown') return '🌍';
    return countryCode.toUpperCase().replace(/./g, char => 
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
  };

  const getPageDisplayName = (path: string) => {
    if (path === '/') return 'Home';
    if (path.startsWith('/c/')) return 'Category';
    if (path.startsWith('/t/')) return 'Topic';
    if (path.startsWith('/admin')) return 'Admin';
    return path.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header with live count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-semibold">Live Visitors</h2>
          </div>
          <Badge variant="secondary" className="text-sm">
            {activeVisitors?.length || 0} active now
          </Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={visitorsLoading}
        >
          <Eye className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Geographic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Countries (24h)</p>
              <p className="text-2xl font-bold">
                {geoLoading ? '...' : geoSummary?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Visitors (24h)</p>
              <p className="text-2xl font-bold">
                {geoLoading ? '...' : geoSummary?.reduce((sum, item) => sum + item.visitor_count, 0) || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Page Views (24h)</p>
              <p className="text-2xl font-bold">
                {geoLoading ? '...' : geoSummary?.reduce((sum, item) => sum + item.page_views, 0) || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Visitors List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Active Visitors Right Now
        </h3>
        
        {visitorsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : activeVisitors && activeVisitors.length > 0 ? (
          <div className="space-y-3">
            {activeVisitors.map((visitor, index) => (
              <div key={`${visitor.ip_address}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">
                    {getFlagEmoji(visitor.country_code)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {visitor.city}, {visitor.country_name}
                      </span>
                      {visitor.is_vpn && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          VPN
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {visitor.ip_address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {getPageDisplayName(visitor.current_page)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {visitor.total_pages} pages
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" />
                    Last active: {formatDistanceToNow(new Date(visitor.last_activity))} ago
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Session: {formatDistanceToNow(new Date(visitor.session_start))} ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active visitors detected</p>
            <p className="text-sm">Visitors are considered active if they've been on the site in the last 10 minutes</p>
          </div>
        )}
      </Card>

      {/* Geographic Distribution */}
      {geoSummary && geoSummary.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Geographic Distribution (Last 24 Hours)</h3>
          <div className="space-y-2">
            {geoSummary.slice(0, 10).map((country, index) => (
              <div key={country.country_code} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getFlagEmoji(country.country_code)}</span>
                  <span className="font-medium">{country.country_name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {country.visitor_count} visitors
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {country.page_views} views
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};