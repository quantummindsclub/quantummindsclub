import { Link } from 'react-router-dom'
import { formatDate } from '../lib/utils'
import { Calendar, MessageSquare } from 'lucide-react'

const PostCard = ({ post, featured = false, hideFeaturedBadge = false }) => {
  const contentPath = post.is_blog === 1 ? `/post/${post.slug}` : `/${post.slug}`;
  
  return (
    <div className="group flex flex-col sm:flex-row border-card-border bg-background shadow-sm min-h-[180px] sm:h-[180px]">
      {post.first_image && (
        <div className="w-full sm:w-[280px] h-[200px] sm:h-full shrink-0">
          <img 
            src={post.first_image} 
            alt={post.title} 
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.parentElement.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex flex-wrap gap-2 items-center mb-2">
            {post.featured === 1 && !hideFeaturedBadge && (
              <span className="inline-flex items-center bg-secondary px-2 py-0.5 text-xs font-medium text-foreground w-fit">
                Featured
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold truncate">
            <Link to={contentPath} state={{ from: 'home' }}>{post.title}</Link>
          </h3>
          {post.excerpt && (
            <p className="mt-2 text-muted-foreground text-sm line-clamp-2">
              {post.excerpt}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-4">
          <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-foreground" />
              <span>{formatDate(post.created_at)}</span>
            </div>
            
            {post.comment_count !== undefined && (
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          <Link 
            to={contentPath}
            state={{ from: 'home' }}
            className="text-sm font-medium text-primary"
          >
            Read more
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PostCard
