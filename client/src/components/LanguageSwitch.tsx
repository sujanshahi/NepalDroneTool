import React from 'react';
import { useFlightPlan } from '@/context/FlightPlanContext';
import { LANGUAGES } from '@/lib/constants';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageSwitch: React.FC = () => {
  const { activeLanguage, setActiveLanguage } = useFlightPlan();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 bg-white"
        >
          <Globe className="h-4 w-4" />
          <span>{LANGUAGES[activeLanguage as keyof typeof LANGUAGES]?.native || 'Language'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(LANGUAGES).map(([code, language]) => (
          <DropdownMenuItem 
            key={code}
            className={`flex items-center justify-between ${activeLanguage === code ? 'bg-muted' : ''}`}
            onClick={() => setActiveLanguage(code)}
          >
            <span>{language.native}</span>
            <span className="text-xs text-muted-foreground">{language.english}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitch;