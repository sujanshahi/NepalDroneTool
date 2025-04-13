import React from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Download, 
  BookOpen, 
  Shield, 
  Plane, 
  Camera,
  MapPin,
  Clock,
  Radio,
  Building, 
  FileText,
  ExternalLink,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';

const RegulationsPage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003893] mb-4">Nepal Drone Regulations</h1>
          <p className="text-gray-600 max-w-3xl">
            This page outlines key regulations for drone operations in Nepal. These guidelines are mandated by the 
            Civil Aviation Authority of Nepal (CAAN) and must be followed by all drone operators.
          </p>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
              <p className="text-sm text-yellow-700">
                Regulations may change over time. Always verify with official CAAN sources for the most up-to-date information.
                This guide is meant as a reference only.
              </p>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="general" className="mb-10">
          <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:grid-cols-4 mb-8">
            <TabsTrigger value="general">General Rules</TabsTrigger>
            <TabsTrigger value="categories">Drone Categories</TabsTrigger>
            <TabsTrigger value="permits">Permits & Licenses</TabsTrigger>
            <TabsTrigger value="zones">No-Fly Zones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-[#003893]" />
                    Flight Altitude Restrictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                      <p>Maximum altitude of 120 meters (400 feet) above ground level for all drone operations</p>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                      <p>Lower altitude limits apply near airports and heliports (5-10km radius depending on the facility)</p>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                      <p>Special permission required for operations above 120 meters</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-[#003893]" />
                    Operating Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                      <p>Drone flights permitted only during daylight hours (sunrise to sunset)</p>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                      <p>Night operations require special permission and additional lighting equipment</p>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                      <p>Flight operations should be avoided during adverse weather conditions</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Radio className="h-5 w-5 mr-2 text-[#003893]" />
                    Visual Line of Sight (VLOS)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                      <p>All drone operations must maintain visual line of sight at all times</p>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                      <p>Maximum VLOS distance typically 500 meters horizontally from the operator</p>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                      <p>Beyond Visual Line of Sight (BVLOS) operations require special authorization</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-[#003893]" />
                    Privacy & Photography
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                      <p>Respect privacy when flying over residential areas or private property</p>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                      <p>Aerial photography of sensitive locations (military, government buildings) is prohibited</p>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                      <p>Commercial filming and photography requires additional permits</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="categories">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-green-500">
                  <CardHeader>
                    <CardTitle>Micro Drones (≤250g)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Registration: Simple online registration required</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Pilot License: Not required for recreational use</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Flight Permissions: Can fly in most open zones without specific authorization</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Insurance: Optional but recommended</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-blue-500">
                  <CardHeader>
                    <CardTitle>Small Drones (251g-2kg)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Registration: Mandatory registration with CAAN</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Pilot License: Basic competency test required</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Flight Permissions: Requires notification for flights in controlled airspace</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Insurance: Recommended for all operations</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-orange-500">
                  <CardHeader>
                    <CardTitle>Medium Drones (2kg-25kg)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Registration: Full registration with technical documentation required</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Pilot License: Remote Pilot License (RPL) required</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Flight Permissions: Pre-approval needed for all flights</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Insurance: Mandatory liability insurance</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-red-500">
                  <CardHeader>
                    <CardTitle>Large Drones (&gt;25kg)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Registration: Comprehensive registration and airworthiness certification</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Pilot License: Advanced RPL with specific type ratings</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Flight Permissions: Comprehensive operation authorization required</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-2 mr-2 flex-shrink-0"></div>
                        <p>Insurance: Extensive liability coverage mandatory</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-[#003893]">Additional Requirements by Category</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="py-3 px-4 text-left">Requirement</th>
                        <th className="py-3 px-4 text-center">Micro</th>
                        <th className="py-3 px-4 text-center">Small</th>
                        <th className="py-3 px-4 text-center">Medium</th>
                        <th className="py-3 px-4 text-center">Large</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-3 px-4">Maintenance Records</td>
                        <td className="py-3 px-4 text-center">❌</td>
                        <td className="py-3 px-4 text-center">✓</td>
                        <td className="py-3 px-4 text-center">✓</td>
                        <td className="py-3 px-4 text-center">✓</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Flight Logs</td>
                        <td className="py-3 px-4 text-center">❌</td>
                        <td className="py-3 px-4 text-center">✓</td>
                        <td className="py-3 px-4 text-center">✓</td>
                        <td className="py-3 px-4 text-center">✓</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Operator ID on Drone</td>
                        <td className="py-3 px-4 text-center">✓</td>
                        <td className="py-3 px-4 text-center">✓</td>
                        <td className="py-3 px-4 text-center">✓</td>
                        <td className="py-3 px-4 text-center">✓</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Return-to-Home Function</td>
                        <td className="py-3 px-4 text-center">❌</td>
                        <td className="py-3 px-4 text-center">✓</td>
                        <td className="py-3 px-4 text-center">✓</td>
                        <td className="py-3 px-4 text-center">✓</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Geofencing Capability</td>
                        <td className="py-3 px-4 text-center">❌</td>
                        <td className="py-3 px-4 text-center">❌</td>
                        <td className="py-3 px-4 text-center">✓</td>
                        <td className="py-3 px-4 text-center">✓</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="permits">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-[#003893]" />
                      Drone Registration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-gray-600">All drones in Nepal must be registered with the Civil Aviation Authority of Nepal (CAAN) before operation.</p>
                    <p className="font-medium mb-2">Required Documents:</p>
                    <ul className="space-y-1 text-sm pl-1">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Completed application form</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Drone specifications (make, model, weight, serial number)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Valid identification (passport/citizenship card)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Proof of purchase or ownership</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Registration fee payment receipt</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => window.open("https://caanepal.gov.np", "_blank")}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      CAAN Registration Portal
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-[#003893]" />
                      Remote Pilot License (RPL)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-gray-600">Required for operating drones weighing more than 2kg or for any commercial drone operations.</p>
                    <p className="font-medium mb-2">Requirements:</p>
                    <ul className="space-y-1 text-sm pl-1">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Minimum 18 years of age</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Passing theoretical knowledge test</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Practical skills assessment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Medical fitness certificate</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Valid for 24 months (requires renewal)</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => window.open("https://caanepal.gov.np", "_blank")}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      RPL Application
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2 text-[#003893]" />
                      Commercial Operations Certificate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-gray-600">Required for any drone operations conducted for business or commercial purposes in Nepal.</p>
                    <p className="font-medium mb-2">Requirements:</p>
                    <ul className="space-y-1 text-sm pl-1">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Valid business registration in Nepal</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Registered drone(s) with CAAN</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Employed licensed remote pilots</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Operations manual and safety protocols</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Liability insurance coverage</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => window.open("https://caanepal.gov.np", "_blank")}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Commercial Application
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Plane className="h-5 w-5 mr-2 text-[#003893]" />
                      Tourist Drone Permit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-gray-600">For foreign visitors bringing drones to Nepal for personal use during their visit.</p>
                    <p className="font-medium mb-2">Process:</p>
                    <ul className="space-y-1 text-sm pl-1">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Apply at least 15 days before arrival</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Declare drone upon entry at customs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Pay temporary import fee</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Receive temporary operation permit</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Must take drone out when leaving Nepal</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => window.open("https://caanepal.gov.np", "_blank")}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Tourist Permit Information
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Camera className="h-5 w-5 mr-2 text-[#003893]" />
                      Aerial Photography/Filming Permit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-gray-600">Additional permit required for commercial photography/videography or filming in special areas.</p>
                    <p className="font-medium mb-2">Important Notes:</p>
                    <ul className="space-y-1 text-sm pl-1">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Required for all commercial filming/photography</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Additional permits needed for national parks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>May require Ministry of Information approval</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Permit fees vary based on scope and location</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003893] mt-1.5"></div>
                        <span>Process can take 7-30 days</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => window.open("https://caanepal.gov.np", "_blank")}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Photography Permit Details
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="zones">
            <div className="space-y-6">
              <p className="mb-4">
                The following areas in Nepal are either restricted for drone operations or require special permissions. 
                Always check the interactive map before planning your flights.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-red-500">
                  <CardHeader>
                    <CardTitle className="text-red-600">Restricted No-Fly Zones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-2 flex-shrink-0"></div>
                        <p><span className="font-medium">Airports:</span> 5km radius around all airports in Nepal including Tribhuvan International Airport</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-2 flex-shrink-0"></div>
                        <p><span className="font-medium">Military Installations:</span> All military bases, training facilities, and security installations</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-2 flex-shrink-0"></div>
                        <p><span className="font-medium">Government Facilities:</span> Singha Durbar, Royal Palace areas, and other sensitive government facilities</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-2 flex-shrink-0"></div>
                        <p><span className="font-medium">International Borders:</span> Within 5km of international borders with China and India</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-yellow-500">
                  <CardHeader>
                    <CardTitle className="text-yellow-600">Special Permission Zones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 mr-2 flex-shrink-0"></div>
                        <p><span className="font-medium">National Parks:</span> All national parks including Sagarmatha, Chitwan, and Langtang require special permits</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 mr-2 flex-shrink-0"></div>
                        <p><span className="font-medium">Cultural Sites:</span> UNESCO World Heritage Sites including Kathmandu Valley, Lumbini, and other cultural monuments</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 mr-2 flex-shrink-0"></div>
                        <p><span className="font-medium">City Centers:</span> High-density areas in major cities including Kathmandu, Pokhara, and Bharatpur</p>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 mr-2 flex-shrink-0"></div>
                        <p><span className="font-medium">Conservation Areas:</span> Annapurna, Manaslu, and Kanchenjunga conservation areas</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-[#003893]" />
                  Interactive Airspace Map
                </h3>
                <p className="mb-4">
                  Use our interactive map tool to check specific locations in Nepal and see detailed airspace restrictions.
                  The map shows all no-fly zones, restricted areas, and areas requiring special permissions.
                </p>
                <div className="flex justify-center">
                  <Button onClick={() => navigate('/map')} className="bg-[#003893] hover:bg-blue-800">
                    Open Interactive Map
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex flex-col md:flex-row gap-8 bg-[#003893] text-white p-8 rounded-lg mb-8">
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold mb-4">Download Regulations PDF</h2>
            <p className="mb-4">
              Get a comprehensive guide to Nepal's drone regulations including all requirements, forms, and detailed
              procedures for drone registration and operation.
            </p>
            <p className="text-sm text-blue-200">
              Last updated: April 2025 | Published by Civil Aviation Authority of Nepal
            </p>
          </div>
          <div className="md:w-1/3 flex items-center justify-center">
            <Button 
              className="bg-white text-[#003893] hover:bg-gray-100 min-w-[200px]"
              onClick={() => window.open("https://caanepal.gov.np", "_blank")}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#003893]">Need Help?</h2>
          <p className="mb-6">
            If you have questions about drone regulations or need assistance with your drone registration process, 
            please contact the Civil Aviation Authority of Nepal (CAAN).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <Building className="h-5 w-5 text-[#003893] mr-3 mt-1" />
              <div>
                <h3 className="font-medium">CAAN Office</h3>
                <p className="text-sm text-gray-600">Babarmahal, Kathmandu, Nepal</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-[#003893] mr-3 mt-1" />
              <div>
                <h3 className="font-medium">Phone</h3>
                <p className="text-sm text-gray-600">+977-1-4262387, 4262518</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-[#003893] mr-3 mt-1" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-sm text-gray-600">info@caanepal.gov.np</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Button variant="link" onClick={() => navigate('/map')} className="text-[#003893]">
            Explore Interactive Map <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Nepal Drone Flight Planner. All rights reserved.</p>
          <p>This information is provided as guidance. Always refer to CAAN for official regulations.</p>
        </div>
      </footer>
    </div>
  );
};

export default RegulationsPage;