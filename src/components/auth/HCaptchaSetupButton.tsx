import { useSetupHCaptcha } from '@/hooks/useSetupHCaptcha';
import { useHCaptchaSiteKey } from '@/hooks/useHCaptchaSiteKey';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const HCaptchaSetupButton = () => {
  const { siteKey, isTestKey } = useHCaptchaSiteKey();
  const setupHCaptcha = useSetupHCaptcha();
  const { toast } = useToast();

  const handleSetup = () => {
    console.log('Current site key:', siteKey);
    console.log('Is test key:', isTestKey);
    
    if (!isTestKey) {
      toast({
        title: 'Already Configured',
        description: 'hCaptcha is already using your real site key.',
      });
      return;
    }

    setupHCaptcha.mutate();
  };

  if (!isTestKey) {
    return null; // Don't show button if already configured
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <p className="text-sm text-yellow-800 mb-2">
        hCaptcha is currently using test mode. Click to configure your real site key.
      </p>
      <Button 
        onClick={handleSetup}
        disabled={setupHCaptcha.isPending}
        size="sm"
      >
        {setupHCaptcha.isPending ? 'Configuring...' : 'Configure hCaptcha'}
      </Button>
    </div>
  );
};