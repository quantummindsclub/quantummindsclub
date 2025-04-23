/**
 * API utilities for handling backend requests
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, 
      cacheTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  }
})

const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://quantummindsapi.onrender.com';
  }
  
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const finalOptions = {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
    }
  };
  
  try {
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      let errorData;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = await response.text();
        }
      } catch (parseError) {
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}

const isAuthTimeout = (error) => {
  return error?.response?.status === 401 || 
         error?.message?.includes('auth') ||
         error?.message?.includes('unauthorized');
}

export const handleAuthTimeout = () => {
  queryClient.clear();
  window.location.href = '/login';
}

export async function apiGet(endpoint, options = {}) {
  try {
    const response = await apiRequest(endpoint, {
      ...options,
      method: 'GET'
    });
    
    if (response.status === 401) {
      handleAuthTimeout();
      return null;
    }
    
    return response;
  } catch (error) {
    if (isAuthTimeout(error)) {
      handleAuthTimeout();
      return null;
    }
    throw error;
  }
}

export async function apiPost(endpoint, data, options = {}) {
  const isFormData = data instanceof FormData;
  
  const headers = !isFormData 
    ? { 'Content-Type': 'application/json', ...options.headers }
    : { ...options.headers };
  
  try {
    const response = await apiRequest(endpoint, {
      ...options,
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });

    if (response.status === 401) {
      handleAuthTimeout();
      return null;
    }

    return response;
  } catch (error) {
    if (isAuthTimeout(error)) {
      handleAuthTimeout();
      return null;
    }
    throw error;
  }
}

export async function apiPut(endpoint, data, options = {}) {
  try {
    const response = await apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      handleAuthTimeout();
      return null;
    }

    return response;
  } catch (error) {
    if (isAuthTimeout(error)) {
      handleAuthTimeout();
      return null;
    }
    throw error;
  }
}

export async function apiDelete(endpoint, options = {}) {
  try {
    const response = await apiRequest(endpoint, {
      ...options,
      method: 'DELETE',
    });

    if (response.status === 401) {
      handleAuthTimeout();
      return null;
    }

    return response;
  } catch (error) {
    if (isAuthTimeout(error)) {
      handleAuthTimeout();
      return null;
    }
    throw error;
  }
}

export const getTeamMembers = async () => {
  return apiGet('/api/team/');
};

export const getTeamMember = async (id) => {
  return apiGet(`/api/team/${id}`);
};

export const createTeamMember = async (data) => {
  return apiPost('/api/team/', data);
};

export const updateTeamMember = async (id, data) => {
  return apiPut(`/api/team/${id}`, data);
};

export const deleteTeamMember = async (id) => {
  return apiDelete(`/api/team/${id}`);
};

export const galleryApi = {
  fetchGalleryImages: async (featuredOnly = false) => {
    const url = `/api/gallery${featuredOnly ? '?featured=true' : ''}`;
    const response = await apiGet(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch gallery images');
    }
    
    return response.json();
  },

  fetchGalleryImage: async (id) => {
    const response = await apiGet(`/api/gallery/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch gallery image');
    }
    
    return response.json();
  },

  addGalleryImage: async (imageData) => {
    const response = await apiPost('/api/gallery', imageData);
    
    if (!response.ok) {
      throw new Error('Failed to add gallery image');
    }
    
    return response.json();
  },

  updateGalleryImage: async (id, imageData) => {
    const response = await apiPut(`/api/gallery/${id}`, imageData);
    
    if (!response.ok) {
      throw new Error('Failed to update gallery image');
    }
    
    return response.json();
  },

  deleteGalleryImage: async (id) => {
    const response = await apiDelete(`/api/gallery/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to delete gallery image');
    }
    
    return response.json();
  },

  toggleFeaturedStatus: async (id, featured) => {
    const response = await apiPut(`/api/gallery/featured/${id}`, { featured });
    
    if (!response.ok) {
      throw new Error('Failed to update featured status');
    }
    
    return response.json();
  },

  uploadToGallery: async (formData) => {
    formData.append('add_to_gallery', 'true');
    
    const response = await fetch(API_BASE_URL + '/api/uploads', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }
    
    return response.json();
  }
};

export const eventsApi = {
  fetchEvents: async () => {
    const response = await apiGet('/api/events');
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    return response.json();
  },

  fetchEvent: async (eventId) => {
    const response = await apiGet(`/api/events/${eventId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch event details');
    }
    
    return response.json();
  },

  createEvent: async (eventData) => {
    const response = await apiPost('/api/events', eventData);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create event');
    }
    
    return response.json();
  },

  updateEvent: async (eventId, eventData) => {
    const response = await apiPut(`/api/events/${eventId}`, eventData);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update event');
    }
    
    return response.json();
  },

  deleteEvent: async (eventId) => {
    const response = await apiDelete(`/api/events/${eventId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete event');
    }
    
    return response.json();
  },

  fetchParticipants: async (eventId) => {
    const response = await apiGet(`/api/events/${eventId}/participants`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch participants');
    }
    
    return response.json();
  },

  registerParticipant: async (eventId, participantData) => {
    const response = await apiPost(`/api/events/${eventId}/participants`, participantData);
    
    if (!response.ok) {
      const errorClone = response.clone();
      try {
        const error = await errorClone.json();
        throw new Error(error.error || 'Failed to register participant');
      } catch (jsonError) {
        throw new Error('Failed to register participant');
      }
    }
    
    return response.json();
  },

  updateParticipant: async (participantId, participantData) => {
    const response = await apiPut(`/api/events/participants/${participantId}`, participantData);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update participant');
    }
    
    return response.json();
  },

  deleteParticipant: async (participantId) => {
    const response = await apiDelete(`/api/events/participants/${participantId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete participant');
    }
    
    return response.json();
  },

  updateAttendance: async (participantId, attended) => {
    const response = await apiPut(`/api/events/participants/${participantId}/attendance`, { attended });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update attendance status');
    }
    
    return response.json();
  },

  sendParticipantEmails: async (eventId, emailData) => {
    const response = await apiPost(`/api/events/${eventId}/send-emails`, emailData);
    
    if (!response.ok) {
      const errorClone = response.clone();
      try {
        const error = await errorClone.json();
        throw new Error(error.error || 'Failed to send emails');
      } catch (jsonError) {
        throw new Error('Failed to send emails');
      }
    }
    
    return response.json();
  },
};
