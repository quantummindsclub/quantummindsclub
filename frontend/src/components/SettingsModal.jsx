import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { LayoutDashboard } from 'lucide-react'

const SettingsModal = ({ open, onOpenChange }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  
  const handleOpenAdminDashboard = () => {
    onOpenChange(false)
    navigate('/admin')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] max-w-[425px] border-card-border p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle>Admin Panel</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 py-2">
          <Button
            variant="default"
            className="flex w-full justify-start gap-2 h-auto py-3"
            onClick={handleOpenAdminDashboard}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span className="text-start">Open Admin Dashboard</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsModal
