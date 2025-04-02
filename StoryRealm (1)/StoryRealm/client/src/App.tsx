import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import GenrePage from "@/pages/genre-page";
import StoryPage from "@/pages/story-page";
import WriteStoryPage from "@/pages/write-story-page";
import AdminPage from "@/pages/admin-page";
import CommunityPage from "@/pages/community-page";
import RealStoriesPage from "@/pages/real-stories-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import CustomCursor from "@/components/ui/custom-cursor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/genre/:id" component={GenrePage} />
      <Route path="/story/:id" component={StoryPage} />
      <ProtectedRoute path="/write" component={WriteStoryPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/real-stories" component={RealStoriesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CustomCursor />
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
