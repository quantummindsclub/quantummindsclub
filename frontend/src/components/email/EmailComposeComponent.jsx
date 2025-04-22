import { useState } from 'react';
import { useToast } from '../ui/use-toast';
import { apiPost } from '../../lib/api';
import TipTapEditor from '../TipTapEditor';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Send, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

const EmailComposeComponent = ({ defaultEmailData = null, onClose }) => {
  const { toast } = useToast();
  const [emailData, setEmailData] = useState({
    to: defaultEmailData?.to || '',
    cc: defaultEmailData?.cc || '',
    bcc: defaultEmailData?.bcc || '',
    subject: defaultEmailData?.subject || '',
    content: defaultEmailData?.content || ''
  });
  const [isSending, setIsSending] = useState(false);

  // Email send mutation
  const sendEmailMutation = useMutation({
    mutationFn: (data) => apiPost('/api/emails/send', data),
    onSuccess: (data) => {
      toast({
        title: "Email Sent",
        description: data.recipients ? 
          `Email has been sent successfully to ${data.recipients} recipient(s).` :
          "Email has been sent successfully.",
      });
      // Reset form
      setEmailData({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        content: ''
      });
      setIsSending(false);
      if (onClose) onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send email. Please try again.",
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

  const handleContentChange = (value) => {
    setEmailData(prev => ({
      ...prev,
      content: value
    }));
  };

  const validateForm = () => {
    if (!emailData.to.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Recipient email is required.",
      });
      return false;
    }

    if (!emailData.subject.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Subject is required.",
      });
      return false;
    }

    if (!emailData.content.trim() || emailData.content === '<p></p>') {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Message content is required.",
      });
      return false;
    }

    // Basic email validation for To, CC, and BCC fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Check To emails (can be comma-separated)
    const toEmails = emailData.to.split(',').map(email => email.trim());
    for (const email of toEmails) {
      if (email && !emailRegex.test(email)) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: `Invalid email address in To field: ${email}`,
        });
        return false;
      }
    }
    
    // Check CC emails
    if (emailData.cc) {
      const ccEmails = emailData.cc.split(',').map(email => email.trim());
      for (const email of ccEmails) {
        if (email && !emailRegex.test(email)) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: `Invalid email address in CC field: ${email}`,
          });
          return false;
        }
      }
    }
    
    // Check BCC emails
    if (emailData.bcc) {
      const bccEmails = emailData.bcc.split(',').map(email => email.trim());
      for (const email of bccEmails) {
        if (email && !emailRegex.test(email)) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: `Invalid email address in BCC field: ${email}`,
          });
          return false;
        }
      }
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setIsSending(true);
    sendEmailMutation.mutate(emailData);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            name="to"
            value={emailData.to}
            onChange={handleInputChange}
            placeholder="recipient@example.com (separate multiple emails with commas)"
            disabled={isSending}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cc">CC</Label>
          <Input
            id="cc"
            name="cc"
            value={emailData.cc}
            onChange={handleInputChange}
            placeholder="cc@example.com"
            disabled={isSending}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bcc">BCC</Label>
          <Input
            id="bcc"
            name="bcc"
            value={emailData.bcc}
            onChange={handleInputChange}
            placeholder="bcc@example.com"
            disabled={isSending}
          />
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
          <Label htmlFor="content">Message</Label>
          <div className="min-h-[300px]">
            <TipTapEditor
              content={emailData.content}
              onChange={handleContentChange}
              placeholder="Compose your email message here..."
              disabled={isSending}
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline"
          onClick={onClose}
          disabled={isSending}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          onClick={handleSend}
          disabled={isSending}
          className="w-full sm:w-auto"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Email
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EmailComposeComponent;