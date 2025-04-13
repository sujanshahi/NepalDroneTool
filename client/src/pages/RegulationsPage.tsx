import React from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  FileText, 
  AlertTriangle, 
  Shield, 
  Download, 
  ExternalLink, 
  BookOpen,
  MapPin
} from 'lucide-react';

const RegulationsPage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003893] mb-2">Drone Regulations in Nepal</h1>
          <p className="text-gray-600 max-w-3xl">
            Understanding and complying with Nepal's drone regulations is essential for safe and legal flights.
            Below are the key regulations and guidelines for operating drones in Nepal.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3 mb-10">
          <Card className="shadow-md border-t-4 border-t-[#003893]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-[#003893]" />
                Official Documents
              </CardTitle>
              <CardDescription>Required permits and documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                All drone operations in Nepal require proper documentation and permits from the 
                Civil Aviation Authority of Nepal (CAAN).
              </p>
              <Button 
                variant="outline" 
                className="w-full text-[#003893] mb-2 border-[#003893]"
                onClick={() => window.open('https://caanepal.gov.np/en', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit CAAN Website
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-t-4 border-t-red-600">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
                Restricted Areas
              </CardTitle>
              <CardDescription>No-fly zones and restrictions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Drone operations are prohibited in many areas including airports, military zones, 
                government buildings, and certain cultural heritage sites.
              </p>
              <Button 
                onClick={() => navigate('/map')} 
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <MapPin className="h-4 w-4 mr-2" />
                View No-Fly Zones
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-t-4 border-t-green-600">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-green-600" />
                Best Practices
              </CardTitle>
              <CardDescription>Guidelines for safe operations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Follow safety guidelines including maintaining visual line of sight, respecting privacy,
                and operating during daylight hours in good weather conditions.
              </p>
              <Button 
                variant="outline" 
                className="w-full text-green-600 border-green-600"
                onClick={() => document.getElementById('safetyGuidelines')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Safety Guidelines
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold text-[#003893] mb-4">Key Regulations</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-gray-800 font-medium">
                Drone Registration Requirements
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <ul className="list-disc pl-5 space-y-2">
                  <li>All drones weighing more than 250g must be registered with CAAN</li>
                  <li>Registration requires proof of purchase, identification, and payment of registration fees</li>
                  <li>A unique registration number must be displayed on the drone</li>
                  <li>Registration must be renewed annually</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-gray-800 font-medium">
                Pilot Certification Requirements
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Drone pilots must obtain a Remote Pilot License for drones over 2kg</li>
                  <li>Must be at least 18 years old to apply for certification</li>
                  <li>Requires passing a knowledge test on regulations and safety procedures</li>
                  <li>Foreign pilots need to obtain temporary permission to operate drones in Nepal</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-gray-800 font-medium">
                Operational Limitations
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Maximum altitude: 400 feet (120 meters) above ground level</li>
                  <li>Drones must maintain a 5km distance from airports and heliports</li>
                  <li>Operations are allowed only during daylight hours</li>
                  <li>Drones must maintain visual line of sight at all times</li>
                  <li>No flying over crowds or public gatherings</li>
                  <li>Weather conditions must be suitable for safe operation</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-gray-800 font-medium">
                Special Permissions
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Commercial operations require special permission from CAAN</li>
                  <li>Photography or videography in restricted areas requires additional permits</li>
                  <li>Applications for special permissions must be submitted at least 15 days in advance</li>
                  <li>Operations in controlled airspace require coordination with air traffic control</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-gray-800 font-medium">
                Privacy and Security Considerations
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Prohibited from recording or photographing private property without consent</li>
                  <li>Cannot interfere with emergency response operations</li>
                  <li>Strict prohibition on carrying dangerous goods or weapons</li>
                  <li>Operators are responsible for any damages or injuries caused</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div id="safetyGuidelines" className="bg-white p-6 rounded-lg shadow-md mb-10">
          <h2 className="text-xl font-bold text-[#003893] mb-4">Safety Guidelines</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Before Flight</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Check weather conditions and forecasts</li>
                <li>Inspect drone for damage or wear</li>
                <li>Ensure batteries are fully charged</li>
                <li>Check for airspace restrictions</li>
                <li>Plan flight path and mission objectives</li>
                <li>Set up a safe takeoff and landing area</li>
                <li>Notify nearby people of your operation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">During Flight</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Maintain visual line of sight with your drone</li>
                <li>Monitor battery levels continuously</li>
                <li>Avoid flying over people or crowds</li>
                <li>Stay below 120 meters (400 feet)</li>
                <li>Give way to manned aircraft</li>
                <li>Be aware of changing weather conditions</li>
                <li>Respect privacy by avoiding filming private property</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-[#003893] text-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl font-bold mb-2">Download Complete Regulatory Documents</h2>
              <p className="max-w-2xl text-blue-100">
                Access the full regulatory framework for drone operations in Nepal, including all guidelines, 
                requirements, and procedures.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="mt-4 md:mt-0 text-white border-white hover:bg-blue-800"
              onClick={() => window.open('https://caanepal.gov.np/en/acts-and-regulations', '_blank')}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Regulations
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>The regulations presented here are for informational purposes only.</p>
          <p>Always refer to the latest official documents from CAAN for the most up-to-date regulations.</p>
        </div>
      </footer>
    </div>
  );
};

export default RegulationsPage;