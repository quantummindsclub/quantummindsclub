import { useState, useCallback, useMemo } from 'react';
import { useToast } from '../components/ui/use-toast';
import { apiGet, apiDelete, apiPut } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Loader2, 
  Trash2, 
  Check, 
  Mail, 
  RefreshCw, 
  Search,
  ChevronLeft,
  X
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AdminContactsPage = () => {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const searchQuery = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('search') || '';
  }, [location.search]);

  const { data: contacts = [], isLoading, refetch } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await apiGet('/api/contact');
      if (!response.ok) throw new Error('Failed to fetch contacts');
      return response.json();
    }
  });

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    
    const searchTerm = searchQuery.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm) ||
      contact.subject.toLowerCase().includes(searchTerm) ||
      contact.message.toLowerCase().includes(searchTerm)
    );
  }, [contacts, searchQuery]);

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/api/contact/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      setShowDeleteDialog(false);
      setSelectedContact(null);
      toast({
        title: "Contact Deleted",
        description: "The contact message has been deleted.",
      });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => apiPut(`/api/contact/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast({
        title: "Marked as Read",
        description: "The contact has been marked as read.",
      });
    }
  });

  const handleMarkAsRead = useCallback((id) => {
    markAsReadMutation.mutate(id);
  }, [markAsReadMutation]);

  const handleDelete = useCallback(() => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  }, [deleteId, deleteMutation]);

  const confirmDelete = useCallback((id) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  }, []);

  const viewContactDetails = useCallback((contact) => {
    setSelectedContact(contact);
    
    if (!contact.read) {
      handleMarkAsRead(contact.id);
    }
  }, [handleMarkAsRead]);

  const handleReply = useCallback((contact) => {
    navigate(`/admin/contacts/${contact.id}/reply`);
  }, [navigate]);

  const clearSearch = useCallback(() => {
    navigate('/admin/contacts', { replace: true });
  }, [navigate]);

  const getUnreadCount = () => {
    return contacts.filter(contact => !contact.read).length;
  };

  const handleRefresh = (e) => {
    e.preventDefault();
    e.stopPropagation();
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery || ''}
            onChange={(e) => {
              const value = e.target.value;
              const searchParams = new URLSearchParams(location.search);
              if (value) {
                searchParams.set('search', value);
              } else {
                searchParams.delete('search');
              }
              navigate({ search: searchParams.toString() });
            }}
            className="pl-8 w-full"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
              onClick={clearSearch}
            >
              <X className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card className={`flex flex-col ${selectedContact ? 'hidden' : 'flex'}`}>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription className="flex items-center gap-2">
              {filteredContacts.length} messages
              {searchQuery && ` matching "${searchQuery}"`}
              {getUnreadCount() > 0 && (
                <Badge variant="destructive">
                  {getUnreadCount()} unread
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground px-6">
                {contacts.length === 0 ? 
                  "No contact messages found." : 
                  searchQuery ? 
                    `No messages matching "${searchQuery}"` : 
                    "No messages found."
                }
              </div>
            ) : (
              <ScrollArea className="h-fit max-h-[600px]">
                <div className="divide-y">
                  {filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => viewContactDetails(contact)}
                      className={`w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors relative ${
                        selectedContact?.id === contact.id ? 'bg-accent' : !contact.read ? 'bg-secondary/30' : ''
                      }`}
                    >
                      {!contact.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium flex items-center gap-2">
                            {contact.name}
                            {!contact.read && <Badge>New</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(contact.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {contact.subject}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className={`max-h-[800px] flex flex-col ${selectedContact ? 'flex' : 'hidden'}`}>
          {selectedContact ? (
            <>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedContact(null)}
                    className="-ml-2"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <CardTitle>{selectedContact.subject}</CardTitle>
                </div>
                <div className="space-y-1">
                  <CardDescription>
                    From {selectedContact.name} ({selectedContact.email})
                  </CardDescription>
                  <div className="text-sm text-muted-foreground">
                    Received: {formatDate(selectedContact.created_at)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReply(selectedContact)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => confirmDelete(selectedContact.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="flex-1 p-6 overflow-auto">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground px-4">
              <Mail className="h-8 w-8 mb-4" />
              <p>Select a message to view its contents</p>
            </div>
          )}
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this contact message. This action cannot be undone.
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

export default AdminContactsPage;
