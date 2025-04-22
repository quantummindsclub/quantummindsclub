import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useToast } from '../components/ui/use-toast'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { formatDate } from '../lib/utils'
import { Edit } from 'lucide-react'
import { apiGet } from '../lib/api'
import Comments from '../components/Comments'
import BackButton from '../components/BackButton'

const PostPage = ({ type = 'blog' }) => {
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [prevPath, setPrevPath] = useState('/')
  const [prevLabel, setPrevLabel] = useState('Back to Home')
  const [activeTab, setActiveTab] = useState(null)
  const { slug } = useParams()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  useEffect(() => {
    if (location.state?.from === 'manage') {
      setPrevPath('/manage')
      setPrevLabel('Back to Manage')
      if (location.state?.activeTab) {
        setActiveTab(location.state.activeTab)
      }
    } else {
      setPrevPath('/')
      setPrevLabel('Back to Home')
    }
  }, [location])

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true)
        const response = await apiGet(`/api/pages/${slug}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            navigate('/not-found', { replace: true })
            return
          }
          throw new Error('Failed to fetch post data')
        }
        
        const data = await response.json()
        
        if ((type === 'blog' && data.is_blog !== 1) || 
            (type === 'page' && data.is_blog === 1)) {
          const correctPath = data.is_blog === 1 ? 
            `/post/${data.slug}` : `/${data.slug}`
          navigate(correctPath, { replace: true })
          return
        }
        
        setPost(data)
      } catch (error) {
        console.error('Error fetching post:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load content. Please try again.",
        })
        navigate('/not-found', { replace: true })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPost()
  }, [slug, navigate, toast, type])

  const processContent = (content) => {
    let processedContent = content;
    if (typeof content === 'string') {
      const currentDomain = window.location.hostname;
      
      processedContent = content.replace(
        /<a\s+(?:[^>]*?\s+)?href=(['"])(https?:\/\/.*?)\1([^>]*?)>/gi,
        (match, quote, url, rest) => {
          try {
            const linkDomain = new URL(url).hostname;
            if (linkDomain !== currentDomain) {
              return `<a href=${quote}${url}${quote} target="_blank" rel="noopener noreferrer" ${rest}>`;
            } else {
              return match;
            }
          } catch (e) {
            return match;
          }
        }
      );
    }
    
    return { __html: processedContent };
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  const showComments = post.is_blog === 1 && post.comments_disabled !== 1;

  return (
    <article className="max-w-3xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {type === 'blog' && (
            <BackButton 
              to={prevPath}
              state={activeTab ? { activeTab } : undefined}
              label={prevLabel}
            />
          )}
          
          {type !== 'blog' && !isAuthenticated && <div></div>}
          
          {isAuthenticated && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/edit/${post.slug}`)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
          {post.published_date && post.is_blog === 1 && (
            <time className="text-muted-foreground">
              {formatDate(post.published_date)}
            </time>
          )}
          {post.is_blog === 1 && post.featured === 1 && (
            <div className="mt-2">
              <span className="inline-flex items-center bg-secondary px-2 py-1 text-xs font-medium text-foreground w-fit">
                Featured
              </span>
            </div>
          )}
        </div>
        
        <div 
          className="prose dark:prose-invert max-w-none mt-6 blog-content overflow-x-hidden"
          dangerouslySetInnerHTML={processContent(post.content)}
        />
        
        {showComments ? (
          <Comments 
            postId={post.id} 
            postSlug={post.slug}
            commentsEnabled={true}
            className="post-comments" 
          />
        ) : post.is_blog === 1 && (
          <div className="mt-12 pt-6 border-t border-border">
            <p className="text-center text-muted-foreground py-4">
              Comments are disabled for this post.
            </p>
          </div>
        )}
      </div>
    </article>
  )
}

export default PostPage
