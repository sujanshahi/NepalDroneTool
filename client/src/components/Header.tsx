import React from 'react';
import { useFlightPlan } from '@/context/FlightPlanContext';
import { LANGUAGES } from '@/lib/constants';

const Header: React.FC = () => {
  const { activeLanguage, setActiveLanguage } = useFlightPlan();

  const toggleLanguage = () => {
    setActiveLanguage(
      activeLanguage === LANGUAGES.ENGLISH ? 
      LANGUAGES.NEPALI : 
      LANGUAGES.ENGLISH
    );
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
        <div className="flex items-center bg-gray-200 rounded-md overflow-hidden">
          <div 
            className={`px-3 py-1 cursor-pointer text-sm ${activeLanguage === LANGUAGES.ENGLISH ? 'bg-[#003893] text-white' : ''}`}
            onClick={() => setActiveLanguage(LANGUAGES.ENGLISH)}
          >
            English
          </div>
          <div 
            className={`px-3 py-1 cursor-pointer text-sm ${activeLanguage === LANGUAGES.NEPALI ? 'bg-[#003893] text-white' : ''}`}
            onClick={() => setActiveLanguage(LANGUAGES.NEPALI)}
          >
            नेपाली
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
