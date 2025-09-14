'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { OTPInput } from '@/components/forms/otp-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatTime } from '@/lib/utils';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const { verifyOTP, resendOTP, isLoading } = useAuthStore();
  const [otpValue, setOtpValue] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isRateLimited: boolean;
    retryAfter: number;
    remainingAttempts?: number;
  }>({ isRateLimited: false, retryAfter: 0 });
  const [isVerifying, setIsVerifying] = useState(false);
  const lastRequestKeyRef = useRef<string | null>(null);

  // resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((v) => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  // rate limit countdown
  useEffect(() => {
    if (rateLimitInfo.isRateLimited && rateLimitInfo.retryAfter > 0) {
      const t = setTimeout(() => {
        setRateLimitInfo((prev) => ({
          ...prev,
          retryAfter: prev.retryAfter - 1
        }));
      }, 1000);
      return () => clearTimeout(t);
    } else if (rateLimitInfo.isRateLimited && rateLimitInfo.retryAfter <= 0) {
      setRateLimitInfo({ isRateLimited: false, retryAfter: 0 });
      setError('');
    }
  }, [rateLimitInfo]);

  const handleOTPComplete = useCallback(async (otp: string) => {
    if (isVerifying || rateLimitInfo.isRateLimited) return;

    const reqKey = `${email}-${otp}`;
    if (lastRequestKeyRef.current === reqKey) {
      return;
    }
    lastRequestKeyRef.current = reqKey;

    setOtpValue(otp);
    setError('');
    setSuccess('');
    setIsVerifying(true);

    try {
      const res = await verifyOTP({ email, otp, type: 'registration' });
      if (res?.verified || res?.message || res?.token) {
        setSuccess('Email verified successfully! Redirecting...');
        setTimeout(() => {
          router.push('/workspace');
        }, 1500);
      } else {
        setSuccess('Email verified.');
      }
    } catch (err: any) {
      const isTooMany =
        (typeof err.error === 'string' && err.error.includes('Too Many')) ||
        err.status === 429 ||
        err.type === 'RATE_LIMITED';

      if (isTooMany) {
        const retryAfter = err.retryAfter || 300;
        setRateLimitInfo({
          isRateLimited: true,
          retryAfter,
          remainingAttempts: err.remainingAttempts,
        });
        setError(
          `Too many verification attempts. Please wait ${Math.ceil(
            retryAfter / 60
          )} minute(s).`
        );
      } else if (
        typeof err.error === 'string' &&
        (err.error.toLowerCase().includes('invalid') ||
          err.error.toLowerCase().includes('expired'))
      ) {
        setError('Invalid or expired code. Try again.');
      } else {
        setError(err.userMessage || err.message || 'Verification failed.');
      }

      if ((window as any).clearOTP) {
        (window as any).clearOTP();
      }
      lastRequestKeyRef.current = null;
    } finally {
      setIsVerifying(false);
    }
  }, [email, isVerifying, rateLimitInfo.isRateLimited, verifyOTP, router]);

  const handleResend = async () => {
    if (resendCooldown > 0 || rateLimitInfo.isRateLimited || isLoading) return;
    setError('');
    setSuccess('');
    
    try {
      await resendOTP({ email, type: 'registration' });
      setSuccess('New verification code sent.');
      setResendCooldown(120); // 2 min
    } catch (err: any) {
      const isTooMany =
        (typeof err.error === 'string' && err.error.includes('Too Many')) ||
        err.status === 429 ||
        err.type === 'RATE_LIMITED';
        
      if (isTooMany) {
        const retryAfter = err.retryAfter || 300;
        setRateLimitInfo({
          isRateLimited: true,
          retryAfter,
          remainingAttempts: err.remainingAttempts,
        });
        setError(
          `Too many resend attempts. Wait ${Math.ceil(retryAfter / 60)} minute(s).`
        );
      } else {
        setError(err.userMessage || err.message || 'Failed to resend code.');
      }
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl text-white font-semibold mb-2">
              Missing Email
            </h2>
            <p className="text-gray-300 mb-4">
              No email provided for verification.
            </p>
            <Button onClick={() => router.push('/register')} className="bg-blue-600 hover:bg-blue-700">
              Back to Register
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <span className="rounded-full bg-blue-600 p-3">
              <Mail className="h-6 w-6 text-white" />
            </span>
          </div>
          <CardTitle className="text-white text-2xl font-bold">
            Verify Email
          </CardTitle>
          <CardDescription className="text-gray-300">
            Enter the 6-digit code sent to:
            <br />
            <span className="text-blue-400 font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {rateLimitInfo.isRateLimited && (
            <Alert variant="warning">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Please wait {formatTime(rateLimitInfo.retryAfter)} before trying again.
                {rateLimitInfo.remainingAttempts !== undefined && (
                  <div className="mt-1 text-xs">
                    Remaining attempts: {rateLimitInfo.remainingAttempts}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <OTPInput
            length={6}
            onComplete={handleOTPComplete}
            disabled={isLoading || isVerifying || rateLimitInfo.isRateLimited}
            error={!!error}
          />

          <div className="text-center space-y-3">
            <Button
              variant="outline"
              disabled={
                resendCooldown > 0 ||
                isLoading ||
                rateLimitInfo.isRateLimited ||
                isVerifying
              }
              onClick={handleResend}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
            >
              {rateLimitInfo.isRateLimited ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Rate Limited
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Resend in {formatTime(resendCooldown)}
                </>
              ) : (
                'Resend Code'
              )}
            </Button>
            <div>
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
                className="text-gray-400 hover:text-white"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}