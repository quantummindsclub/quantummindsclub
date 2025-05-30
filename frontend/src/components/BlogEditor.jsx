import { useState, useEffect, useRef } from 'react'
import TipTapEditor from './TipTapEditor'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Checkbox } from './ui/checkbox'
import { useNavigate } from 'react-router-dom'
import { useToast } from './ui/use-toast'
import { apiPost, apiPut } from '../lib/api'

const BlogEditor = ({ pageData = null, isNew = false }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [isBlog, setIsBlog] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [commentsDisabled, setCommentsDisabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const titleInputRef = useRef(null)

  useEffect(() => {
    if (pageData) {
      setTitle(pageData.title || '')
      if (pageData.content && typeof pageData.content === 'string') {
        setContent(pageData.content)
      } else {
        setContent('')
      }
      setExcerpt(pageData.excerpt || '')
      setIsBlog(pageData.is_blog === 1)
      setFeatured(pageData.featured === 1)
      
      setCommentsDisabled(pageData.comments_disabled === 1 || pageData.comments_disabled === true)
    }
    
    if (titleInputRef.current && isNew) {
      setTimeout(() => {
        titleInputRef.current.focus()
      }, 100)
    }
  }, [pageData, isNew])

  const handleContentChange = (value) => {
    if (value !== content) {
      setContent(value)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Title is required",
      })
      return
    }

    if (!content.trim() || content === '<p></p>') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Content is required",
      })
      return
    }

    setSaving(true)

    try {
      const pagePayload = {
        title,
        content,
        is_blog: isBlog,
        featured,
        excerpt: excerpt.trim() || null,
        comments_disabled: commentsDisabled === true
      }

      let response

      if (isNew) {
        response = await apiPost('/api/pages', pagePayload)
      } else {
        response = await apiPut(`/api/pages/${pageData.slug}`, pagePayload)
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save')
      }

      const savedData = await response.json()
      
      toast({
        title: isNew ? "Post Created" : "Post Updated",
        description: isNew ? "Your post has been created successfully." : "Your changes have been saved.",
      })
      
      navigate(isBlog ? '/manage' : `/post/${savedData.slug}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 mb-12">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          ref={titleInputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="text-lg"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <TipTapEditor
          key={`editor-${pageData?.id || 'new'}`}
          content={content}
          onChange={handleContentChange}
          placeholder="Write your content here..."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt (optional)</Label>
        <Input
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief description of the post (leave empty for auto-generation)"
        />
      </div>
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="is-blog"
              checked={isBlog}
              onCheckedChange={setIsBlog}
            />
            <Label htmlFor="is-blog">Blog Post</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="featured"
              checked={featured}
              onCheckedChange={setFeatured}
              disabled={!isBlog}
            />
            <Label 
              htmlFor="featured" 
              className={!isBlog ? 'text-muted-foreground' : ''}
            >
              Featured Post
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="comments-disabled"
              checked={commentsDisabled}
              onCheckedChange={(checked) => setCommentsDisabled(checked === true)}
              disabled={!isBlog}
            />
            <Label 
              htmlFor="comments-disabled" 
              className={!isBlog ? 'text-muted-foreground' : ''}
            >
              Comments Disabled
            </Label>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/manage')}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-background"></div>
                {isNew ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              isNew ? 'Create Post' : 'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BlogEditor
