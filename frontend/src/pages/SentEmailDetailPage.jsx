import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiDelete } from '../lib/api';
import { formatDate } from '../lib/utils';
import { useToast } from '../components/ui/use-toast';
import BackButton from '../components/BackButton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Trash2 } from 'lucide-react';

const SentEmailDetailPage = () => {
  const { emailId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        setLoading(true);
        const response = await apiGet(`/api/emails/sent/${emailId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch email details');
        }
        const data = await response.json();
        setEmail(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Could not load email details",
        });
        navigate('/admin/email'); 
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [emailId, navigate, toast]);

  const handleDelete = async () => {
    try {
      const response = await apiDelete(`/api/emails/${emailId}`);
      if (!response.ok) {
        throw new Error('Failed to delete email');
      }
      toast({
        title: "Email Deleted",
        description: "The email has been permanently deleted.",
      });
      navigate('/admin/email'); 
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not delete email",
      });
    }
    setShowDeleteDialog(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="space-y-4">
        <BackButton fallbackUrl="/admin/email" /> 
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Email not found</h2>
          <p className="text-muted-foreground">The email you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{email.subject}</h1>
          <p className="text-muted-foreground">Sent: {formatDate(email.sent_at)}</p>
        </div>
        <BackButton fallbackUrl="/admin/email" /> 
      </div>

      <Card>
        <CardHeader className="space-y-0 pb-2">
          <CardTitle className="text-xl">Email Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-b pb-4">
            <div className="space-y-1">
              <h3 className="font-medium text-sm text-muted-foreground">From</h3>
              <p className="break-words">{email.from}</p>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-sm text-muted-foreground">To</h3>
              <p className="break-words">{email.to}</p>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-sm text-muted-foreground">Date</h3>
              <p>{formatDate(email.sent_at)}</p>
            </div>
            {email.cc && (
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-muted-foreground">CC</h3>
                <p className="break-words">{email.cc}</p>
              </div>
            )}
            {email.bcc && (
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-muted-foreground">BCC</h3>
                <p className="break-words">{email.bcc}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Content</h3>
            <div 
              className="prose prose-sm max-w-none dark:prose-invert border p-4 rounded-md bg-background overflow-auto"
              dangerouslySetInnerHTML={{ __html: email.content }}
            />
          </div>
          
          <div className="flex justify-end pt-2 border-t">
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Email
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this email. This action cannot be undone.
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
  );
};

export default SentEmailDetailPage;