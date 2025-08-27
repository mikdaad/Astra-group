'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralButtonProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
}

export default function ReferralButton({ variant = 'desktop', className = '' }: ReferralButtonProps) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  // Fetch user's referral code from the API
  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const response = await fetch('/api/referral/stats');
        if (response.ok) {
          const data = await response.json();
          setReferralCode(data.referralCode);
        } else {
          console.warn('Failed to fetch referral code');
        }
      } catch (error) {
        console.error('Error fetching referral code:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralCode();
  }, []);

  const generateReferralLink = () => {
    if (!referralCode) return '';
    return `https://astra-eta-five.vercel.app/signup?ref=${referralCode}`;
  };

  const handleShare = async () => {
    if (!referralCode) {
      toast.error('Referral code not available');
      return;
    }

    const referralLink = generateReferralLink();
    
    // Check if Web Share API is available (mainly on mobile)
    if (navigator.share && variant === 'mobile') {
      try {
        await navigator.share({
          title: 'Join Akshaya Patra',
          text: 'Join me on Akshaya Patra and get amazing benefits!',
          url: referralLink,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        // If sharing is cancelled or fails, fall back to copy
        handleCopy();
      }
    } else {
      // Desktop or fallback - copy to clipboard
      handleCopy();
    }
  };

  const handleCopy = async () => {
    if (!referralCode) {
      toast.error('Referral code not available');
      return;
    }

    setCopying(true);
    const referralLink = generateReferralLink();
    
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Referral link copied to clipboard!');
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  if (loading) {
    return (
      <Button
        variant="ghost"
        size={variant === 'mobile' ? 'sm' : 'default'}
        className={`${variant === 'mobile' 
          ? 'h-9 w-9 rounded-full bg-white/10' 
          : 'h-10 px-3 bg-white/20 rounded-full hover:bg-white/30'
        } ${className}`}
        disabled
      >
        <div className="w-4 h-4 animate-pulse bg-white/30 rounded"></div>
      </Button>
    );
  }

  if (!referralCode) {
    return null; // Don't show button if no referral code
  }

  return (
    <Button
      variant="ghost"
      size={variant === 'mobile' ? 'sm' : 'default'}
      className={`${variant === 'mobile' 
        ? 'h-9 w-9 rounded-full bg-white/10 hover:bg-white/20' 
        : 'h-10 px-3 bg-white/20 rounded-full hover:bg-white/30 text-white'
      } ${className}`}
      onClick={handleShare}
      title="Share referral link"
    >
      {copying ? (
        <CheckCircle className="w-4 h-4 text-green-400" />
      ) : (
        <Share2 className={`w-4 h-4 ${variant === 'mobile' ? 'text-white' : 'text-white'}`} />
      )}
      {variant === 'desktop' && !copying && (
        <span className="ml-2 text-sm font-medium">Refer</span>
      )}
    </Button>
  );
}