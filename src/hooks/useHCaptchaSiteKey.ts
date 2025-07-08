import { useForumSettings } from './useForumSettings';

export const useHCaptchaSiteKey = () => {
  const { getSetting, isLoading } = useForumSettings();
  
  // Get the hCaptcha site key from forum settings, fallback to test key
  const siteKey = getSetting('hcaptcha_site_key', '10000000-ffff-ffff-ffff-000000000001');
  
  console.log('useHCaptchaSiteKey - Retrieved site key:', siteKey);
  console.log('useHCaptchaSiteKey - Is test key:', siteKey === '10000000-ffff-ffff-ffff-000000000001');
  
  return {
    siteKey,
    isLoading,
    isTestKey: siteKey === '10000000-ffff-ffff-ffff-000000000001'
  };
};