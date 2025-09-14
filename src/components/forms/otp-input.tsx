'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function OTPInput({ length, onComplete, disabled = false, error = false }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Expose clear function globally for the verify page
  useEffect(() => {
    (window as any).clearOTP = () => {
      setOtp(new Array(length).fill(''));
      inputRefs.current[0]?.focus();
    };
    
    return () => {
      delete (window as any).clearOTP;
    };
  }, [length]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      const newOtp = [...otp];
      
      if (otp[index]) {
        // Clear current field
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous field and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pasteData.length === length) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      onComplete(pasteData);
      inputRefs.current[length - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-lg font-semibold rounded-lg border transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            error 
              ? "border-red-500 bg-red-500/10 text-red-400" 
              : disabled
              ? "border-gray-600 bg-gray-700 text-gray-400 cursor-not-allowed"
              : "border-gray-600 bg-gray-800 text-white hover:border-gray-500"
          )}
          autoComplete="off"
        />
      ))}
    </div>
  );
}