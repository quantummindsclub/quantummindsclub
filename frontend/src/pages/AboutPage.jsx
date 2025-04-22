import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion"
import { Mail, Users, Calendar, Award, Book } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import TeamSection from '../components/TeamSection'

const AboutPage = () => {
  const faqItems = [
    {
      question: "What is Quantum Minds Club?",
      answer: "Quantum Minds is an exclusive community of technology enthusiasts, innovators, and professionals dedicated to advancing knowledge and collaboration in cutting-edge tech fields including space technology, defense systems, artificial intelligence, cybersecurity, and entrepreneurship."
    },
    {
      question: "How do I become a member?",
      answer: "Membership is currently by invitation or application. Prospective members should demonstrate passion for technology innovation, professional experience or academic background in related fields, and a commitment to collaborative learning. Applications are reviewed quarterly by our membership committee."
    },
    {
      question: "What benefits do members receive?",
      answer: "Members gain access to exclusive networking events, workshops led by industry experts, collaborative research opportunities, mentorship programs, and our proprietary knowledge base. They also receive priority registration for conferences and hackathons organized by the club."
    },
    {
      question: "How often does the club meet?",
      answer: "We host monthly virtual meetings for all members and quarterly in-person gatherings in major tech hubs. Additionally, special interest groups within the club organize their own meetings based on specific technology areas or projects."
    },
    {
      question: "Are there membership fees?",
      answer: "Yes, there is an annual membership fee that helps cover the operational costs of the club, including event organization, digital infrastructure, and research initiatives. Fee waivers are available for exceptional candidates with financial constraints."
    },
    {
      question: "Can organizations partner with Quantum Minds?",
      answer: "Absolutely! We welcome partnerships with technology companies, research institutions, and educational organizations. Partners can sponsor events, collaborate on research projects, or offer exclusive opportunities to our members."
    }
  ]

  return (
    <div className="space-y-16">
      <HeroSection 
        title="About Quantum Minds"
        subtitle="A forward-thinking community at the intersection of technology, innovation, and future-building"
        buttons={[
          { label: "Back to Home", href: "/", variant: "default", icon: "home" },
          { label: "Blog Articles", href: "/all", variant: "outline", icon: "blog" },
          { label: "Contact Us", href: "/contact", variant: "outline", icon: "mail" }
        ]}
        backgroundImage="https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        overlayOpacity={0.75}
      />

      <section className="bg-muted py-12 px-8 rounded-lg">
        <div className="max-w-4xl mx-auto">
        <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl">
              To cultivate a collaborative ecosystem where brilliant minds converge to solve complex technological challenges, 
              accelerate innovation, and shape the future of technology for the betterment of humanity.
            </p>
          </div>
        </div>
      </section>      
      <section className="bg-muted py-12 px-8 rounded-lg">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
            <p className="text-xl">
              To pioneer a future where cutting-edge technology empowers humanity, 
              bridges boundaries, and solves our most critical challenges through
              the combined brilliance of the world's most innovative minds.
            </p>
          </div>
        </div>
      </section>   

      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">What Makes Us Different</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center text-center p-6 border border-border rounded-lg">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Exclusive Community</h3>
            <p className="text-muted-foreground">
              A carefully curated network of innovators, researchers, engineers, and entrepreneurs united by a passion for cutting-edge technology.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 border border-border rounded-lg">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Specialized Events</h3>
            <p className="text-muted-foreground">
              Regular workshops, hackathons, and conferences focused on emerging technologies and innovative applications.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 border border-border rounded-lg">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Research Excellence</h3>
            <p className="text-muted-foreground">
              Collaborative research initiatives tackling complex problems in AI, space tech, cybersecurity, and beyond.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 border border-border rounded-lg">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Book className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Knowledge Sharing</h3>
            <p className="text-muted-foreground">
              Proprietary resources, mentorship programs, and education initiatives to accelerate learning and development.
            </p>
          </div>
        </div>
      </section>

      <section id="team" className="scroll-mt-20">
        <TeamSection 
          showLeadershipOnly={false}
          title="Meet Our Team"
          subtitle="The collective expertise of our members spans across cutting-edge fields including aerospace engineering, artificial intelligence, quantum computing, cybersecurity, and more."
        />
      </section>

      <section id="membership" className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Membership</h2>
        <p className="text-center text-lg text-muted-foreground max-w-3xl mx-auto">
          Quantum Minds membership is selective, focusing on individuals with demonstrated expertise, exceptional potential, 
          or innovative contributions to technology fields.
        </p>
        
        <div className="mt-8 text-center">
          <Button asChild size="lg">
            <Link to="/contact">
              Request Membership Info
            </Link>
          </Button>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="text-center space-y-6 py-10">
        <h2 className="text-3xl font-bold">Get in Touch</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have questions about Quantum Minds? Interested in membership or partnerships?
        </p>
        <Button asChild size="lg" variant="default">
          <Link to="/contact">
            <Mail className="mr-2 h-5 w-5" />
            Contact Us
          </Link>          
        </Button>
      </section>
    </div>
  )
}

export default AboutPage
