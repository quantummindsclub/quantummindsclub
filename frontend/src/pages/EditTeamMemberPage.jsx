import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../components/ui/use-toast'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { Textarea } from '../components/ui/textarea'
import BackButton from '../components/BackButton'
import { apiGet, apiPut, apiPost } from '../lib/api'

const EditTeamMemberPage = ({ isNew = false }) => {
  const [member, setMember] = useState({
    name: '',
    role: '',
    bio: '',
    image: '',
    linkedin: '',
    github: '',
    email: '',
    leadership: false
  })
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (isNew) return
    
    const fetchMember = async () => {
      try {
        setIsLoading(true)
        const response = await apiGet(`/api/team/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Team member not found",
            })
            navigate('/admin/members')
            return
          }
          throw new Error('Failed to fetch team member data')
        }
        
        const data = await response.json()
        
        setMember({
          name: data.name || '',
          role: data.role || '',
          bio: data.bio || '',
          image: data.image || '',
          linkedin: data.linkedin || '',
          github: data.github || '',
          email: data.email || '',
          leadership: data.leadership === 1 || data.leadership === true
        })
      } catch (error) {
        console.error('Error fetching team member:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load team member data",
        })
        navigate('/admin/members')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMember()
  }, [id, isNew, navigate, toast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setMember(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (checked, name) => {
    setMember(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!member.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Name is required",
      })
      return
    }
    
    if (!member.role.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Position/Role is required",
      })
      return
    }
    
    if (!member.bio.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Bio is required",
      })
      return
    }
    
    if (!member.image.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Image URL is required",
      })
      return
    }
    
    try {
      setIsSaving(true)
      
      const memberData = {
        ...member,
        leadership: member.leadership ? 1 : 0
      }
      
      let response
      
      if (isNew) {
        response = await apiPost('/api/team', memberData)
      } else {
        response = await apiPut(`/api/team/${id}`, memberData)
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save team member')
      }
      
      toast({
        title: isNew ? "Member Created" : "Member Updated",
        description: isNew ? "Team member has been created successfully." : "Team member has been updated successfully.",
      })
      
      navigate('/admin/members')
    } catch (error) {
      console.error('Save error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save team member",
      })
    } finally {
      setIsSaving(false)
    }
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {isNew ? 'Add Team Member' : `Edit: ${member.name}`}
        </h1>
        <BackButton 
          to="/admin/members" 
          label="Back to Members"
          className="w-full sm:w-auto justify-center"
        />
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={member.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Position</Label>
            <Input
              id="role"
              name="role"
              value={member.role}
              onChange={handleChange}
              placeholder="Job Title"
              required
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={member.bio}
              onChange={handleChange}
              placeholder="Brief biography"
              rows={4}
              required
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="image">Profile Image URL</Label>
            <Input
              id="image"
              name="image"
              value={member.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              name="linkedin"
              value={member.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="github">GitHub URL</Label>
            <Input
              id="github"
              name="github"
              value={member.github}
              onChange={handleChange}
              placeholder="https://github.com/username"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={member.email}
              onChange={handleChange}
              placeholder="name@example.com"
            />
          </div>
          
          <div className="flex items-center space-x-2 md:col-span-2">
            <Checkbox 
              id="leadership"
              checked={member.leadership}
              onCheckedChange={(checked) => handleCheckboxChange(checked, 'leadership')}
            />
            <Label htmlFor="leadership">Leadership Team Member</Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/members')}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-background"></div>
                {isNew ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              isNew ? 'Create Member' : 'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EditTeamMemberPage
