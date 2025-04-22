import { useEffect } from 'react';
import { MailIcon, MapPinIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import ContactForm from '../components/ContactForm';
import { Card, CardContent } from '../components/ui/card';
import HeroSection from '../components/HeroSection';
import MapComponent from '../components/MapComponent';

const ContactPage = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['map-data'],
      queryFn: () => {
        return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3605.8413490580374!2d81.90861817558013!3d25.343104225775093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3985497f856b1d35%3A0xf727c4fc418f7b17!2sUnited%20College%20of%20Engineering%20and%20Research!5e0!3m2!1sen!2sin!4v1745068495570!5m2!1sen!2sin";
      },
    });
  }, [queryClient]);

  return (
    <>
      <HeroSection 
        title="Get In Touch"
        subtitle="Have some questions or want to collaborate? We're here to help and would love to hear from you."
        backgroundImage="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
        buttons={[
          { label: "Back to Home", href: "/", icon: "home" },
          { label: "About Us", href: "/about", icon: "info" },
          { label: "Our Blog", href: "/all", icon: "blog" }
        ]}
      />
      
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Location</h2>
          <MapComponent className="shadow-md" />
        </div>
        
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Contact Us</h2>
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            <div className="md:col-span-2">
              <ContactForm />
            </div>
            
            <div className="flex flex-col h-full">
              <Card className="flex-1 mb-4">
                <CardContent className="pt-6 flex flex-col items-center text-center h-full justify-center">
                  <MailIcon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-medium mb-2">Email</h3>
                  <p className="text-muted-foreground">qm_ucer@united.edu.in</p>
                  <p className="text-muted-foreground">quantummindssocial@gmail.com</p>
                </CardContent>
              </Card>
              
              <Card className="flex-1">
                <CardContent className="pt-6 flex flex-col items-center text-center h-full justify-center">
                  <MapPinIcon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-medium mb-2">Address</h3>
                  <p className="text-muted-foreground">United College of Engineering and Research</p>
                  <p className="text-muted-foreground">Prayagraj, Uttar Pradesh 211010</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
