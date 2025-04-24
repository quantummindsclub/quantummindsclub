import { Badge } from './ui/badge';

const VerificationBadge = () => {
  return (
    <Badge variant="success" className="px-2 sm:px-3 py-1 text-xs sm:text-sm max-w-full text-center flex-wrap">
      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="inline-block">Verified</span>
    </Badge>
  );
};

export default VerificationBadge;