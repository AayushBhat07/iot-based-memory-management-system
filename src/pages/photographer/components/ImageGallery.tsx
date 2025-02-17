
import { ImageSlider } from "./ImageSlider";
import { PortfolioImage } from "../types/portfolio";

interface ImageGalleryProps {
  images: PortfolioImage[];
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  return (
    <div className="w-full">
      <div className="container mx-auto px-4 mt-[10vh]">
        <ImageSlider images={images} />
      </div>
    </div>
  );
};
