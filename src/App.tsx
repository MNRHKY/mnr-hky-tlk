
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ForumLayout } from "./components/forum/ForumLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ForumHome } from "./components/forum/ForumHome";
import { TopicView } from "./components/forum/TopicView";
import { CategoryView } from "./components/forum/CategoryView";
import { CreateTopic } from "./components/forum/CreateTopic";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Topics from "./pages/Topics";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/admin/AdminPage";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContent from "./pages/admin/AdminContent";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminSettings from "./pages/admin/AdminSettings";
import { GoogleAnalytics } from "./components/analytics/GoogleAnalytics";
import { HeaderCodeInjector } from "./components/analytics/HeaderCodeInjector";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <GoogleAnalytics />
        <HeaderCodeInjector />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Authentication routes - standalone pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin routes - wrapped in AdminLayout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminPage />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="moderation" element={<AdminModeration />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* Forum routes - wrapped in ForumLayout */}
            <Route path="/" element={<ForumLayout />}>
              <Route index element={<ForumHome />} />
              {/* New hierarchical URL structure */}
              <Route path=":categorySlug/:topicSlug" element={<TopicView />} />
              <Route path=":categorySlug/:subcategorySlug/:topicSlug" element={<TopicView />} />
              <Route path=":categorySlug" element={<CategoryView />} />
              <Route path=":categorySlug/:subcategorySlug" element={<CategoryView />} />
              {/* Legacy UUID-based redirects */}
              <Route path="topic/:topicId" element={<TopicView />} />
              <Route path="category/:categoryId" element={<CategoryView />} />
              <Route path="create" element={<CreateTopic />} />
              <Route path="topics" element={<Topics />} />
              <Route path="search" element={<Search />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
