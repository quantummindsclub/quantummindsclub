import { Link } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { Calendar } from 'lucide-react';

const RecentPosts = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {posts.map(post => (
        <div 
          key={post.id} 
          className="group flex flex-col border border-card-border rounded-lg overflow-hidden transition-all hover:shadow-md"
        >
          {post.first_image ? (
            <div className="h-48 w-full overflow-hidden">
              <img 
                src={post.first_image} 
                alt={post.title} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.parentElement.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="h-48 w-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No image available</span>
            </div>
          )}

          <div className="flex-1 p-5 flex flex-col">
            <div className="flex items-center text-sm text-muted-foreground mb-3">
              <Calendar className="h-4 w-4 mr-1 text-foreground" />
              <span>{formatDate(post.created_at)}</span>
            </div>
            
            <h3 className="text-xl font-bold mb-3 line-clamp-2">
              <Link 
                to={`/post/${post.slug}`}
                className="hover:text-primary transition-colors"
              >
                {post.title}
              </Link>
            </h3>
            
            {post.excerpt && (
              <p className="text-muted-foreground line-clamp-3 mb-4">
                {post.excerpt}
              </p>
            )}
            
            <Link 
              to={`/post/${post.slug}`}
              className="text-primary hover:underline mt-auto text-sm font-medium"
            >
              Read Article →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentPosts;
