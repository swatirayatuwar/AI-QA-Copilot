import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { QAShell } from "@/components/qa-shell";
import { ActivityPage, AuthPage, CopilotPage, CoveragePage, DashboardPage, IntegrationsPage, ReportsPage, ResourcePage, ProjectsPage, SettingsPage } from "@/pages/workspace-pages";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();
  const authMode = location === "/sign-up" ? "sign-up" : location === "/forgot-password" ? "forgot" : location === "/sign-in" ? "sign-in" : null;
  return (
    <RoutedErrorBoundary>
      {authMode ? <AuthPage mode={authMode}/> : (
        <QAShell>
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/projects" component={ProjectsPage} />
            <Route path="/requirements"><ResourcePage kind="requirement"/></Route>
            <Route path="/test-design"><ResourcePage kind="scenario"/></Route>
            <Route path="/test-cases"><ResourcePage kind="testCase"/></Route>
            <Route path="/defects"><ResourcePage kind="defect"/></Route>
            <Route path="/coverage" component={CoveragePage} />
            <Route path="/reports" component={ReportsPage} />
            <Route path="/ai-copilot" component={CopilotPage} />
            <Route path="/integrations" component={IntegrationsPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/activity" component={ActivityPage} />
            <Route component={NotFound} />
          </Switch>
        </QAShell>
      )}
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
