import { Turnstile } from '@marsidev/react-turnstile';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../components/theme-provider';
import { Check } from 'lucide-react';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const CaptchaWidget = ({ onVerify }) => {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new MutationObserver(() => {
      const iframe = containerRef.current?.querySelector('iframe');
      if (iframe) {
        observer.disconnect();
      }
    });
    
    observer.observe(containerRef.current, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  const handleVerify = (token) => {
    setVerified(true);
    if (onVerify) {
      onVerify(token);
    }
  };

  return (
    <div className="w-full flex justify-center my-4">
      <div 
        ref={containerRef}
        className={`captcha-container relative ${verified ? 'border border-green-500 rounded' : ''}`}
      >
        {verified && (
          <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 text-white p-1 rounded-full flex items-center justify-center h-6 w-6">
                <Check className="h-4 w-4" strokeWidth={3} />
              </div>
              <span className="text-sm font-medium">Verification Completed</span>
            </div>
          </div>
        )}
        {mounted && (
          <Turnstile
            siteKey={TURNSTILE_SITE_KEY}
            options={{
              size: 'normal',
              theme: theme === 'dark' ? 'dark' : 'light',
              appearance: 'always'
            }}
            onSuccess={handleVerify}
            className="turnstile-widget"
          />
        )}
      </div>
    </div>
  );
};

export default CaptchaWidget;
