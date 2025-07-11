import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VPNTrafficStats {
  total_vpn_visits_today: number;
  unique_vpn_ips_today: number;
  vpn_post_attempts_blocked: number;
  total_blocked_attempts: number;
  vpn_percentage: number;
}

export const useVPNTrafficStats = () => {
  return useQuery({
    queryKey: ['vpn-traffic-stats'],
    queryFn: async () => {
      // Get VPN visits today
      const { data: vpnVisits, error: vpnError } = await supabase
        .from('ip_visit_tracking')
        .select('ip_address, is_vpn')
        .eq('is_vpn', true)
        .gte('created_at', new Date().toISOString().split('T')[0] + 'T00:00:00.000Z');

      if (vpnError) throw vpnError;

      // Get total visits today for percentage calculation
      const { data: totalVisits, error: totalError } = await supabase
        .from('ip_visit_tracking')
        .select('id')
        .gte('created_at', new Date().toISOString().split('T')[0] + 'T00:00:00.000Z');

      if (totalError) throw totalError;

      // Get blocked attempts from anonymous_post_tracking
      const { data: blockedAttempts, error: blockedError } = await supabase
        .from('anonymous_post_tracking')
        .select('id, is_blocked')
        .eq('is_blocked', true)
        .gte('created_at', new Date().toISOString().split('T')[0] + 'T00:00:00.000Z');

      if (blockedError) throw blockedError;

      // Get VPN-specific blocked attempts by checking if IP is in geolocation cache as VPN
      const { data: vpnBlockedAttempts, error: vpnBlockedError } = await supabase
        .from('anonymous_post_tracking')
        .select(`
          id,
          ip_address,
          is_blocked,
          ip_geolocation_cache!inner(is_vpn)
        `)
        .eq('is_blocked', true)
        .eq('ip_geolocation_cache.is_vpn', true)
        .gte('created_at', new Date().toISOString().split('T')[0] + 'T00:00:00.000Z');

      if (vpnBlockedError) throw vpnBlockedError;

      const uniqueVPNIPs = new Set(vpnVisits?.map(v => v.ip_address) || []).size;
      const totalVPNVisits = vpnVisits?.length || 0;
      const totalVisitsCount = totalVisits?.length || 0;
      const vpnPercentage = totalVisitsCount > 0 ? (totalVPNVisits / totalVisitsCount) * 100 : 0;

      const stats: VPNTrafficStats = {
        total_vpn_visits_today: totalVPNVisits,
        unique_vpn_ips_today: uniqueVPNIPs,
        vpn_post_attempts_blocked: vpnBlockedAttempts?.length || 0,
        total_blocked_attempts: blockedAttempts?.length || 0,
        vpn_percentage: Math.round(vpnPercentage * 100) / 100
      };

      return stats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};