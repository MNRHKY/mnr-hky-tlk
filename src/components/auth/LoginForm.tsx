
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRateLimit } from '@/hooks/useRateLimit';
import { HCaptchaComponent, HCaptchaRef } from '@/components/ui/hcaptcha';
import { useHCaptchaSiteKey } from '@/hooks/useHCaptchaSiteKey';
import { useSetupHCaptcha } from '@/hooks/useSetupHCaptcha';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const { toast } = useToast();
  const captchaRef = useRef<HCaptchaRef>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const { checkRateLimit, recordAttempt } = useRateLimit('login', {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 5 * 60 * 1000 // Block for 5 minutes
  });
  const { siteKey, isTestKey } = useHCaptchaSiteKey();
  const setupHCaptcha = useSetupHCaptcha();

  // Auto-setup hCaptcha if still using test key
  React.useEffect(() => {
    if (isTestKey && !setupHCaptcha.isPending) {
      setupHCaptcha.mutate();
    }
  }, [isTestKey, setupHCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      const blockedUntil = rateLimitCheck.blockedUntil;
      const blockTimeRemaining = blockedUntil ? Math.ceil((blockedUntil - Date.now()) / 1000) : 0;
      
      toast({
        title: "Too many attempts",
        description: `Please wait ${blockTimeRemaining} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }

    // Validate CAPTCHA token
    if (!captchaToken) {
      toast({
        title: "CAPTCHA required",
        description: "Please complete the CAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }

    try {
      await signIn(formData.email, formData.password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate('/');
    } catch (error) {
      // Record failed attempt
      recordAttempt();
      
      // Reset CAPTCHA on failed attempt
      captchaRef.current?.resetCaptcha();
      setCaptchaToken('');
      
      toast({
        title: "Sign in failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const handleCaptchaError = () => {
    setCaptchaToken('');
    toast({
      title: "CAPTCHA error",
      description: "Please try the CAPTCHA again.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1"
                placeholder="Enter your password"
              />
            </div>

            {/* CAPTCHA */}
            <div>
              <HCaptchaComponent
                ref={captchaRef}
                siteKey={siteKey}
                onVerify={handleCaptchaVerify}
                onError={handleCaptchaError}
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !captchaToken}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
        </Card>
        <div className="text-center">
          <Link
            to="/"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            ← Back to Forum
          </Link>
        </div>
      </div>
    </div>
  );
};
