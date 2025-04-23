import { useState, useEffect } from 'react'
import { Outlet, Link } from 'react-router-dom'
import Header from '../components/Header'
import { Instagram, Linkedin, Twitter, Heart } from 'lucide-react'
import { apiGet } from '../lib/api'

const DEFAULT_SOCIAL_URLS = {
  instagram_url: 'https://instagram.com/quantummindsclub',
  linkedin_url: 'https://linkedin.com/company/quantummindssociety',
  twitter_url: 'https://twitter.com/QuantumMindsOnX'
}

const MainLayout = () => {
  const [socialUrls, setSocialUrls] = useState(DEFAULT_SOCIAL_URLS)
  const [loading, setLoading] = useState(true)
  const [socialFetchAttempted, setSocialFetchAttempted] = useState(false)

  useEffect(() => {
    if (socialFetchAttempted) return;
    
    const fetchSocialUrls = async () => {
      try {
        setSocialFetchAttempted(true)
        const response = await apiGet('/api/social')
        
        if (!response.ok) {
          if (response.status === 429) {
            console.warn('Rate limit hit for social URLs API, using defaults')
            return
          }
          throw new Error('Failed to fetch social URLs')
        }
        
        const data = await response.json()
        setSocialUrls(data)
      } catch (error) {
        console.error('Error fetching social URLs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSocialUrls()
  }, [socialFetchAttempted])

  return (
    <div className="flex min-h-screen flex-col main-layout">
      <Header />
      <main className="flex-1 container py-8 mb-0 pt-24">
        <Outlet />
      </main>
      <footer className="bg-background mt-16 border-t border-border">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-xl font-bold">Quantum Minds</h3>
              <p className="text-muted-foreground text-sm">
                Empowering minds to shape the future of technology through innovation, research, and collaboration.
              </p>
            </div>
            
            <div className="md:col-span-1 space-y-4">
              <h4 className="font-semibold">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-primary text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-primary text-sm">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/all" className="text-muted-foreground hover:text-primary text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-primary text-sm">
                    Contact
                  </Link>
                </li>                
              </ul>
            </div>
            
            <div className="md:col-span-1 space-y-4">
              <h4 className="font-semibold">Resources</h4>
              <ul className="space-y-2">
                {/* <li>
                  <Link to="/what-is-quantummindsclub" className="text-muted-foreground hover:text-primary text-sm">
                    What is quantummindsclub
                  </Link>
                </li> */}
                <li>
                  <a 
                    href="https://united.ac.in/public/ucer" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary text-sm"
                  >
                    United College of Engineering & Research
                  </a>
                </li> 
                <li>
                  <a 
                    href="https://github.com/rulercosta" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary text-sm"
                  >
                    About me
                  </a>
                </li>                            
              </ul>
            </div>
            
            <div className="md:col-span-1 space-y-4">
              <h4 className="font-semibold">Connect</h4>
              <div className="flex space-x-4">
                <a 
                  href={socialUrls.instagram_url || "https://instagram.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href={socialUrls.linkedin_url || "https://linkedin.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a 
                  href={socialUrls.twitter_url || "https://twitter.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Quantum Minds. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground flex items-center mt-4 md:mt-0">
              Made with <Heart className="h-3 w-3 mx-1 text-red-500" /> by CryptoKnights
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
