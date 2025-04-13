import React from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  FileText, 
  User, 
  Plane, 
  Building, 
  Shield,
  ChevronRight
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [, navigate] = useLocation();

  const infoCards = [
    {
      title: "Nepal's Drone Zones",
      description: "Information about Nepal's drone restricted airspaces and special zones.",
      icon: <MapPin className="h-12 w-12 text-gray-300" />,
      link: "/zones"
    },
    {
      title: "Registration Requirements",
      description: "Learn what documentation you need in order to get your drone registered with CAA Nepal.",
      icon: <FileText className="h-12 w-12 text-gray-300" />,
      link: "/registration"
    },
    {
      title: "Drone Pilot Guide",
      description: "Essential guidelines for drone pilots in Nepal's unique terrain and challenging terrain.",
      icon: <User className="h-12 w-12 text-gray-300" />,
      link: "/pilot-guide"
    },
    {
      title: "Tourist Drone Information",
      description: "Important information for visitors bringing drones to Nepal for tourism photography.",
      icon: <Plane className="h-12 w-12 text-gray-300" />,
      link: "/tourist-info"
    },
    {
      title: "Commercial Drone Operations",
      description: "Requirements and procedures for using drones for business purposes in Nepal.",
      icon: <Building className="h-12 w-12 text-gray-300" />,
      link: "/commercial"
    },
    {
      title: "Drone Safety Guidelines",
      description: "Best practices for safe and responsible drone operation in Nepal's varied landscapes.",
      icon: <Shield className="h-12 w-12 text-gray-300" />,
      link: "/safety"
    }
  ];

  const faqs = [
    {
      question: "Do I need a license to fly a drone in Nepal?",
      answer: "Yes, you need to register your drone with the Civil Aviation Authority of Nepal (CAAN) and obtain a Remote Pilot License (RPL) for drones weighing more than 2kg. For lighter drones, registration is still required but licensing requirements may be different."
    },
    {
      question: "What areas in Nepal are restricted for drone flights?",
      answer: "Restricted areas include airports and their vicinity (5km radius), security-sensitive areas like military installations, government buildings, and national parks unless special permission is obtained. Use the interactive map tool to check specific locations."
    },
    {
      question: "What are the altitude restrictions for drone flights in Nepal?",
      answer: "Generally, drones must fly below 400 feet (120 meters) above ground level. In mountainous regions, this is measured from the take-off point. Special permission is required for higher altitude operations."
    },
    {
      question: "Can I bring my drone to Nepal as a tourist?",
      answer: "Yes, but you must declare your drone upon arrival and register it with CAAN. Some tourists may need to pay a temporary import fee. Always check the current regulations before traveling as they may change."
    },
    {
      question: "What happens if I fly my drone without proper registration in Nepal?",
      answer: "Flying an unregistered drone can result in confiscation of the equipment, fines, and potentially legal action. The penalties can be severe, especially if flying in restricted areas or creating security concerns."
    },
    {
      question: "How do I apply for special permission to fly in restricted areas?",
      answer: "Applications for special permissions must be submitted to CAAN at least 7 working days in advance. You'll need to provide flight details, purpose, drone specifications, and pilot information. Additional security clearances may be required for sensitive areas."
    },
    {
      question: "Are there special requirements for commercial drone operations in Nepal?",
      answer: "Yes, commercial operators need to register as a business entity with CAAN, obtain an Unmanned Aircraft Operator Certificate (UAOC), have certified remote pilots, and maintain liability insurance. Additional permits may be required depending on the nature of operations."
    },
    {
      question: "What weather conditions are unsafe for flying drones in Nepal?",
      answer: "Avoid flying in strong winds (generally above 20 knots), heavy rain, fog, snow, or during thunderstorms. In mountainous regions, be aware of rapidly changing weather conditions and unexpected wind patterns between valleys."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-[#0E294B] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Find out if you can fly your drone</h1>
            <p className="text-lg mb-8">
              Use this tool to help determine where you can fly your drone in Nepal according to the Civil
              Aviation Authority regulations.
            </p>
            <Button 
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white px-8"
              onClick={() => navigate('/')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>
      
      {/* Info Cards Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {infoCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">{card.title}</h3>
                <p className="text-gray-600 mb-4 text-center">{card.description}</p>
                <div className="text-center">
                  <Button 
                    variant="link" 
                    className="text-[#003893] inline-flex items-center"
                    onClick={() => navigate('/regulations')}
                  >
                    Learn more <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Map Preview Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Nepal Drone Flight Map</h2>
          <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">
            This interactive map shows where you can fly your drone in Nepal. Restricted areas are highlighted in red, and special permission zones are marked in yellow.
          </p>
          
          <div className="bg-gray-100 rounded-lg p-4 flex justify-center items-center h-64">
            <Button 
              className="bg-[#003893] hover:bg-blue-800"
              onClick={() => navigate('/map')}
            >
              Open Interactive Map
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 border border-green-500 rounded-sm mr-2"></div>
              <span className="text-sm">Allowed Flight Zones</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-500 rounded-sm mr-2"></div>
              <span className="text-sm">Special Permission Required</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-200 border border-red-500 rounded-sm mr-2"></div>
              <span className="text-sm">No-Fly Zones</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Provinces Section */}
      <section className="py-10 container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Nepal Provinces Drone Regulations</h2>
        <p className="text-gray-600 mb-8">
          Select a province to see specific drone regulations for that area:
        </p>
        
        <div className="mb-6">
          <select 
            className="border border-gray-300 rounded-md p-2 w-full max-w-md"
            onChange={(e) => {
              if (e.target.value) {
                // Navigate to province-specific regulations page
                navigate(`/regulations?province=${e.target.value}`);
              }
            }}
          >
            <option value="">Select a province</option>
            <option value="koshi">Koshi Province</option>
            <option value="madhesh">Madhesh Province</option>
            <option value="bagmati">Bagmati Province</option>
            <option value="gandaki">Gandaki Province</option>
            <option value="lumbini">Lumbini Province</option>
            <option value="karnali">Karnali Province</option>
            <option value="sudurpashchim">Sudurpashchim Province</option>
          </select>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-gray-50 p-4 rounded-lg">
                <summary className="list-none flex justify-between items-center cursor-pointer font-medium">
                  <span>{faq.question}</span>
                  <span className="transition group-open:rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </summary>
                <div className="mt-3 text-gray-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-[#0E294B] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Nepal Drone Tool</h3>
              <p className="text-sm text-gray-300">
                A resource to help drone pilots understand and comply with Nepal's drone regulations.
              </p>
              <div className="mt-4 flex space-x-3">
                <a href="#" className="text-white hover:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-white"
                    onClick={(e) => { e.preventDefault(); navigate('/'); }}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-white"
                    onClick={(e) => { e.preventDefault(); navigate('/my-aircraft'); }}
                  >
                    Register Your Drone
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-white"
                    onClick={(e) => { e.preventDefault(); navigate('/regulations'); }}
                  >
                    Regulations
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-white"
                    onClick={(e) => { e.preventDefault(); navigate('/map'); }}
                  >
                    Interactive Map
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-white"
                    onClick={(e) => { e.preventDefault(); navigate('/about'); }}
                  >
                    About
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://caanepal.gov.np" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Civil Aviation Authority of Nepal</a></li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-white"
                    onClick={(e) => { e.preventDefault(); navigate('/regulations'); }}
                  >
                    Drone Regulations Guide
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-white"
                    onClick={(e) => { e.preventDefault(); navigate('/map'); }}
                  >
                    Restricted Areas Map
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-white"
                    onClick={(e) => { e.preventDefault(); navigate('/about'); }}
                  >
                    About Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-gray-400 text-center">
            <p>This is an unofficial tool designed to assist drone pilots in Nepal. Always verify information with official sources.</p>
            <p className="mt-2">© 2025 Nepal Drone Tool. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;