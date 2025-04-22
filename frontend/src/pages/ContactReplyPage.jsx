import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/use-toast';
import { apiGet } from '../lib/api';
import { Card } from '../components/ui/card';
import BackButton from '../components/BackButton';
import { formatDate } from '../lib/utils';
import EmailComposeComponent from '../components/email/EmailComposeComponent';

const ContactReplyPage = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await apiGet(`/api/contact/${contactId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch contact details');
        }
        const data = await response.json();
        setContact(data);
        
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load contact details",
        });
        navigate('/admin/contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [contactId, navigate, toast]);

  const handleClose = () => {
    navigate('/admin/contacts');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!contact) {
    return null;
  }

  const emailData = {
    to: contact.email,
    subject: `Re: ${contact.subject}`,
    content: `
<p>Dear ${contact.name},</p>
<p>Thank you for contacting us.</p>
<br/>
<p><strong>Original message:</strong></p>
<blockquote style="border-left: 2px solid #ddd; padding-left: 1rem; margin: 1rem 0; color: #666;">
${contact.message}
</blockquote>
<br/>
<p>Best regards,<br/>The Team</p>`
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reply to Contact</h1>
          <p className="text-muted-foreground mt-1">
            Compose your reply to {contact.name}
          </p>
        </div>
        <BackButton fallbackUrl="/admin/contacts" />
      </div>

      <Card>
        <div className="p-6 space-y-6">
          <div className="space-y-4 pb-6 border-b">
            <div>
              <h2 className="text-lg font-semibold">{contact.subject}</h2>
              <p className="text-sm text-muted-foreground">
                From {contact.name} ({contact.email})
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Received: {formatDate(contact.created_at)}
              </p>
            </div>
            <div className="whitespace-pre-wrap border p-3 rounded-md bg-secondary/30">
              {contact.message}
            </div>
          </div>

          <EmailComposeComponent 
            defaultEmailData={emailData}
            onClose={handleClose}
          />
        </div>
      </Card>
    </div>
  );
};

export default ContactReplyPage;