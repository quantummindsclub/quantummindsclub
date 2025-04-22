import { useRef, useCallback } from 'react'
import { useToast } from '../components/ui/use-toast'
import PostCard from '../components/PostCard'
import { apiGet } from '../lib/api'
import HeroSection from '../components/HeroSection'
import { useInfiniteQuery } from '@tanstack/react-query'

const AllPostsPage = () => {
  const { toast } = useToast()
  const observer = useRef()
  const postsPerPage = 9 

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiGet(`/api/pages?type=blog&page=${pageParam}&limit=${postsPerPage}&include_comment_count=true`)
      if (!response.ok) throw new Error('Failed to fetch blog posts')
      const posts = await response.json()
      return posts
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === postsPerPage ? allPages.length + 1 : undefined
    },
    staleTime: 5 * 60 * 1000, 
    cacheTime: 30 * 60 * 1000,
  })

  const lastPostElementRef = useCallback(node => {
    if (isFetchingNextPage) return
    
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage()
      }
    }, { threshold: 0.5 })
    
    if (node) observer.current.observe(node)
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load blog posts. Please try again.",
    })
    return null
  }

  const posts = data?.pages.flat() || []

  return (
    <div className="space-y-12">
      <HeroSection 
        title="Quantum Minds Blog"
        subtitle="Insights, Research, and Innovations from Our Community"
        buttons={[
          { label: "Back to Home", href: "/", variant: "default", icon: "home" },
          { label: "About Us", href: "/about", variant: "outline", icon: "info" },
          { label: "Get in Touch", href: "/contact", variant: "outline", icon: "mail" }
        ]}
        backgroundImage="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        overlayOpacity={0.75}
      />
      
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">All Articles</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of articles on technology, innovation, and industry insights.
          </p>
        </div>
        
        <div className="space-y-8">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post, index) => {
              if (posts.length === index + 1) {
                return <div key={post.id} ref={lastPostElementRef}><PostCard post={post} /></div>
              } else {
                return <PostCard key={post.id} post={post} />
              }
            })
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No blog posts found.</p>
            </div>
          )}
        </div>
        
        {isFetchingNextPage && (
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AllPostsPage
