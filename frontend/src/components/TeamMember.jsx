import { Github, Linkedin, Mail } from 'lucide-react';

const TeamMember = ({ member }) => {
  return (
    <div className="flex flex-col items-center text-center p-4 border border-card-border bg-card group">
      <div className="relative mb-4 w-36 h-36 md:w-40 md:h-40 overflow-hidden">
        <img 
          src={member.image} 
          alt={member.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1566753323558-f4e0952af115?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2021&q=80";
          }}
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-bold text-lg">{member.name}</h3>
        <p className="text-primary text-sm font-medium">{member.role}</p>
        
        <p className="text-muted-foreground text-sm line-clamp-3 max-w-xs mx-auto">
          {member.bio}
        </p>
        
        <div className="flex items-center justify-center space-x-4 pt-2">
          {member.github && (
            <a 
              href={`https://${member.github}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary"
              aria-label={`${member.name}'s GitHub`}
            >
              <Github size={18} />
            </a>
          )}
          
          {member.linkedin && (
            <a 
              href={`https://${member.linkedin}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary"
              aria-label={`${member.name}'s LinkedIn`}
            >
              <Linkedin size={18} />
            </a>
          )}
          
          {member.email && (
            <a 
              href={`mailto:${member.email}`}
              className="text-foreground hover:text-primary"
              aria-label={`Email ${member.name}`}
            >
              <Mail size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMember;
