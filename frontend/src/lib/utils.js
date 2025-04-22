/**
 * Utility functions for the application
 */
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useState, useEffect } from "react"

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a more readable format
 */
export function formatDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return dateString
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

/**
 * Truncate text to a certain length
 */
export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Custom hook for responsive design - returns boolean indicating if media query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    
    setMatches(mediaQuery.matches)
    
    const handleResize = (event) => setMatches(event.matches)
    mediaQuery.addEventListener('change', handleResize)
    
    return () => mediaQuery.removeEventListener('change', handleResize)
  }, [query])

  return matches
}
