
export interface PortfolioImage {
  id: number;
  src: string;
  title: string;
  eventType: string;
  year: string;
}

export const portfolioImages: PortfolioImage[] = [
  {
    id: 1,
    src: "/lovable-uploads/b3dd945a-f7df-4a81-bd9d-19d132947b57.png",
    title: "Shared Moments",
    eventType: "Group Photography",
    year: "2024"
  },
  {
    id: 2,
    src: "/lovable-uploads/164ef29d-349f-4ec8-8a6e-ec6329c0cddb.png",
    title: "West 36th Street",
    eventType: "Urban",
    year: "2024"
  },
  {
    id: 3,
    src: "/lovable-uploads/600052b9-b242-4a4b-8540-053d56ac376f.png",
    title: "Vintage Corner",
    eventType: "Interior",
    year: "2024"
  },
  {
    id: 4,
    src: "/lovable-uploads/71afab7e-446f-4770-ae2c-232771530e52.png",
    title: "Elegant Banquet Hall",
    eventType: "Architecture",
    year: "2024"
  },
  {
    id: 5,
    src: "/lovable-uploads/fc597b57-84b6-4ee5-bfd1-7fb86aceed7c.png",
    title: "Mountain Mist",
    eventType: "Landscape",
    year: "2024"
  }
];
