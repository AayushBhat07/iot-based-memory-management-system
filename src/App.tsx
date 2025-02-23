
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import Header from "./components/Header";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PhotographerUpload = lazy(() => import("./pages/photographer/Upload"));
const PhotographerLogin = lazy(() => import("./pages/photographer/Login"));
const PhotographerDashboard = lazy(() => import("./pages/photographer/Dashboard"));
const PhotographerPortfolio = lazy(() => import("./pages/photographer/Portfolio"));
const PhotographerEditProfile = lazy(() => import("./pages/photographer/EditProfile"));
const UserSearch = lazy(() => import("./pages/user/Search"));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryProvider>
      <ThemeProvider defaultTheme="system" enableSystem>
        <TooltipProvider>
          <BrowserRouter>
            <div className="min-h-screen transition-colors duration-300 ease-in-out">
              <Header />
              <Toaster />
              <Sonner />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/photographer/upload" element={<PhotographerUpload />} />
                  <Route path="/photographer/login" element={<PhotographerLogin />} />
                  <Route path="/photographer/dashboard" element={<PhotographerDashboard />} />
                  <Route path="/photographer/portfolio" element={<PhotographerPortfolio />} />
                  <Route path="/photographer/edit-profile" element={<PhotographerEditProfile />} />
                  <Route path="/user" element={<UserSearch />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  </ErrorBoundary>
);

export default App;
