/**
 * Analytics module for GA4 and Meta Pixel integration.
 * Reads VITE_GA_ID and VITE_META_PIXEL_ID from environment variables.
 * If IDs are missing, all functions are silent no-ops (no console errors).
 * Safe for SSR and client-side rendering.
 */

// Declarations for global objects (to avoid TypeScript errors)
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

// Configuration
const GA_ID = import.meta.env.VITE_GA_ID;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

// Track whether initialization has occurred (prevent duplicate script injection)
let isInitialized = false;

/**
 * Initialize analytics by dynamically injecting GA4 and Meta Pixel scripts.
 * Called once at app startup from main.tsx.
 * Safe to call multiple times - will only initialize once.
 */
export function initAnalytics(): void {
  // Only run on client side
  if (typeof window === 'undefined' || isInitialized) {
    return;
  }

  isInitialized = true;

  // Initialize Google Analytics 4
  if (GA_ID) {
    initGoogleAnalytics();
  }

  // Initialize Meta Pixel
  if (META_PIXEL_ID) {
    initMetaPixel();
  }
}

/**
 * Initialize Google Analytics 4 by injecting gtag script dynamically.
 */
function initGoogleAnalytics(): void {
  try {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Create gtag function
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };

    // Set initial config
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);

    // Inject GA4 script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  } catch (error) {
    // Silently fail - don't break the app if analytics fails
    console.error('[Analytics] GA4 initialization failed:', error);
  }
}

/**
 * Initialize Meta Pixel by injecting fbq script dynamically.
 */
function initMetaPixel(): void {
  try {
    // Inject Meta Pixel script and initialize fbq
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${META_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  } catch (error) {
    // Silently fail - don't break the app if analytics fails
    console.error('[Analytics] Meta Pixel initialization failed:', error);
  }
}

/**
 * Track a custom event in GA4 and Meta Pixel.
 * @param eventName - Name of the event (e.g., 'calcular_nahual', 'lead_enviado')
 * @param params - Optional event parameters
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Send to GA4 if initialized
  if (GA_ID && typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params || {});
    } catch (error) {
      console.error('[Analytics] GA4 trackEvent failed:', error);
    }
  }

  // Send to Meta Pixel if initialized (custom event)
  if (META_PIXEL_ID && typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', eventName, params || {});
    } catch (error) {
      console.error('[Analytics] Meta Pixel trackEvent failed:', error);
    }
  }
}

/**
 * Track a page view event.
 * Useful for tracking page transitions in a SPA.
 * @param path - Optional page path (defaults to current window.location.pathname)
 */
export function trackPageview(path?: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const pagePath = path || window.location.pathname;

  // Send to GA4 if initialized
  if (GA_ID && typeof window.gtag === 'function') {
    try {
      window.gtag('config', GA_ID, {
        page_path: pagePath,
      });
    } catch (error) {
      console.error('[Analytics] GA4 trackPageview failed:', error);
    }
  }

  // Send to Meta Pixel if initialized
  if (META_PIXEL_ID && typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'PageView', { page_path: pagePath });
    } catch (error) {
      console.error('[Analytics] Meta Pixel trackPageview failed:', error);
    }
  }
}
