
import { PortfolioHeader } from "./components/PortfolioHeader";
import { ImageGallery } from "./components/ImageGallery";
import { portfolioImages } from "./types/portfolio";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const PhotographerPortfolio = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <PortfolioHeader />
        <ImageGallery images={portfolioImages} />
      </div>
    </ProtectedRoute>
  );
};

export default PhotographerPortfolio;
