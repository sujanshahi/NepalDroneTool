import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import { FlightPlanProvider } from "./context/FlightPlanContext";
import ProfilePage from "@/pages/profile-page";
import AircraftPage from "@/pages/aircraft-page";
import { AuthProvider } from "./hooks/use-auth";

// Simplified routing - no authentication needed
function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/aircraft" component={AircraftPage} />
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
