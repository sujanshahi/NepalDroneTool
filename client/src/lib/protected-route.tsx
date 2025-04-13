import { Route } from "wouter";

// This is a modified version of ProtectedRoute that doesn't require authentication
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.FC | (() => React.JSX.Element);
}) {
  // Bypass authentication check and render the component directly
  return <Route path={path} component={Component} />;
}