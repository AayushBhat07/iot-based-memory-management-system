
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
import PhotographerEditProfile from "./pages/photographer/EditProfile";
import UserOptions from "./pages/user/Options";
import FaceRecognition from "./pages/user/FaceRecognition";

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
            <Route path="/photographer/edit-profile" element={<PhotographerEditProfile />} />
            <Route path="/user" element={<UserOptions />} />
            <Route path="/user/face-recognition" element={<FaceRecognition />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
