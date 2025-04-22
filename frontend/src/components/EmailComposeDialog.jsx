import { useState } from 'react';
import { useToast } from './ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Loader2, Mail } from 'lucide-react';

const EmailComposeDialog = ({ isOpen, onClose, onSend, event }) => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: `Congratulations on your participation in ${event?.name || 'our event'}!`,
    message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Congratulations!</h2>
        <p>Dear Participant,</p>
        <p>Thank you for attending <strong>{event_name}</strong> on <strong>{event_date}</strong>. Your participation made the event a great success!</p>
        <p>We hope you found the event informative and valuable. We look forward to seeing you at our future events.</p>
        <p>Best regards,<br/>The Event Team</p>
      </div>
    `,
    filter: 'attended'
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

  const validateForm = () => {
    if (!emailData.subject.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Subject is required.",
      });
      return false;
    }

    if (!emailData.message.trim()) {
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
    try {
      const data = await onSend(emailData);
      toast({
        title: "Success",
        description: data?.recipients ?
          `${data.recipients} emails have been sent.` :
          "Emails have been sent successfully.",
      });
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send emails. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <span>Send Emails to Participants</span>
          </DialogTitle>
          <DialogDescription>
            Compose an email to send to participants of {event?.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filter">Send to:</Label>
            <RadioGroup
              id="filter"
              value={emailData.filter}
              onValueChange={handleFilterChange}
              className="flex flex-col space-y-1"
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
            <p className="text-sm text-muted-foreground">{getRecipientDescription()}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject:</Label>
            <Input
              id="subject"
              name="subject"
              value={emailData.subject}
              onChange={handleInputChange}
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message Content (HTML supported):</Label>
            <Textarea
              id="message"
              name="message"
              value={emailData.message}
              onChange={handleInputChange}
              className="min-h-[200px] font-mono text-sm"
              placeholder="Enter your message here. You can use HTML for formatting."
              disabled={isSending}
            />
            <p className="text-xs text-muted-foreground">
              Use {'{event_name}'} and {'{event_date}'} placeholders to include event details automatically.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
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
              'Send Emails'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailComposeDialog;