import { useState, useEffect } from 'react';
import { getUserIP, getIPGeolocation } from '@/utils/ipUtils';

export const useVPNDetection = () => {
  const [isVPN, setIsVPN] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkVPNStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user's IP address
        const ip = await getUserIP();
        
        if (!ip) {
          console.warn('Could not retrieve IP address for VPN check');
          setIsVPN(false); // Allow access if we can't determine IP
          return;
        }

        // Get geolocation data which includes VPN detection
        const geoData = await getIPGeolocation(ip);
        
        if (geoData && typeof geoData.is_vpn === 'boolean') {
          setIsVPN(geoData.is_vpn);
          
          if (geoData.is_vpn) {
            console.log('VPN detected for IP:', ip);
          }
        } else {
          console.warn('VPN status could not be determined from geolocation data');
          setIsVPN(false); // Allow access if we can't determine VPN status
        }
      } catch (err) {
        console.error('Error checking VPN status:', err);
        setError(err instanceof Error ? err.message : 'Failed to check VPN status');
        setIsVPN(false); // Allow access on error to prevent breaking the site
      } finally {
        setIsLoading(false);
      }
    };

    checkVPNStatus();
  }, []);

  return {
    isVPN,
    isLoading,
    error,
    isBlocked: isVPN === true
  };
};