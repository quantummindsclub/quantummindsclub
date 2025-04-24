import { useState } from 'react';
import { useToast } from './ui/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Send, Loader2 } from 'lucide-react';
import { apiPost } from '../lib/api';

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.subject || formData.subject.trim().length < 3) {
      errors.subject = "Subject must be at least 3 characters";
    }
    
    if (!formData.message || formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
    }
    
    if (formData.message && formData.message.length > 5000) {
      errors.message = "Message is too long (maximum 5000 characters)";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await apiPost('/api/contact', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit contact form');
      }
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully. We'll get back to you soon.",
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name"
                className={formErrors.name ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {formErrors.name && (
                <p className="text-destructive text-xs mt-1">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your email address"
                className={formErrors.email ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {formErrors.email && (
                <p className="text-destructive text-xs mt-1">{formErrors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Message subject"
              className={formErrors.subject ? "border-destructive" : ""}
              disabled={isSubmitting}
            />
            {formErrors.subject && (
              <p className="text-destructive text-xs mt-1">{formErrors.subject}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Your message"
              className={`min-h-[150px] ${formErrors.message ? "border-destructive" : ""}`}
              disabled={isSubmitting}
            />
            {formErrors.message && (
              <p className="text-destructive text-xs mt-1">{formErrors.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
