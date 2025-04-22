import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import {
  FileText,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  LayoutDashboard,
  Github,
  Users,
  Image,
  Mail,
  Calendar,
  Contact
} from 'lucide-react';
import { Toaster } from '../components/ui/toaster';

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobileView, setIsMobileView] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      const mobileWidth = window.innerWidth < 768;
      setIsMobileView(mobileWidth);
      if (mobileWidth) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileView && !isSidebarCollapsed && !event.target.closest('.sidebar')) {
        setIsSidebarCollapsed(true);
      }
    };

    if (isMobileView && !isSidebarCollapsed) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileView, isSidebarCollapsed]);

  useEffect(() => {
    if (isMobileView) {
      setIsSidebarCollapsed(true);
    }
  }, [location.pathname, isMobileView]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "Please try again",
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleNavLinkClick = () => {
    if (isMobileView) {
      setIsSidebarCollapsed(true);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background admin-layout">
      {isMobileView && !isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
      
      <div
        className={`sidebar ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } flex flex-col bg-card border-r border-card-border transition-all duration-300 ease-in-out ${
          isMobileView ? 'fixed h-full z-20' : ''
        } ${isMobileView && isSidebarCollapsed ? '-translate-x-full' : ''}`}
      >
        <div className="h-16 flex items-center border-b">
          {!isSidebarCollapsed && (
            <span className="font-bold text-lg px-4">Admin Panel</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={isSidebarCollapsed ? "mx-auto" : "ml-auto mr-2"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <LayoutDashboard className={`h-5 w-5 ${!isSidebarCollapsed && 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </NavLink>
            
            <NavLink
              to="/admin/pages"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <FileText className={`h-5 w-5 ${!isSidebarCollapsed && 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Pages & Posts</span>}
            </NavLink>
            
            <NavLink
              to="/admin/comments"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <MessageSquare className={`h-5 w-5 ${!isSidebarCollapsed && 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Comments</span>}
            </NavLink>
            
            <NavLink
              to="/admin/members"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <Users className={`h-5 w-5 ${!isSidebarCollapsed && 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Members</span>}
            </NavLink>

            <NavLink
              to="/admin/gallery"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <Image className={`h-5 w-5 ${!isSidebarCollapsed && 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Gallery</span>}
            </NavLink>

            <NavLink
              to="/admin/email"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <Mail className={`h-5 w-5 ${!isSidebarCollapsed && 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Email</span>}
            </NavLink>

            <NavLink
              to="/admin/contacts"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <Contact className={`h-5 w-5 ${!isSidebarCollapsed && 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Contacts</span>}
            </NavLink>

            <NavLink
              to="/admin/events"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <Calendar className={`h-5 w-5 ${!isSidebarCollapsed && 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Events</span>}
            </NavLink>
          </nav>
        </div>

        <div className="h-16 mt-auto border-t">
          <div className="m-2">
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-md ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`
              }
              onClick={handleNavLinkClick}
            >
              <Settings className={`${!isSidebarCollapsed && 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Settings</span>}
            </NavLink>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full overflow-hidden relative">
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 shrink-0 sticky top-0 z-30">
          <div className="flex items-center">
            {isMobileView && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="mr-2"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
            <Link to="/" className="flex items-center hover:text-primary">
              <Home className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Back to Site</span>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 relative z-10">
          <Outlet />
        </main>

        <footer className="h-16 border-t bg-card flex items-center justify-between px-4 shrink-0 sticky bottom-0 z-30">
          <div className="text-sm text-muted-foreground">
            © CryptoKnights
          </div>

          <div>
            <a 
              href="https://github.com/rulercosta" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center hover:text-primary"
            >
              <Github className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">rulercosta</span>
            </a>
          </div>
        </footer>
        <Toaster />
      </div>
    </div>
  );
};

export default AdminLayout;
