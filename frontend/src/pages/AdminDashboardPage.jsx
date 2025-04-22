import { Link } from 'react-router-dom';
import { useToast } from '../components/ui/use-toast';
import { apiGet } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, MessageSquare, Settings, PlusCircle, Mail, Calendar, Users, CalendarPlus, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDate } from '../lib/utils';

const AdminDashboardPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats = {}, isLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [blogResponse, pagesResponse, commentsResponse] = await Promise.all([
        apiGet('/api/pages?type=blog'),
        apiGet('/api/pages?type=page'),
        apiGet('/api/comments/admin')
      ]);

      if (!blogResponse.ok || !pagesResponse.ok || !commentsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [blogData, pagesData, commentsData] = await Promise.all([
        blogResponse.json(),
        pagesResponse.json(),
        commentsResponse.json()
      ]);

      return {
        totalPosts: blogData.length || 0,
        totalPages: pagesData.length || 0,
        totalComments: commentsData.length || 0,
        recentPosts: [...blogData, ...pagesData]
          .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
          .slice(0, 5),
        recentComments: commentsData
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
      };
    }
  });

  const { data: unreadContactsCount = 0, refetch: refetchContacts } = useQuery({
    queryKey: ['unread-contacts'],
    queryFn: async () => {
      const response = await apiGet('/api/contact');
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const data = await response.json();
      return data.filter(contact => !contact.read).length;
    }
  });
  
  const { data: events = [], refetch: refetchEvents } = useQuery({
    queryKey: ['dashboard-events'],
    queryFn: async () => {
      const response = await apiGet('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      
      return data
        .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
        .slice(0, 5);
    }
  });

  const handleRefresh = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    refetchStats();
    refetchContacts();
    refetchEvents();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">Blog posts</p>
          </CardContent>
          <CardFooter>
            <Link 
              to="/admin/pages?tab=blogs" 
              className="text-xs text-blue-500 hover:underline"
            >
              Manage posts →
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPages}</div>
            <p className="text-xs text-muted-foreground">Static pages</p>
          </CardContent>
          <CardFooter>
            <Link 
              to="/admin/pages?tab=pages" 
              className="text-xs text-blue-500 hover:underline"
            >
              Manage pages →
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
            <p className="text-xs text-muted-foreground">Total comments</p>
          </CardContent>
          <CardFooter>
            <Link 
              to="/admin/comments" 
              className="text-xs text-blue-500 hover:underline"
            >
              Manage comments →
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unread Messages
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadContactsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Contact form
            </p>
          </CardContent>            
            {unreadContactsCount > 0 && (
              <CardFooter>
                <Link 
                  to="/admin/contacts" 
                  className="text-xs text-blue-500 hover:underline"
                >
                  View messages →
                </Link>
              </CardFooter>
            )}
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="flex-grow flex-shrink-0 basis-full sm:basis-auto min-w-0">
              <Link to="/new" className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">Create New Post</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex-grow flex-shrink-0 basis-full sm:basis-auto min-w-0">
              <Link to="/admin/settings" className="flex items-center">
                <Settings className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">Site Settings</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex-grow flex-shrink-0 basis-full sm:basis-auto min-w-0">
              <Link to="/admin/events/new" className="flex items-center">
                <CalendarPlus className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">Create Event</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex-grow flex-shrink-0 basis-full sm:basis-auto min-w-0">
              <Link to="/admin/email?tab=compose" className="flex items-center">
                <Mail className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">Compose Email</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex-grow flex-shrink-0 basis-full sm:basis-auto min-w-0">
              <Link to="/admin/comments" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">Manage Comments</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex-grow flex-shrink-0 basis-full sm:basis-auto min-w-0">
              <Link to="/admin/contacts" className="flex items-center">
                <Users className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">View Contacts</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Content</CardTitle>
            <CardDescription>Recently created or updated posts and pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentPosts.length > 0 ? (
                stats.recentPosts.map(post => (
                  <div key={post.id} className="flex flex-col sm:flex-row sm:items-start gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/edit/${post.slug}`}
                        className="font-medium hover:text-primary block truncate"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {post.is_blog === 1 ? 'Blog post' : 'Page'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="shrink-0 self-start sm:self-center">
                      <Link to={`/edit/${post.slug}`}>Edit</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No content found</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link to="/admin/pages">View All Content</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Comments</CardTitle>
            <CardDescription>Latest comments on your posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentComments.length > 0 ? (
                stats.recentComments.map(comment => (
                  <div key={comment.id} className="border-b border-border pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{comment.author_name}</p>
                      <p className="text-xs text-muted-foreground">on {comment.post_title}</p>
                    </div>
                    <p className="text-sm line-clamp-1 text-muted-foreground">
                      {comment.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No comments found</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link to="/admin/comments">View All Comments</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Recent and upcoming events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map(event => (
                <div key={event.id} className="flex flex-col sm:flex-row sm:items-start gap-3 border-b border-border pb-2 last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{event.name}</div>
                    <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-x-2 gap-y-1 mt-1">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-foreground shrink-0" />
                        {formatDate(event.event_date)}
                      </div>
                      <span className={`px-1.5 py-0.5 rounded-sm ${event.accepting_submissions ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {event.accepting_submissions ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 self-start">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/events/edit/${event.id}`}>Edit</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/events/${event.id}/participants`}>
                        <Users className="h-3.5 w-3.5 mr-1" />
                        {event.participant_count}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                <p>No events found</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/admin/events/new">Create your first event</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link to="/admin/events">Manage Events</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
