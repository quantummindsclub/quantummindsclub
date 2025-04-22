import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/use-toast';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar, Plus, ArrowUpDown, Trash2, Edit, Eye, ExternalLink } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { eventsApi } from '../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate } from '../../lib/utils';

const ManageEventsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: eventsApi.fetchEvents
  });
  
  const deleteMutation = useMutation({
    mutationFn: (eventId) => eventsApi.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete event. Please try again.",
      });
    }
  });
  
  const toggleStatusMutation = useMutation({
    mutationFn: ({ eventId, status }) => 
      eventsApi.updateEvent(eventId, { accepting_submissions: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Status Updated",
        description: "Event status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update event status. Please try again.",
      });
    }
  });
  
  const handleCreateEvent = () => {
    navigate('/admin/events/new');
  };
  
  const handleEditEvent = (eventId) => {
    if (eventId) {
      navigate(`/admin/events/edit/${eventId}`);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not edit event: Invalid event ID",
      });
    }
  };
  
  const handleViewParticipants = (eventId) => {
    navigate(`/admin/events/${eventId}/participants`);
  };
  
  const confirmDelete = (eventId) => {
    setDeleteId(eventId);
    setShowDeleteDialog(true);
  };
  
  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };
  
  const toggleStatus = (eventId, currentStatus) => {
    toggleStatusMutation.mutate({ 
      eventId, 
      status: !currentStatus 
    });
  };
  
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.event_date) - new Date(a.event_date);
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button onClick={handleCreateEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>
      
      {sortedEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-center mb-2">No Events Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't created any events yet. Get started by creating your first event.
            </p>
            <Button onClick={handleCreateEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedEvents.map(event => (
            <Card key={event.id} className="flex flex-col">
              <CardHeader className="flex-none pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight pr-2">{event.name}</CardTitle>
                  <span className={`self-start shrink-0 inline-flex items-center rounded-none px-2.5 py-0.5 text-xs font-medium ${
                    event.accepting_submissions 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {event.accepting_submissions ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="flex items-center mt-2">
                  <Calendar className="h-4 w-4 mr-1.5 text-foreground shrink-0" />
                  <span className="text-sm">{formatDate(event.event_date)}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium">Participants:</span>
                  <span className="text-sm ml-2">{event.participant_count}</span>
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {event.description || 'No description provided.'}
                </div>
              </CardContent>
              <CardFooter className="flex-none pt-3 border-t">
                <div className="grid grid-cols-5 w-full gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    title="Edit"
                    onClick={() => handleEditEvent(event.id)}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant={event.accepting_submissions ? "default" : "secondary"} 
                    size="icon"
                    title={event.accepting_submissions ? 'Close' : 'Open'}
                    onClick={() => toggleStatus(event.id, event.accepting_submissions)}
                    className="w-full"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    title="View Participants"
                    onClick={() => handleViewParticipants(event.id)}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    title="View Registration Form"
                    onClick={() => window.open(`/events/${event.id}/register`, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="icon" 
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete Event"
                    onClick={() => confirmDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event and all associated participant data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageEventsPage;