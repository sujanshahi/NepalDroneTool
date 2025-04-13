import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import { FlightPlanProvider } from "./context/FlightPlanContext";
import ProfilePage from "@/pages/profile-page";
import AircraftPage from "@/pages/aircraft-page";
import AuthPage from "@/pages/auth-page";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { Loader2 } from "lucide-react";

// Protected Route Component
function ProtectedRoute({ 
  component: Component,
  ...rest
}: { 
  component: React.ComponentType<any>;
  path: string;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component {...rest} />;
}

// Main Router
function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={HomePage} />
      <Route path="/profile">
        {(params) => <ProtectedRoute component={ProfilePage} path="/profile" />}
      </Route>
      <Route path="/aircraft">
        {(params) => <ProtectedRoute component={AircraftPage} path="/aircraft" />}
      </Route>
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
