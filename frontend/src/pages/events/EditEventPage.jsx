import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/use-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { eventsApi, API_BASE_URL } from '../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BackButton from '../../components/BackButton';
import { Calendar } from 'lucide-react';

const EditEventPage = ({ isNew = false }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [event, setEvent] = useState({
    name: '',
    description: '',
    event_date: '',
    accepting_submissions: true,
    instructor: '' 
  });
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!isNew && eventId) {
      setIsLoading(true);
      fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        credentials: 'include'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch event: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setEvent(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Error fetching event:", error);
          setLoadError(error.message);
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to load event details."
          });
        });
    }
  }, [isNew, eventId, toast]);

  const createEventMutation = useMutation({
    mutationFn: (data) => eventsApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Event Created",
        description: "The event has been created successfully.",
      });
      navigate('/admin/events');
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create event. Please try again."
      });
      setIsSaving(false);
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }) => eventsApi.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast({
        title: "Event Updated",
        description: "The event has been updated successfully.",
      });
      navigate('/admin/events');
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update event. Please try again."
      });
      setIsSaving(false);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleSubmissions = (checked) => {
    setEvent(prev => ({
      ...prev,
      accepting_submissions: checked
    }));
  };

  const validateForm = () => {
    if (!event.name || !event.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Event name is required.",
      });
      return false;
    }

    if (!event.event_date) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Event date is required.",
      });
      return false;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(event.event_date)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Event date must be in the format YYYY-MM-DD.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    if (isNew) {
      createEventMutation.mutate(event);
    } else {
      updateEventMutation.mutate({ id: eventId, data: event });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Error Loading Event</h1>
          <BackButton fallbackUrl="/admin/events" />
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-red-100 p-3 mb-4">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Failed to load event</h3>
            <p className="text-muted-foreground text-center mb-4">
              {loadError || "There was an error loading the event details."}
            </p>
            <Button onClick={() => navigate('/admin/events')}>
              Return to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">{isNew ? 'Create New Event' : 'Edit Event'}</h1>
        <BackButton fallbackUrl="/admin/events" />
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              {isNew 
                ? 'Create a new event and configure registration settings.'
                : 'Update the details of this event and manage registration settings.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                name="name"
                value={event.name}
                onChange={handleChange}
                placeholder="Enter event name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date</Label>
              <div className="relative">
                <Input
                  id="event_date"
                  name="event_date"
                  type="date"
                  value={event.event_date}
                  onChange={handleChange}
                  required
                  className="[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-calendar-picker-indicator]:appearance-none cursor-pointer peer"
                />
                <Calendar 
                  className="absolute right-3 top-3 h-4 w-4 text-foreground cursor-pointer"
                  onClick={() => document.getElementById('event_date').showPicker()} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Event Description</Label>
              <Textarea
                id="description"
                name="description"
                value={event.description || ''}
                onChange={handleChange}
                placeholder="Describe the event and provide any relevant information"
                rows={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor Name</Label>
              <Input
                id="instructor"
                name="instructor"
                value={event.instructor || ''}
                onChange={handleChange}
                placeholder="Enter instructor name"
              />
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <Label htmlFor="accepting_submissions">Accept Registrations</Label>
                <p className="text-sm text-muted-foreground">
                  {event.accepting_submissions 
                    ? 'The registration form is currently open' 
                    : 'The registration form is currently closed'}
                </p>
              </div>
              <Switch
                id="accepting_submissions"
                checked={event.accepting_submissions}
                onCheckedChange={handleToggleSubmissions}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/events')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-b-2 border-background"></div>
                  Saving...
                </>
              ) : (
                isNew ? 'Create Event' : 'Update Event'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default EditEventPage;