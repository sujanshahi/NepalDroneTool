import React from 'react';
import { useFlightPlan } from '@/context/FlightPlanContext';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import LanguageSwitch from '@/components/LanguageSwitch';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, LogOut, User as UserIcon, PlaneTakeoff, Home, Map, FileText, Info } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/auth');
      }
    });
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          {/* Logo */}
          <div 
            className="h-10 w-10 bg-[#003893] text-white flex items-center justify-center rounded mr-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M22 12H2M12 2v20M17 7l-5 5M7 7l5 5"></path>
            </svg>
          </div>
          <h1 
            className="font-heading font-bold text-xl text-gray-700 cursor-pointer"
            onClick={() => navigate('/')}
          >
            Nepal Drone Flight Planner
          </h1>
        </div>

        {/* Navigation Menu */}
        <nav className="hidden md:flex space-x-6">
          <Button 
            variant="ghost" 
            className="flex items-center gap-1"
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4" />
            Home
          </Button>

          <Button 
            variant="ghost" 
            className="flex items-center gap-1"
            onClick={() => navigate('/map')}
          >
            <Map className="w-4 h-4" />
            Map
          </Button>

          <Button 
            variant="ghost" 
            className="flex items-center gap-1"
            onClick={() => navigate('/map?basemap=satellite')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
              <path d="m15 4-4-2-4 2"></path>
              <path d="M4 11h16"></path>
              <path d="M9 15v2"></path>
              <path d="M15 15v2"></path>
            </svg>
            Satellite
          </Button>

          <Button 
            variant="ghost" 
            className="flex items-center gap-1"
            onClick={() => navigate('/map?basemap=terrain')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="m2 22 10-10 10 10"></path>
              <path d="m4 18 8-8 8 8"></path>
              <path d="m6 14 6-6 6 6"></path>
              <path d="m8 10 4-4 4 4"></path>
            </svg>
            Terrain
          </Button>

          <Button 
            variant="ghost" 
            className="flex items-center gap-1"
            onClick={() => navigate('/regulations')}
          >
            <FileText className="w-4 h-4" />
            Regulations
          </Button>

          <Button 
            variant="ghost" 
            className="flex items-center gap-1"
            onClick={() => navigate('/about')}
          >
            <Info className="w-4 h-4" />
            About
          </Button>
        </nav>
        
        {/* Right section: Language + Auth */}
        <div className="flex items-center gap-4">
          {/* Language switcher */}
          <LanguageSwitch />
          
          {/* Auth actions */}
          {!user ? (
            <Button onClick={() => navigate('/auth')} className="bg-[#003893]">
              Login / Register
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    {user.email && <p className="text-xs leading-none text-muted-foreground">{user.email}</p>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/my-aircraft')}>
                  <PlaneTakeoff className="mr-2 h-4 w-4" />
                  <span>My Aircraft</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
