import { useState, useEffect } from 'react'
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom'
import { useToast } from './components/ui/use-toast'
import { apiGet, queryClient } from './lib/api'
import { QueryClientProvider } from '@tanstack/react-query'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import PostPage from './pages/PostPage'
import ManagePages from './pages/ManagePages'
import SiteSettingsPage from './pages/SiteSettingsPage'
import EditPage from './pages/EditPage'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboardPage from './pages/AdminDashboardPage'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import NotFoundPage from './pages/NotFoundPage'
import AllPostsPage from './pages/AllPostsPage'
import AdminCommentsPage from './pages/AdminCommentsPage'
import ManageTeamMembersPage from './pages/ManageTeamMembersPage'
import EditTeamMemberPage from './pages/EditTeamMemberPage'
import ManageGalleryPage from './pages/ManageGalleryPage'
import ContactPage from './pages/ContactPage'
import AdminContactsPage from './pages/AdminContactsPage'
import AdminEmailPage from './pages/AdminEmailPage'
import SentEmailDetailPage from './pages/SentEmailDetailPage'
import ScrollToTop from './components/ScrollToTop'
import ManageEventsPage from './pages/events/ManageEventsPage'
import EditEventPage from './pages/events/EditEventPage'
import ParticipantsPage from './pages/events/ParticipantsPage'
import EventRegistrationPage from './pages/events/EventRegistrationPage'
import ComposeEmailPage from './pages/events/ComposeEmailPage'
import ContactReplyPage from './pages/ContactReplyPage'
import EventAchievementPage from './pages/events/EventAchievementPage'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="login" element={<LoginPage />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="post/:slug" element={<PostPage type="blog" />} />
            <Route path="all" element={<AllPostsPage />} />
            <Route path=":slug" element={<PostPage type="page" />} />
            <Route path="manage" element={
              <ProtectedRoute>
                <Navigate to="/admin/pages" replace />
              </ProtectedRoute>
            } />
            <Route path="manage/comments" element={
              <ProtectedRoute>
                <Navigate to="/admin/comments" replace />
              </ProtectedRoute>
            } />
            <Route path="site-settings" element={
              <ProtectedRoute>
                <Navigate to="/admin/settings" replace />
              </ProtectedRoute>
            } />
            <Route path="edit/:slug" element={
              <ProtectedRoute>
                <EditPage />
              </ProtectedRoute>
            } />
            <Route path="new" element={
              <ProtectedRoute>
                <EditPage isNew={true} />
              </ProtectedRoute>
            } />
            <Route path="contact" element={<ContactPage />} />
            <Route path="not-found" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboardPage />} />
            <Route path="pages" element={<ManagePages />} />
            <Route path="comments" element={<AdminCommentsPage />} />
            <Route path="members" element={<ManageTeamMembersPage />} />
            <Route path="members/new" element={<EditTeamMemberPage isNew={true} />} />
            <Route path="members/edit/:id" element={<EditTeamMemberPage />} />
            <Route path="gallery" element={<ManageGalleryPage />} />
            <Route path="contacts" element={<AdminContactsPage />} />
            <Route path="contacts/:contactId/reply" element={<ContactReplyPage />} />
            <Route path="email" element={<AdminEmailPage />} />
            <Route path="emails/:emailId" element={<SentEmailDetailPage />} />
            <Route path="settings" element={<SiteSettingsPage />} />
            
            <Route path="events" element={<ManageEventsPage />} />
            <Route path="events/new" element={<EditEventPage isNew={true} />} />
            <Route path="events/edit/:eventId" element={<EditEventPage />} />
            <Route path="events/:eventId/participants" element={<ParticipantsPage />} />
            <Route path="events/:eventId/compose-email" element={<ComposeEmailPage />} />
          </Route>
          
          <Route path="/events/:eventId/register" element={<EventRegistrationPage />} />
          <Route path="/events/:eventIdAndCodes" element={<EventAchievementPage />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
