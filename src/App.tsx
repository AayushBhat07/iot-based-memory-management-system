
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PhotographerUpload from "./pages/photographer/Upload";
import PhotographerLogin from "./pages/photographer/Login";
import PhotographerOptions from "./pages/photographer/Options";
import PhotographerEvents from "./pages/photographer/Events";
import ReferenceUpload from "./pages/user/ReferenceUpload";
import UploadSuccess from "./pages/user/UploadSuccess";
import Search from "./pages/user/Search";
import UserOptions from "./pages/user/Options";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/photographer/login" element={<PhotographerLogin />} />
          <Route path="/photographer/options" element={<PhotographerOptions />} />
          <Route path="/photographer/events" element={<PhotographerEvents />} />
          <Route path="/photographer/upload/:eventId" element={<PhotographerUpload />} />
          <Route path="/user" element={<UserOptions />} />
          <Route path="/user/reference-upload" element={<ReferenceUpload />} />
          <Route path="/user/upload-success" element={<UploadSuccess />} />
          <Route path="/user/search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
