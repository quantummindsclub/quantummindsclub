import { Turnstile } from '@marsidev/react-turnstile';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../components/theme-provider';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const CaptchaWidget = ({ onVerify }) => {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
    if (onVerify) {
      onVerify(token);
    }
  };

  return (
    <div className="w-full flex justify-center my-4">
      <div 
        ref={containerRef}
        className="captcha-container"
      >
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
