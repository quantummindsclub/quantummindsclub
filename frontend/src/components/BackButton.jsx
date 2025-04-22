import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const BackButton = ({ 
  to, 
  fallbackUrl = '/admin/dashboard',
  label = 'Back', 
  state, 
  className = '' 
}) => {
  const targetPath = to || fallbackUrl;
  
  return (
    <Button
      variant="outline"
      size="sm"
      asChild
      className={`w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 sm:px-3 sm:py-2 font-medium rounded-md shadow-none ${className}`}
    >
      <Link to={targetPath} state={state} className="flex items-center w-full">
        <ChevronLeft className="h-4 w-4 mr-1 shrink-0" />
        <span className="truncate">{label}</span>
      </Link>
    </Button>
  );
};

export default BackButton;
