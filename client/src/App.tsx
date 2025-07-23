import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Threats from "@/pages/Threats";
import AuditLogs from "@/pages/AuditLogs";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login">
        <Layout>
          <Login />
        </Layout>
      </Route>
      
      {/* Protected routes */}
      <Route path="/">
        <Layout>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Layout>
      </Route>
      
      <Route path="/dashboard">
        <Layout>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Layout>
      </Route>
      
      <Route path="/threats">
        <Layout>
          <ProtectedRoute>
            <Threats />
          </ProtectedRoute>
        </Layout>
      </Route>
      
      <Route path="/logs">
        <Layout>
          <ProtectedRoute>
            <AuditLogs />
          </ProtectedRoute>
        </Layout>
      </Route>
      
      <Route path="/analytics">
        <Layout>
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        </Layout>
      </Route>
      
      <Route path="/settings">
        <Layout>
          <ProtectedRoute requiredRole="admin">
            <Settings />
          </ProtectedRoute>
        </Layout>
      </Route>
      
      {/* Fallback to 404 */}
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Toaster />
              <Router />
            </div>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
