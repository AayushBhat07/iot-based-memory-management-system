
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "./components/Header";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PhotographerUpload from "./pages/photographer/Upload";
import PhotographerPortfolio from "./pages/photographer/Portfolio";
import PhotographerEditProfile from "./pages/photographer/EditProfile";
import UserSearch from "./pages/user/Search";
import UserEditProfile from "./pages/user/EditProfile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" enableSystem>
      <TooltipProvider>
        <BrowserRouter>
          <div className="min-h-screen transition-colors duration-300 ease-in-out">
            <Header />
            <Toaster />
            <Sonner />
            <Routes>
              {/* Main Page */}
              <Route path="/" element={<Index />} />
              
              {/* Photographer Routes */}
              <Route path="/photographer/upload" element={
                <ProtectedRoute requiredRole="photographer">
                  <PhotographerUpload />
                </ProtectedRoute>
              } />
              <Route path="/photographer/portfolio" element={<PhotographerPortfolio />} />
              <Route path="/photographer/edit-profile" element={
                <ProtectedRoute requiredRole="photographer">
                  <PhotographerEditProfile />
                </ProtectedRoute>
              } />
              
              {/* User Routes */}
              <Route path="/user/search" element={
                <ProtectedRoute requiredRole="client">
                  <UserSearch />
                </ProtectedRoute>
              } />
              <Route path="/user/edit-profile" element={
                <ProtectedRoute requiredRole="client">
                  <UserEditProfile />
                </ProtectedRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
