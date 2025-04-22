import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { eventsApi } from '../../lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDate } from '../../lib/utils';

const EventRegistrationPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    academic_year: '',
    college_code: '',
    student_id: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['public-event', eventId],
    queryFn: () => eventsApi.fetchEvent(eventId),
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load event details",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: (data) => eventsApi.registerParticipant(eventId, data),
    onSuccess: () => {
      setSubmitting(false);
      setSuccess(true);
      setFormState({
        name: '',
        email: '',
        phone: '',
        department: '',
        academic_year: '',
        college_code: '',
        student_id: '',
      });
      toast({
        title: "Registration Successful",
        description: "You have been registered for this event.",
      });
    },
    onError: (error) => {
      setSubmitting(false);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Failed to register for the event. Please try again.",
      });
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'email', 'department', 'academic_year', 'college_code', 'student_id'];
    for (const field of requiredFields) {
      if (!formState[field] || !formState[field].trim()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: `${field.replace('_', ' ').toUpperCase()} is required.`,
        });
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid email address.",
      });
      return false;
    }

    if (formState.phone && !/^\d{10}$/.test(formState.phone.replace(/\D/g, ''))) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Phone number should contain 10 digits.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    registerMutation.mutate(formState);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center justify-center">
              <AlertCircle className="mr-2 h-6 w-6" />
              Event Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Sorry, the event you're looking for does not exist or has been removed.</p>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event.accepting_submissions) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>{event.name}</CardTitle>
            <CardDescription>
              <div className="flex items-center justify-center mt-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(event.event_date)}</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-amber-500 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 mr-2" />
              <span className="text-lg font-medium">Registration Closed</span>
            </div>
            <div>The registration for this event is no longer open.</div>
            {event.description && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <div className="text-sm">{event.description}</div>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>{event.name}</CardTitle>
            <CardDescription>
              <div className="flex items-center justify-center mt-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(event.event_date)}</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-green-500 flex items-center justify-center mb-4">
              <CheckCircle className="h-5 w-5 mr-1.5" />
              <span className="text-lg font-medium">Registration Successful!</span>
            </div>
            <div>Thank you for registering for this event. We look forward to seeing you!</div>
            <div className="mt-6 p-4 bg-muted rounded-md text-left">
              <h3 className="font-medium mb-2">Event Details:</h3>
              <div className="text-sm mb-1"><strong>Date:</strong> {formatDate(event.event_date)}</div>
              {event.description && (
                <div className="text-sm mt-2">{event.description}</div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 sm:space-x-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              Return to Home
            </Button>
            <Button onClick={() => setSuccess(false)}>
              Register Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{event.name} - Registration</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Registration</CardTitle>
          <CardDescription>
            <div className="flex items-center mt-2">
              <Calendar className="h-4 w-4 mr-2 text-foreground" />
              <span>{formatDate(event.event_date)}</span>
            </div>
            {event.description && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="text-sm">{event.description}</div>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                name="phone"
                value={formState.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formState.department}
                  onValueChange={(value) => handleSelectChange('department', value)}
                  required
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSIT/AIML">CSIT/AIML</SelectItem>
                    <SelectItem value="ME">ME</SelectItem>
                    <SelectItem value="EE">EE</SelectItem>
                    <SelectItem value="ECE">ECE</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academic_year">Academic Year</Label>
                <Select
                  value={formState.academic_year}
                  onValueChange={(value) => handleSelectChange('academic_year', value)}
                  required
                >
                  <SelectTrigger id="academic_year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="college_code">College Code</Label>
                <Input
                  id="college_code"
                  name="college_code"
                  value={formState.college_code}
                  onChange={handleChange}
                  placeholder="Enter your college code"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  id="student_id"
                  name="student_id"
                  value={formState.student_id}
                  onChange={handleChange}
                  placeholder="Enter your student ID"
                  required
                />
              </div>
            </div>

            <div className="bg-muted p-3 rounded-md">
              <div className="text-sm text-muted-foreground">
                <strong>Note:</strong> Your Participant ID will be generated using your college code
                and student ID. Please ensure these details are correct.
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-b-2 border-background"></div>
                  Submitting...
                </>
              ) : (
                'Register'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EventRegistrationPage;