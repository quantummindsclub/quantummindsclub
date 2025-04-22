import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ui/use-toast';
import { apiGet, apiDelete } from '../lib/api';
import { Button } from '../components/ui/button';
import { formatDate } from '../lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Trash2, MessageSquare, RefreshCw } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AdminCommentsPage = () => {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { toast } = useToast();

  const { data: comments = [], isLoading, refetch } = useQuery({
    queryKey: ['comments', 'admin'],
    queryFn: async () => {
      const response = await apiGet('/api/comments/admin');
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId) => apiDelete(`/api/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast({
        title: "Comment Deleted",
        description: "The comment has been deleted.",
      });
    }
  });

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const handleRefresh = (e) => {
    e.preventDefault();
    e.stopPropagation();
    refetch();
  };

  const commentsByPost = comments.reduce((acc, comment) => {
    const postSlug = comment.post_slug || 'unknown';
    
    if (!acc[postSlug]) {
      acc[postSlug] = {
        postTitle: comment.post_title || 'Unknown Post',
        postSlug: comment.post_slug,
        comments: []
      };
    }
    
    acc[postSlug].comments.push(comment);
    return acc;
  }, {});

  const postsList = Object.values(commentsByPost).sort((a, b) => 
    b.comments.length - a.comments.length
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {selectedPost && (
          <BackButton 
            label="Back to Posts" 
            onClick={() => setSelectedPost(null)}
            className="mb-2"
          />
        )}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedPost ? `Comments for "${selectedPost.postTitle}"` : "Comments Manager"}
          </h1>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {comments.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground bg-card border border-card-border rounded-md p-6">
          <p>No comments found.</p>
        </div>
      ) : selectedPost ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {selectedPost.comments.length} comment{selectedPost.comments.length !== 1 ? 's' : ''}
            </span>
            <Link 
              to={`/post/${selectedPost.postSlug}`} 
              className="text-sm underline hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Post
            </Link>
          </div>
          
          <div className="border border-card-border rounded-md overflow-hidden">
            <div className="divide-y bg-card">
              {selectedPost.comments.map((comment) => (
                <div 
                  key={comment.id} 
                  className="p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-medium">{comment.author_name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <div className="text-foreground bg-background/50 p-3 rounded-md mt-2 sm:mt-4">
                        {comment.content}
                      </div>
                    </div>
                    <div className="sm:ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => confirmDelete(comment.id)}
                        className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-card-border rounded-md overflow-hidden">
          <div className="divide-y bg-card">
            {postsList.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No posts with comments found.</p>
              </div>
            ) : (
              postsList.map(post => (
                <div 
                  key={post.postSlug} 
                  className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-secondary/30 cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="space-y-1 mb-2 sm:mb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-medium">
                        {post.postTitle}
                      </h3>
                      <span className="inline-flex items-center bg-secondary px-2 py-0.5 text-xs font-medium text-foreground w-fit">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {post.comments.length}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Latest comment: {formatDate(post.comments[0].created_at)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPost(post);
                    }}
                    className="w-full sm:w-auto"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Comments
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this comment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCommentsPage;
