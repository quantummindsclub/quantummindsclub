import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import SentEmailsComponent from '../components/email/SentEmailsComponent';
import EmailComposeComponent from '../components/email/EmailComposeComponent';
import { Send } from 'lucide-react';

const AdminEmailPage = () => {
  const [activeTab, setActiveTab] = useState('sent');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Email</h1>
        </div>
      </div>

      <Tabs 
        defaultValue="sent" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>Sent Emails</span>
          </TabsTrigger>
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>Compose</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sent" className="mt-6">
          <SentEmailsComponent />
        </TabsContent>
        
        <TabsContent value="compose" className="mt-6">
          <Card className="p-6">
            <EmailComposeComponent onClose={() => setActiveTab('sent')} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminEmailPage;