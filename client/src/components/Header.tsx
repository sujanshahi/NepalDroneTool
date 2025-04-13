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
import { Loader2, LogOut, User as UserIcon, PlaneTakeoff } from 'lucide-react';

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
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          {/* Simplified Nepal CAA logo using an icon */}
          <div className="h-10 w-10 bg-[#003893] text-white flex items-center justify-center rounded mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M22 12H2M12 2v20M17 7l-5 5M7 7l5 5"></path>
            </svg>
          </div>
          <h1 className="font-heading font-bold text-xl text-gray-700">Nepal Drone Flight Planner</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Language switcher */}
          <LanguageSwitch />
          
          {/* Navigation menu */}
          <nav className="hidden md:flex space-x-4 mr-4">
            <Button variant="ghost" onClick={() => navigate('/')}>Home</Button>
            {user && (
              <>
                <Button variant="ghost" onClick={() => navigate('/aircraft')}>My Aircraft</Button>
                <Button variant="ghost" onClick={() => navigate('/profile')}>Profile</Button>
              </>
            )}
          </nav>
          
          {/* Login button for unauthenticated users */}
          {!user && (
            <Button 
              variant="default" 
              onClick={() => navigate('/auth')}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Login
            </Button>
          )}
          
          {/* User profile dropdown for authenticated users */}
          {user && (
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
                <DropdownMenuItem onClick={() => navigate('/aircraft')}>
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
