import { useState, useEffect } from 'react';
import { useToast } from './ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiPost, apiDelete } from '../lib/api';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { formatDate } from '../lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Trash2 } from 'lucide-react';

const Comments = ({ postId, postSlug, commentsEnabled = true }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentForm, setCommentForm] = useState({
    name: '',
    content: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const response = await apiGet(`/api/comments/post/${postId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load comments. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchComments();
    }
  }, [postId, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCommentForm({
      ...commentForm,
      [name]: value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!commentForm.name || commentForm.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    
    if (!commentForm.content || commentForm.content.trim().length < 3) {
      errors.content = "Comment must be at least 3 characters";
    }
    
    if (commentForm.content && commentForm.content.length > 2000) {
      errors.content = "Comment is too long (maximum 2000 characters)";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await apiPost(`/api/comments/post/${postSlug}`, {
        name: commentForm.name.trim(),
        content: commentForm.content.trim()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit comment');
      }
      
      const data = await response.json();
      
      setComments([data, ...comments]);
      toast({
        title: "Comment Added",
        description: "Your comment has been posted.",
      });
      
      setCommentForm({
        name: '',
        content: ''
      });
      
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to post comment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (id) => {
    try {
      const response = await apiDelete(`/api/comments/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      setComments(comments.filter(comment => comment.id !== id));
      
      toast({
        title: "Comment Deleted",
        description: "The comment has been deleted.",
      });
      
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete comment. Please try again.",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  return (
    <div className="mt-8 pt-6">
      <h2 className="text-xl font-bold mb-6">Comments</h2>
      
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 border border-input bg-secondary/10 p-6">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={commentForm.name}
            onChange={handleInputChange}
            placeholder="Your name"
            className={formErrors.name ? "border-destructive" : ""}
          />
          {formErrors.name && (
            <p className="text-destructive text-xs mt-1">{formErrors.name}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="content">Comment</Label>
          <Textarea
            id="content"
            name="content"
            value={commentForm.content}
            onChange={handleInputChange}
            placeholder="Leave your comment here..."
            className={`min-h-[100px] ${formErrors.content ? "border-destructive" : ""}`}
          />
          {formErrors.content && (
            <p className="text-destructive text-xs mt-1">{formErrors.content}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto mt-2">
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-background"></div>
              Submitting...
            </>
          ) : (
            'Post Comment'
          )}
        </Button>
      </form>

      <div>
        <div className="h-[1px] bg-border mb-6" />

        <h3 className="font-medium mb-6">{comments.length === 0 
          ? "No comments yet. Be the first to comment!" 
          : `${comments.length} Comment${comments.length > 1 ? 's' : ''}`}
        </h3>
        
        <div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {comments.map(comment => (
                <div key={comment.id} className="border-b border-border pb-8 last:border-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{comment.author_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                    
                    {isAuthenticated && (
                      <div className="flex gap-2 shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => confirmDelete(comment.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 text-foreground whitespace-pre-wrap break-words">
                    {comment.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
              onClick={() => deleteComment(deleteId)}
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

export default Comments;
