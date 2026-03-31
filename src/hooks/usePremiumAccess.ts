import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PremiumAccessState {
  isPremium: boolean;
  isLoading: boolean;
  email: string | null;
}

export function usePremiumAccess(kinSlug: string, userEmail?: string) {
  const [state, setState] = useState<PremiumAccessState>({
    isPremium: false,
    isLoading: true,
    email: userEmail || null,
  });

  const checkAccess = useCallback(async (email: string) => {
    if (!email || !kinSlug) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reading_tokens')
        .select('is_premium, expires_at')
        .eq('email', email.toLowerCase())
        .eq('kin_slug', kinSlug)
        .maybeSingle();

      if (error) {
        console.error('Error checking premium access:', error);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const isPremium = data?.is_premium === true && 
        (!data?.expires_at || new Date(data.expires_at) > new Date());

      setState({
        isPremium,
        isLoading: false,
        email,
      });
    } catch (err) {
      console.error('Error checking premium access:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [kinSlug]);

  // Create or update access token after lead capture
  const createFreeAccess = useCallback(async (email: string) => {
    if (!email || !kinSlug) return;

    try {
      const { error } = await supabase
        .from('reading_tokens')
        .upsert({
          email: email.toLowerCase(),
          kin_slug: kinSlug,
          is_premium: false,
        }, {
          onConflict: 'email,kin_slug',
        });

      if (error) {
        console.error('Error creating free access:', error);
      }

      setState(prev => ({ ...prev, email }));
    } catch (err) {
      console.error('Error creating free access:', err);
    }
  }, [kinSlug]);

  // Generate payment link
  const getPaymentLink = useCallback(() => {
    const email = state.email || '';
    // Using a simple PayPal.me or similar link - can be replaced with Stripe checkout
    // For now, we'll use a placeholder that admins can configure
    const baseUrl = 'https://paypal.me/azulanaite/2';
    return `${baseUrl}?email=${encodeURIComponent(email)}&kin=${encodeURIComponent(kinSlug)}`;
  }, [state.email, kinSlug]);

  // Check access on mount if email is provided
  useEffect(() => {
    if (userEmail) {
      checkAccess(userEmail);
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [userEmail, checkAccess]);

  return {
    ...state,
    checkAccess,
    createFreeAccess,
    getPaymentLink,
  };
}
