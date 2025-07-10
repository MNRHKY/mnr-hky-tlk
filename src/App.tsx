
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "./components/auth/AuthProvider";
import { MetadataProvider } from "./components/seo/MetadataProvider";
import { ScrollToTop } from "./components/ScrollToTop";
import { OnlineUsersProvider } from "./contexts/OnlineUsersContext";
import { ForumLayout } from "./components/forum/ForumLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { RedirectHandler } from "./components/RedirectHandler";
import { ForumHome } from "./components/forum/ForumHome";
import { TopicView } from "./components/forum/TopicView";
import { CategoryView } from "./components/forum/CategoryView";
import { CreateTopic } from "./components/forum/CreateTopic";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Blog from "./pages/Blog";
import Topics from "./pages/Topics";
import { Categories } from "./pages/Categories";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/admin/AdminPage";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContent from "./pages/admin/AdminContent";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminSpam from "./pages/admin/AdminSpam";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSEO from "./pages/admin/AdminSEO";

import { AnalyticsProvider } from "./components/analytics/AnalyticsProvider";
import { HeaderCodeInjector } from "./components/analytics/HeaderCodeInjector";
import { CookieConsent } from "./components/cookies/CookieConsent";
import { CookieDebugPanel } from "./components/cookies/CookieDebugPanel";
import { MaintenanceWrapper } from "./components/MaintenanceWrapper";
import { StickyBanner } from "./components/StickyBanner";
import { AdsTxt } from "./pages/AdsTxt";
import { IPTrackingWrapper } from "./components/IPTrackingWrapper";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <AuthProvider>
          <OnlineUsersProvider>
            <StickyBanner />
            <HeaderCodeInjector />
            <CookieConsent />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnalyticsProvider>
                <IPTrackingWrapper>
                  <CookieDebugPanel />
                  <ScrollToTop />
                  <MetadataProvider>
                  <MaintenanceWrapper>
                <Routes>
                  {/* Special routes */}
                  <Route path="/ads.txt" element={<AdsTxt />} />
                  
                  {/* Authentication routes - standalone pages */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Admin routes - wrapped in AdminLayout */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminPage />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="content" element={<AdminContent />} />
                    <Route path="moderation" element={<AdminModeration />} />
                    <Route path="spam" element={<AdminSpam />} />
                    <Route path="seo" element={<AdminSEO />} />
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
                    <Route path="categories" element={<Categories />} />
                    <Route path="search" element={<Search />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="terms" element={<Terms />} />
                    <Route path="privacy" element={<Privacy />} />
                    <Route path="blog" element={<Blog />} />
                  </Route>
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                  </Routes>
                  </MaintenanceWrapper>
                </MetadataProvider>
                </IPTrackingWrapper>
              </AnalyticsProvider>
            </BrowserRouter>
          </OnlineUsersProvider>
        </AuthProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
