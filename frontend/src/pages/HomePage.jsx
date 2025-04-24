import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../components/ui/use-toast'
import { Button } from '../components/ui/button'
import { ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { apiGet, galleryApi } from '../lib/api'
import HeroSection from '../components/HeroSection'
import TechCard from '../components/TechCard'
import RecentPosts from '../components/RecentPosts'
import TeamSection from '../components/TeamSection'
import ImageCarousel from '../components/ImageCarousel'
import { useQuery } from '@tanstack/react-query'
import { useMediaQuery } from '../lib/utils'
import { Spinner } from '../components/ui/spinner'

const HomePage = () => {
  const settings = {}; 

  const { data: featuredPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['featured-posts'],
    queryFn: async () => {
      const response = await apiGet('/api/pages?featured=true&limit=3');
      if (!response?.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
    staleTime: 1000 * 60 * 30,  
    cacheTime: 1000 * 60 * 60,  
  });

  const { data: recentPosts = [], isLoading: recentPostsLoading } = useQuery({
    queryKey: ['recent-posts'],
    queryFn: async () => {
      const response = await apiGet('/api/pages?type=blog&limit=3&include_comment_count=true');
      if (!response?.ok) throw new Error('Failed to fetch recent posts');
      return response.json();
    },
    staleTime: 1000 * 60 * 30,  
    cacheTime: 1000 * 60 * 60,  
  });


  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const { data: galleryImages = [], isLoading: isGalleryLoading } = useQuery({
    queryKey: ['gallery-featured-images'],
    queryFn: async () => {
      try {
        const images = await galleryApi.fetchGalleryImages(true); 
        return images.map(image => ({
          src: image.url,
          alt: image.title || 'Gallery image'
        }));
      } catch (error) {
        return visualJourneyImages;
      }
    },
    staleTime: 1000 * 60 * 30, 
    cacheTime: 1000 * 60 * 60, 
  });

  const techAreas = [
    {
      id: 1,
      title: 'Space Technology',
      headline: 'Exploring the Final Frontier',
      description: 'Pioneering research and development in propulsion, satellite technology, and space exploration systems.',
      icon: 'rocket'
    },
    {
      id: 2,
      title: 'Defense Technology',
      headline: 'Securing Our Future',
      description: 'Advancing cutting-edge defense systems and strategies to address complex security challenges.',
      icon: 'shield'
    },
    {
      id: 3,
      title: 'Artificial Intelligence',
      headline: 'Intelligent Solutions',
      description: 'Developing AI systems that enhance decision-making, automation, and data analysis capabilities.',
      icon: 'brain'
    },
    {
      id: 4,
      title: 'Cybersecurity',
      headline: 'Digital Defense Systems',
      description: 'Creating robust security protocols and technologies to protect critical digital infrastructure.',
      icon: 'lock'
    },
    {
      id: 5,
      title: 'Startups & Entrepreneurship',
      headline: 'Innovation Incubator',
      description: 'Fostering the next generation of tech startups and entrepreneurs through mentorship and resources.',
      icon: 'lightbulb'
    },
    {
      id: 6,
      title: 'Research & Development',
      headline: 'Pushing Boundaries',
      description: 'Conducting groundbreaking research to solve complex technical challenges across multiple domains.',
      icon: 'microscope'
    }
  ]

  const visualJourneyImages = [
    {
      src: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=700&q=80",
      alt: "Tech workshop"
    },
    {
      src: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      alt: "Team collaboration"
    },
    {
      src: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=700&q=80",
      alt: "AI development"
    },
    {
      src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=700&q=80",
      alt: "Space exploration"
    },
    {
      src: "https://images.unsplash.com/photo-1535378620166-273708d44e4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=700&q=80",
      alt: "Cybersecurity"
    }
  ]

  return (
    <div className="space-y-20">
      <HeroSection 
        title="Welcome to Quantum Minds"
        subtitle="Sky is the only limit"
        buttons={[
          { label: "About Us", href: "/about", icon: "info" },
          { label: "Our Blog", href: "/all", icon: "blog" },
          { label: "Get in touch", href: "/contact", icon: "mail" }
        ]}
        backgroundImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fHx8fHx8&auto=format&fit=crop&w=2072&q=80"
      />

      <section className="container">
        <h2 className="text-3xl font-bold mb-8 text-center">Areas of Focus</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {techAreas.map(area => (
            <TechCard 
              key={area.id}
              title={area.title}
              headline={area.headline}
              description={area.description}
              icon={area.icon}
            />
          ))}
        </div>
      </section>

      <TeamSection 
        showLeadershipOnly={true} 
        showViewAllButton={true} 
        title="Our Leadership"
        subtitle="Meet the visionaries guiding Quantum Minds' mission to advance humanity through technological innovation."
      />

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Latest Insights</h2>
          <Link to="/all" className="flex items-center text-primary hover:underline">
            View all posts
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {recentPostsLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : recentPosts.length > 0 ? (
          <RecentPosts posts={recentPosts} />
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>No blog posts found.</p>
          </div>
        )}
      </section>

      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Visual Journey</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A glimpse into our projects, events, and collaborative initiatives.
          </p>
        </div>
        
        {isGalleryLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : isMobile ? (
          <ImageCarousel images={galleryImages.length > 0 ? galleryImages : visualJourneyImages} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(galleryImages.length > 0 ? galleryImages : visualJourneyImages).slice(0, 8).map((image, index) => (
              <div key={index} className="relative aspect-square overflow-hidden">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="py-20 text-center bg-muted rounded-lg">
        <h2 className="text-3xl font-bold tracking-tight">Join Quantum Minds</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Be part of a community dedicated to innovation, learning, and technological advancement.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link to="/about#membership">Learn About Membership</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

export default HomePage
