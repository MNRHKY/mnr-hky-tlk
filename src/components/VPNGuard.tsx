import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVPNDetection } from '@/hooks/useVPNDetection';
import { Loader } from 'lucide-react';

interface VPNGuardProps {
  children: React.ReactNode;
}

export const VPNGuard = ({ children }: VPNGuardProps) => {
  const { isBlocked, isLoading } = useVPNDetection();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if VPN is detected and user is not already on the VPN blocked page
    if (isBlocked && location.pathname !== '/vpn-blocked') {
      navigate('/vpn-blocked', { replace: true });
    }
  }, [isBlocked, location.pathname, navigate]);

  // Show loading spinner while checking VPN status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking connection...</p>
        </div>
      </div>
    );
  }

  // If VPN is detected and user is trying to access any page other than VPN blocked page, 
  // don't render the children (the redirect will happen via useEffect)
  if (isBlocked && location.pathname !== '/vpn-blocked') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Render children normally if no VPN detected or if on VPN blocked page
  return <>{children}</>;
};