import React from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { 
  Users, 
  Target, 
  Clipboard, 
  Phone, 
  Mail, 
  MapPin,
  PlaneTakeoff
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#003893] mb-2">About Nepal Drone Flight Planner</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            We're dedicated to simplifying drone operations in Nepal by providing accurate airspace information
            and helping operators comply with local regulations.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-[#003893]">
                <Target className="mr-2 h-5 w-5" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To promote safe and responsible drone operations in Nepal through accessible
                flight planning tools, accurate airspace information, and clear regulatory guidance.
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-[#003893]">
                <Clipboard className="mr-2 h-5 w-5" />
                What We Provide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mr-2"></div>
                  Interactive airspace maps
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mr-2"></div>
                  Regulatory compliance tools
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mr-2"></div>
                  Flight planning assistance
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mr-2"></div>
                  Drone registration management
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-[#003893]">
                <Users className="mr-2 h-5 w-5" />
                Who We Serve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mr-2"></div>
                  Professional drone pilots
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mr-2"></div>
                  Recreational flyers
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mr-2"></div>
                  Commercial operators
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mr-2"></div>
                  Government agencies
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mr-2"></div>
                  Tourism operators
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md mb-12">
          <h2 className="text-2xl font-bold text-[#003893] mb-6">How Our Platform Works</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#003893] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Map Airspace</h3>
              <p className="text-sm text-gray-600">
                Interactive maps display all airspace zones, restrictions, and special use areas across Nepal.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#003893] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <PlaneTakeoff className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Plan Flights</h3>
              <p className="text-sm text-gray-600">
                Create detailed flight plans with route planning, altitude specifications, and time estimates.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#003893] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <Clipboard className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Check Compliance</h3>
              <p className="text-sm text-gray-600">
                Automated assessment of your flight plan against relevant regulations and requirements.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#003893] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Get Approval</h3>
              <p className="text-sm text-gray-600">
                Submit required documentation and apply for necessary permits directly through our platform.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#003893] text-white p-8 rounded-lg shadow-md mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-4">Start Planning Your Flights Today</h2>
              <p className="text-blue-100 max-w-xl">
                Join thousands of drone pilots in Nepal who are using our platform to plan safe, 
                compliant, and successful flights across the country.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="text-white border-white hover:bg-blue-800"
                onClick={() => navigate('/map')}
              >
                Explore Map
              </Button>
              <Button 
                className="bg-white text-[#003893] hover:bg-gray-100"
                onClick={() => navigate('/auth')}
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-[#003893] mb-6">Contact Us</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-[#003893] rounded-full flex items-center justify-center mb-3">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Email</h3>
              <p className="text-gray-600">support@nepaldroneplanner.com</p>
              <p className="text-gray-500 text-sm">Responses within 24-48 hours</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-[#003893] rounded-full flex items-center justify-center mb-3">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Phone</h3>
              <p className="text-gray-600">+977 1 4XXXXXX</p>
              <p className="text-gray-500 text-sm">Monday-Friday, 9AM-5PM NPT</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-[#003893] rounded-full flex items-center justify-center mb-3">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Office</h3>
              <p className="text-gray-600">Thamel, Kathmandu, Nepal</p>
              <p className="text-gray-500 text-sm">Visits by appointment only</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Nepal Drone Flight Planner. All rights reserved.</p>
          <p>In collaboration with the Civil Aviation Authority of Nepal</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;