import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import AircraftPage from "@/pages/aircraft-page";
import { FlightPlanProvider } from "./context/FlightPlanContext";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/my-aircraft" component={AircraftPage} />
      <Route path="/auth" component={AuthPage} />
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
