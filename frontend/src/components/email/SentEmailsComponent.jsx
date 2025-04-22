import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ui/use-toast';
import { apiGet, apiDelete } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../ui/alert-dialog';
import { Search, Trash2, RefreshCw, Send, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const SentEmailsComponent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch sent emails
  const { data: emails = [], isLoading, refetch } = useQuery({
    queryKey: ['emails', 'sent'],
    queryFn: async () => {
      const response = await apiGet('/api/emails/sent');
      if (!response.ok) throw new Error('Failed to fetch sent emails');
      return response.json();
    },
    refetchOnWindowFocus: false
  });

  // Delete email mutation
  const deleteMutation = useMutation({
    mutationFn: (emailId) => apiDelete(`/api/emails/${emailId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast({
        title: "Email Deleted",
        description: "The email has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete email.",
      });
    }
  });

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter emails by search term
  const filteredEmails = emails.filter(email => 
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (email.content && email.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Navigate to email detail page
  const viewEmail = (email) => {
    navigate(`/admin/emails/${email.id}`);
  };

  // Confirm email deletion
  const confirmDelete = (emailId, e) => {
    if (e) {
      e.stopPropagation();
    }
    setDeleteId(emailId);
    setShowDeleteDialog(true);
  };

  // Handle email deletion
  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Sent Emails</h1>
        <Button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            refetch();
          }} 
          variant="outline" 
          size="sm"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sent emails..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-8 w-full"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
            onClick={() => setSearchTerm('')}
          >
            <X className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Sent Emails</CardTitle>
          <CardDescription>
            {filteredEmails.length} {filteredEmails.length === 1 ? 'email' : 'emails'}
            {searchTerm && ` matching "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No sent emails found</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="w-[140px]">Date</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmails.map((email) => (
                    <TableRow 
                      key={email.id}
                      className="cursor-pointer"
                      onClick={() => viewEmail(email)}
                    >
                      <TableCell className="font-medium">
                        {email.to}
                      </TableCell>
                      <TableCell>
                        {email.subject}
                      </TableCell>
                      <TableCell>{formatDate(email.sent_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => confirmDelete(email.id, e)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction 
              onClick={handleDelete}
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

export default SentEmailsComponent;