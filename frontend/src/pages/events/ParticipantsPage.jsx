import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Trash2, Download, Search, UserCheck, Mail, RefreshCw } from 'lucide-react';
import { Switch } from '../../components/ui/switch';
import { eventsApi } from '../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BackButton from '../../components/BackButton';

const ParticipantsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: event, isLoading: eventLoading, refetch: refetchEvent } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.fetchEvent(eventId),
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load event details",
      });
      navigate('/admin/events');
    }
  });
  
  const { 
    data: participants = [], 
    isLoading: participantsLoading, 
    refetch: refetchParticipants 
  } = useQuery({
    queryKey: ['participants', eventId],
    queryFn: () => eventsApi.fetchParticipants(eventId),
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load participants",
      });
    }
  });

  const handleRefresh = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    refetchEvent();
    refetchParticipants();
  };
  
  const deleteMutation = useMutation({
    mutationFn: (participantId) => eventsApi.deleteParticipant(participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants', eventId] });
      toast({
        title: "Participant Deleted",
        description: "The participant has been removed from this event.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete participant",
      });
    }
  });
  
  const attendanceMutation = useMutation({
    mutationFn: ({ participantId, attended }) => eventsApi.updateAttendance(participantId, attended),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants', eventId] });
      toast({
        title: "Attendance Updated",
        description: "The participant's attendance status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update attendance status",
      });
    }
  });
  
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = 
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.participant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'attended') {
      return matchesSearch && participant.attended;
    } else if (activeTab === 'absent') {
      return matchesSearch && !participant.attended;
    }
    
    return matchesSearch;
  });
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const confirmDelete = (participantId) => {
    setDeleteId(participantId);
    setShowDeleteDialog(true);
  };
  
  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };
  
  const toggleAttendance = (participantId, currentStatus) => {
    attendanceMutation.mutate({
      participantId,
      attended: !currentStatus
    });
  };
  
  const handleComposeEmail = () => {
    navigate(`/admin/events/${eventId}/compose-email`);
  };
  
  const exportToCSV = () => {
    const headers = ['Participant ID', 'Name', 'Email', 'Phone', 'Department', 'Academic Year', 'Attended'];
    
    const csvContent = [
      headers.join(','),
      ...participants.map(p => [
        p.participant_id,
        `"${p.name.replace(/"/g, '""')}"`, 
        p.email,
        p.phone || '',
        p.department,
        p.academic_year,
        p.attended ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${event?.name || 'event'}-participants.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const isLoading = eventLoading || participantsLoading;
  
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
        <div>
          <h1 className="text-3xl font-bold">{event?.name}</h1>
          <p className="text-muted-foreground">Event Date: {event?.event_date}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" title="Refresh data">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <BackButton fallbackUrl="/admin/events" />
        </div>
      </div>
      
      <div className="flex flex-col space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All
            </TabsTrigger>
            <TabsTrigger value="attended">
              Attended
            </TabsTrigger>
            <TabsTrigger value="absent">
              Absent
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search participants..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleComposeEmail}
            className="w-full flex items-center justify-center"
            disabled={participants.length === 0}
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Emails
          </Button>
          
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            title="Export to CSV"
            className="w-full flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Participant List</CardTitle>
          <CardDescription>
            {filteredParticipants.length} participants {activeTab !== 'all' ? `(${activeTab})` : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredParticipants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No participants found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm 
                  ? `No participants match your search "${searchTerm}"`
                  : activeTab !== 'all' 
                    ? `No ${activeTab} participants found`
                    : 'No participants have registered for this event yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Attended</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">
                        {participant.participant_id}
                      </TableCell>
                      <TableCell>{participant.name}</TableCell>
                      <TableCell>{participant.department}</TableCell>
                      <TableCell>{participant.academic_year}</TableCell>
                      <TableCell>{participant.email}</TableCell>
                      <TableCell>{participant.phone || '-'}</TableCell>
                      <TableCell>
                        <Switch
                          checked={participant.attended}
                          onCheckedChange={() => toggleAttendance(participant.id, participant.attended)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(participant.id)}
                          title="Delete participant"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the participant from this event.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Delete Participant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ParticipantsPage;