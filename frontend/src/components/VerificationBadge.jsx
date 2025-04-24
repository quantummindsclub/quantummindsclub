import React from 'react';
import { Check } from 'lucide-react';

const VerificationBadge = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="bg-green-600 text-white p-1 rounded-full flex items-center justify-center h-6 w-6">
        <Check className="h-4 w-4" strokeWidth={3} />
      </div>
      <span className="text-sm font-medium text-green-700 dark:text-green-500">Verified</span>
    </div>
  );
};

export default VerificationBadge;