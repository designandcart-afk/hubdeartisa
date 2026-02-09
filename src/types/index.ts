export interface Visualizer {
  id: string;
  name: string;
  title: string;
  location: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  experience: string;
  specialties: string[];
  languages?: string;
  bio: string;
  portfolio: PortfolioItem[];
  availability: 'available' | 'busy' | 'unavailable';
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  year: number;
}

export interface Project {
  id: string;
  visualizerId: string;
  clientId: string;
  title: string;
  description: string;
  status: 'brief-submitted' | 'quoted' | 'approved' | 'in-progress' | 'delivered' | 'completed';
  brief: ProjectBrief;
  quote?: ProjectQuote;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectBrief {
  description: string;
  requirements: string;
  deadline: Date;
  files: string[];
  budget?: number;
}

export interface ProjectQuote {
  amount: number;
  deliveryTime: string;
  revisions: number;
  notes: string;
  createdAt: Date;
}
