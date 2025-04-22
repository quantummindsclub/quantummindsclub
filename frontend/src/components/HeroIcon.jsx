import { ArrowRight, Home, Search, Mail, Github, Book, MessageCircle, Eye } from 'lucide-react';

const HeroIcon = ({ name, size = 24 }) => {
  const iconProps = { size, strokeWidth: 2 };
  
  switch (name.toLowerCase()) {
    case 'right':
      return <ArrowRight {...iconProps} />;
    case 'home':
      return <Home {...iconProps} />;
    case 'search':
      return <Search {...iconProps} />;
    case 'mail':
      return <Mail {...iconProps} />;
    case 'github':
      return <Github {...iconProps} />;
    case 'blog':
      return <Book {...iconProps} />;
    case 'info':
      return <Eye {...iconProps} />;
    case 'contact':
      return <MessageCircle {...iconProps} />;
    default:
      return <ArrowRight {...iconProps} />;
  }
};

export default HeroIcon;
