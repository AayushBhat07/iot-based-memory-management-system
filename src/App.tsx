
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PhotographerUpload from "./pages/photographer/Upload";
import PhotographerLogin from "./pages/photographer/Login";
import PhotographerDashboard from "./pages/photographer/Dashboard";
import PhotographerPortfolio from "./pages/photographer/Portfolio";
import ReferenceUpload from "./pages/user/ReferenceUpload";
import Search from "./pages/user/Search";
import UserOptions from "./pages/user/Options";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" enableSystem>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/photographer/upload" element={<PhotographerUpload />} />
            <Route path="/photographer/login" element={<PhotographerLogin />} />
            <Route path="/photographer/dashboard" element={<PhotographerDashboard />} />
            <Route path="/photographer/portfolio" element={<PhotographerPortfolio />} />
            <Route path="/user" element={<UserOptions />} />
            <Route path="/user/reference-upload" element={<ReferenceUpload />} />
            <Route path="/user/search" element={<Search />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
