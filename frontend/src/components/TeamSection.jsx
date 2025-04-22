import { Link } from 'react-router-dom';
import TeamMember from './TeamMember';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';
import { apiGet } from '../lib/api';
import { useQuery } from '@tanstack/react-query';

const TeamSection = ({ showLeadershipOnly = false, showViewAllButton = false, title = "Our Team", subtitle = null }) => {
  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ['team-members', showLeadershipOnly],
    queryFn: async () => {
      const url = showLeadershipOnly 
        ? '/api/team?leadership=true' 
        : '/api/team';
        
      const response = await apiGet(url);
      if (!response.ok) throw new Error('Failed to fetch team members');
      return response.json();
    },
    staleTime: 1000 * 60 * 30, 
    cacheTime: 1000 * 60 * 60, 
  });

  return (
    <section className="py-12">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p>{error.message}</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No team members found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map(member => (
              <TeamMember key={member.id} member={member} />
            ))}
          </div>
        )}
        
        {showViewAllButton && (
          <div className="mt-10 text-center">
            <Button asChild>
              <Link to="/about#team">View All Team Members</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;
