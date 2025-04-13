import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import AircraftPage from "@/pages/aircraft-page";
import LandingPage from "@/pages/LandingPage";
import RegulationsPage from "@/pages/RegulationsPage";
import AboutPage from "@/pages/AboutPage";
import FlightPlansPage from "@/pages/flight-plans-page";
import FlightPlanNewPage from "@/pages/flight-plan-new-page";
import FlightPlanEditPage from "@/pages/flight-plan-edit-page";
import FlightLogsPage from "@/pages/flight-logs-page";
import FlightLogNewPage from "@/pages/flight-log-new-page";
import FlightLogViewPage from "@/pages/flight-log-view-page";
import FlightLogEditPage from "@/pages/flight-log-edit-page";
import { FlightPlanProvider } from "./context/FlightPlanContext";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <ProtectedRoute path="/map" component={HomePage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/my-aircraft" component={AircraftPage} />
      
      {/* Flight Plan Routes */}
      <ProtectedRoute path="/flight-plans" component={FlightPlansPage} />
      <ProtectedRoute path="/flight-plans/new" component={FlightPlanNewPage} />
      <ProtectedRoute path="/flight-plans/:id" component={FlightPlanEditPage} />
      
      {/* Flight Log Routes */}
      <ProtectedRoute path="/flight-logs/new" component={FlightLogNewPage} />
      <ProtectedRoute path="/flight-logs/:id/edit" component={FlightLogEditPage} />
      <ProtectedRoute path="/flight-logs/:id" component={FlightLogViewPage} />
      <ProtectedRoute path="/flight-logs" component={FlightLogsPage} />
      
      <Route path="/auth" component={AuthPage} />
      <Route path="/regulations" component={RegulationsPage} />
      <Route path="/about" component={AboutPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FlightPlanProvider>
          <Router />
          <Toaster />
        </FlightPlanProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
