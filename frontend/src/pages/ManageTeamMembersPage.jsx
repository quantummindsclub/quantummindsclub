import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/ui/use-toast'
import { Button } from '../components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import { PlusCircle, Edit, Trash2 } from 'lucide-react'
import { apiGet, apiDelete } from '../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ManageTeamMembersPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const response = await apiGet('/api/team');
      if (!response.ok) throw new Error('Failed to fetch team members');
      return response.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (memberId) => apiDelete(`/api/team/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Member Deleted",
        description: "Team member has been removed.",
      });
    }
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)

  const handleDelete = async () => {
    if (!memberToDelete) return
    
    try {
      await deleteMutation.mutateAsync(memberToDelete.id)
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Failed to delete the team member.",
      })
    } finally {
      setMemberToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const confirmDelete = (member) => {
    setMemberToDelete(member)
    setDeleteDialogOpen(true)
  }

  const handleEdit = (member) => {
    navigate(`/admin/members/edit/${member.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team Members</h1>
        <Button 
          onClick={() => navigate('/admin/members/new')}
          className="w-full sm:w-auto"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="bg-card rounded-md border border-card-border p-8 text-center">
          <p className="text-muted-foreground mb-4">No team members found</p>
          <Button 
            onClick={() => navigate('/admin/members/new')}
            variant="outline"
            className="w-full sm:w-auto text-muted-foreground"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add First Member
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-md border border-card-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.role || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(member)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => confirmDelete(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {memberToDelete?.name} from the team. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ManageTeamMembersPage
