import { Turnstile } from '@marsidev/react-turnstile';
import { useEffect, useRef } from 'react';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const CaptchaWidget = ({ onVerify }) => {
  const containerRef = useRef(null);

  const handleVerify = (token) => {
    if (onVerify) {
      onVerify(token);
    }
  };

  return (
    <div className="w-full flex justify-center my-4">
      <div 
        ref={containerRef}
        className="captcha-container overflow-visible" 
        style={{ 
          minWidth: '300px',  
          maxWidth: '100%',
          margin: '0 auto'
        }}
      >
        <Turnstile
          siteKey={TURNSTILE_SITE_KEY}
          options={{
            size: 'normal',
            theme: 'light'
          }}
          onSuccess={handleVerify}
        />
      </div>
    </div>
  );
};

export default CaptchaWidget;
