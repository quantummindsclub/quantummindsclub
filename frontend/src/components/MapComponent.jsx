import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from './ui/skeleton';

const MapComponent = ({ className }) => {
  const [isClient, setIsClient] = useState(false);
  
  const { data: mapUrl, isLoading } = useQuery({
    queryKey: ['map-data'],
    queryFn: () => {
      return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3605.8413490580374!2d81.90861817558013!3d25.343104225775093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3985497f856b1d35%3A0xf727c4fc418f7b17!2sUnited%20College%20of%20Engineering%20and%20Research!5e0!3m2!1sen!2sin!4v1745068495570!5m2!1sen!2sin";
    },
    staleTime: Infinity, 
    cacheTime: 24 * 60 * 60 * 1000, 
    suspense: false,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || isLoading) {
    return (
      <div className={`w-full h-[450px] rounded-lg overflow-hidden bg-muted ${className}`}>
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className={`w-full h-[450px] rounded-lg overflow-hidden ${className}`}>
      <iframe 
        src={mapUrl}
        width="100%" 
        height="100%" 
        style={{ border: 0 }} 
        allowFullScreen=""
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        title="United College of Engineering and Research Location"
        aria-label="Map showing United College of Engineering and Research location"
      />
    </div>
  );
};

export default MapComponent;
