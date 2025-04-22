import { RocketIcon, ShieldIcon, BrainIcon, LockIcon, LightbulbIcon, MicroscopeIcon } from 'lucide-react';

const TechCard = ({ title, headline, description, icon }) => {
  const getIcon = (iconName) => {
    const iconProps = { className: "h-10 w-10 text-primary mb-4" };
    
    switch (iconName.toLowerCase()) {
      case 'rocket':
        return <RocketIcon {...iconProps} />;
      case 'shield':
        return <ShieldIcon {...iconProps} />;
      case 'brain':
        return <BrainIcon {...iconProps} />;
      case 'lock':
        return <LockIcon {...iconProps} />;
      case 'lightbulb':
        return <LightbulbIcon {...iconProps} />;
      case 'microscope':
        return <MicroscopeIcon {...iconProps} />;
      default:
        return <RocketIcon {...iconProps} />;
    }
  };

  return (
    <div className="border border-card-border bg-card p-6 rounded-lg transition-all duration-300 hover:shadow-md flex flex-col items-start">
      {getIcon(icon)}
      
      <h3 className="text-xl font-bold mb-1">
        {title}
      </h3>
      
      <p className="text-primary text-sm font-medium mb-3">
        {headline}
      </p>
      
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default TechCard;
