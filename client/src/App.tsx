import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Sales from "@/pages/sales";
import HR from "@/pages/hr";
import Finance from "@/pages/finance";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [path, setLocation] = useLocation(); // Get current path from wouter

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && path !== "/login") { // Use wouter's path
        setLocation("/login"); // Redirect to login page if not authenticated and not already on login
      } else if (isAuthenticated && path === "/login") { // Use wouter's path
        setLocation("/"); // Redirect to dashboard if authenticated and on login page
      }
    }
  }, [isAuthenticated, isLoading, setLocation, path]); // Add path to dependencies

  if (isLoading) {
    return <div>Loading authentication...</div>; // Or a loading spinner
  }

  return (
    <Switch>
      <Route path="/login" component={Landing} /> {/* Use Landing as a login page */}
      {isAuthenticated ? (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/sales" component={Sales} />
          <Route path="/hr" component={HR} />
          <Route path="/finance" component={Finance} />
        </>
      ) : null}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
