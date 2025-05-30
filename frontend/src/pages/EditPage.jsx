import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../components/ui/use-toast'
import BlogEditor from '../components/BlogEditor'
import { apiGet } from '../lib/api'
import BackButton from '../components/BackButton'

const EditPage = ({ isNew = false }) => {
  const [page, setPage] = useState(null)
  const [isLoading, setIsLoading] = useState(!isNew)
  const { slug } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (isNew) return
    
    const fetchPage = async () => {
      try {
        setIsLoading(true)
        const response = await apiGet(`/api/pages/${slug}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Page not found.",
            })
            navigate('/admin/pages')
            return
          }
          throw new Error('Failed to fetch page data')
        }
        
        const data = await response.json()
        
        if (!data.content) {
          data.content = '';
        }
        
        setPage(data)
      } catch (error) {
        console.error('Error fetching page:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load page data. Please try again.",
        })
        navigate('/admin/pages')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPage()
  }, [isNew, slug, navigate, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          {isNew ? 'Create New Post' : `Edit: ${page?.title || ''}`}
        </h1>
        <BackButton 
          to="/admin/pages" 
          label="Back to Admin" 
        />
      </div>
      <BlogEditor 
        key={page?.id || 'new-page'} 
        pageData={isNew ? null : page} 
        isNew={isNew} 
      />
    </div>
  )
}

export default EditPage
