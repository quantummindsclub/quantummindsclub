import { Link } from 'react-router-dom';
import HeroIcon from './HeroIcon';

const HeroSection = ({ 
  title, 
  subtitle, 
  buttons = [],
  backgroundImage = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2072&q=80',
  overlayOpacity = 0.7
}) => {
  return (
    <div className="relative h-[500px] md:h-[600px] -mt-8 mb-16 full-width-hero">
      <div className="absolute top-0 left-0 right-0 w-[100vw] h-full" style={{ marginLeft: 'calc(-50vw + 50%)' }}>
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            backgroundAttachment: 'fixed',
            width: '100vw'
          }}
        />
        
        <div 
          className="absolute inset-0 w-full h-full bg-black" 
          style={{ opacity: overlayOpacity }}
        />
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 text-white z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white">
            {title}
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-white/80">
            {subtitle}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-10">
            {buttons.map((button, index) => {
              return button.external ? (
                <a 
                  key={index}
                  href={button.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={button.label}
                  title={button.label}
                  className="flex items-center justify-center h-14 w-14 rounded-full border-2 border-white text-white hover:bg-white/10 transition-colors"
                >
                  <HeroIcon name={button.icon || 'right'} size={28} />
                </a>
              ) : (
                <Link 
                  key={index}
                  to={button.href} 
                  aria-label={button.label}
                  title={button.label}
                  className="flex items-center justify-center h-14 w-14 rounded-full border-2 border-white text-white hover:bg-white/10 transition-colors"
                >
                  <HeroIcon name={button.icon || 'right'} size={28} />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
