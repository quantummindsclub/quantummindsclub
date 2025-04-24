import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useToast } from '../components/ui/use-toast'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import { formatDate } from '../lib/utils'
import { PlusCircle, Edit, Trash2 } from 'lucide-react'
import { apiGet, apiDelete } from '../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ManagePages = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") || 
           localStorage.getItem("managePagesActiveTab") || 
           "blogs"
  })
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient();
  
  const { data: blogPosts = [], isLoading: blogsLoading } = useQuery({
    queryKey: ['posts', 'blog'],
    queryFn: async () => {
      const response = await apiGet('/api/pages?type=blog');
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      return response.json();
    }
  });

  const { data: pages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ['posts', 'page'],
    queryFn: async () => {
      const response = await apiGet('/api/pages?type=page');
      if (!response.ok) throw new Error('Failed to fetch pages');
      return response.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (pageId) => apiDelete(`/api/pages/${pageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "Page Deleted",
        description: "The page has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete page.",
      });
    }
  });

  const handleTabChange = (value) => {
    setActiveTab(value);
    localStorage.setItem("managePagesActiveTab", value);
    setSearchParams({ tab: value });
  }

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      setSearchParams({ tab: location.state.activeTab });
    } else {
      const tabFromUrl = searchParams.get("tab");
      if (tabFromUrl && (tabFromUrl === "blogs" || tabFromUrl === "pages")) {
        setActiveTab(tabFromUrl);
      }
    }
  }, [location.state, searchParams])

  const handleDelete = async () => {
    if (!pageToDelete) return
    
    try {
      await deleteMutation.mutateAsync(pageToDelete.slug);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Failed to delete the content.",
      })
    } finally {
      setPageToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const confirmDelete = (item) => {
    setPageToDelete(item)
    setDeleteDialogOpen(true)
  }

  if (blogsLoading || pagesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  const renderContentList = (contentItems, contentType) => {
    if (contentItems.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          <p>No {contentType} found.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/new')}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New {contentType === 'blog posts' ? 'Blog Post' : 'Page'}
          </Button>
        </div>
      );
    }

    return contentItems.map((item) => (
      <div key={item.id} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="font-medium">
              <Link 
                to={item.is_blog === 1 ? `/post/${item.slug}` : `/${item.slug}`} 
                state={{ from: 'manage', activeTab: activeTab }}
                className="hover:underline hover:text-primary"
              >
                {item.title}
              </Link>
            </h3>
            {item.is_blog === 1 && item.featured === 1 && (
              <span className="inline-flex items-center bg-secondary px-2 py-0.5 text-xs font-medium text-foreground w-fit">
                Featured
              </span>
            )}
          </div>
          {item.published_date && (
            <div className="text-sm text-muted-foreground">
              Published: {formatDate(item.published_date)}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/edit/${item.slug}`)}
            className="flex-1 sm:flex-none"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => confirmDelete(item)}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Content Manager</h1>
        <div className="flex justify-start sm:justify-end">
          <Button 
            onClick={() => navigate('/new')} 
            className="w-full sm:w-auto"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue="blogs" 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="blogs">
          <div className="divide-y bg-card rounded-sm border border-card-border">
            {renderContentList(blogPosts, 'blog posts')}
          </div>
        </TabsContent>
        
        <TabsContent value="pages">
          <div className="divide-y bg-card rounded-sm border border-card-border">
            {renderContentList(pages, 'pages')}
          </div>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{pageToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ManagePages
