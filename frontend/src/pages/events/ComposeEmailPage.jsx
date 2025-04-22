import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/use-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { eventsApi } from '../../lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import BackButton from '../../components/BackButton';
import TipTapEditor from '../../components/TipTapEditor';
import { Loader2, Mail } from 'lucide-react';

const ComposeEmailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    filter: 'all'
  });
  const [isSending, setIsSending] = useState(false);

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.fetchEvent(eventId),
    onSuccess: (data) => {
      setEmailData(prev => ({
        ...prev,
        subject: `Information about ${data.name}`
      }));
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load event details",
      });
      navigate('/admin/events');
    }
  });

  useEffect(() => {
    if (event) {
      setEmailData(prev => ({
        ...prev,
        subject: `Congratulations on your participation in ${event.name}!`,
        message: `<p>Dear Participant,</p>\n<p>Thank you for attending <strong>{event_name}</strong> on <strong>{event_date}</strong>.<br>Your participation made the event a great success!</p>\n<p>You can view your achievement and download your certificate here:<br><a href=\"{achievement_url}\">{achievement_url}</a></p>\n<p>We hope you found the event valuable. We look forward to seeing you at our future events.</p>\n<p>Best regards,<br/>The Event Team</p>`
      }));
    }
  }, [event]);

  const sendEmailMutation = useMutation({
    mutationFn: (data) => eventsApi.sendParticipantEmails(eventId, data),
    onSuccess: (data) => {
      toast({
        title: "Emails Sent Successfully",
        description: data.recipients ? 
          `${data.recipients} emails have been sent.` :
          "Emails have been sent successfully.",
      });
      setIsSending(false);
      navigate(`/admin/events/${eventId}/participants`);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send emails. Please try again.",
      });
      setIsSending(false);
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (value) => {
    setEmailData(prev => ({
      ...prev,
      filter: value
    }));
  };

  const handleContentChange = (value) => {
    setEmailData(prev => ({
      ...prev,
      message: value
    }));
  };

  const validateForm = () => {
    if (!emailData.subject.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Subject is required.",
      });
      return false;
    }

    if (!emailData.message.trim() || emailData.message === '<p></p>') {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Message content is required.",
      });
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setIsSending(true);
    sendEmailMutation.mutate(emailData);
  };

  const getRecipientDescription = () => {
    if (!event) return "";
    switch (emailData.filter) {
      case 'all':
        return "All registered participants";
      case 'attended':
        return "Only participants marked as attended";
      case 'absent':
        return "Only participants marked as absent";
      default:
        return "";
    }
  };

  if (eventLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compose Email</h1>
          <p className="text-muted-foreground mt-1">
            Send emails to participants of {event?.name}
          </p>
        </div>
        <BackButton fallbackUrl={`/admin/events/${eventId}/participants`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Details</CardTitle>
          <CardDescription>
            Compose an email to send to participants. You can use rich text formatting and images.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="filter">Recipients</Label>
            <RadioGroup
              id="filter"
              value={emailData.filter}
              onValueChange={handleFilterChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer">All participants</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="attended" id="attended" />
                <Label htmlFor="attended" className="cursor-pointer">Attended participants only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="absent" id="absent" />
                <Label htmlFor="absent" className="cursor-pointer">Absent participants only</Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground mt-1">{getRecipientDescription()}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              value={emailData.subject}
              onChange={handleInputChange}
              placeholder="Enter email subject"
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message Content</Label>
            <div className="min-h-[300px]">
              <TipTapEditor
                content={emailData.message}
                onChange={handleContentChange}
                placeholder="Compose your email message here..."
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tips: Use {'{event_name}'}, {'{event_date}'}, and {'{achievement_url}'} placeholders to include event details and personalized achievement links automatically.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(`/admin/events/${eventId}/participants`)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Emails
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ComposeEmailPage;