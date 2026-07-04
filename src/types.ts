/**
 * Types and interfaces for the AgriConnect platform.
 */

export enum Language {
  ENGLISH = "en",
  KANNADA = "kn",
  HINDI = "hi",
  TELUGU = "te",
  TAMIL = "ta"
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  village: string;
  landSize: number; // in acres
  cropsGrown: string[];
  category: "General" | "OBC" | "SC" | "ST" | "Small Farmer" | "Marginal Farmer";
  preferredLanguage: Language;
  favoriteMarkets: string[];
  watchlistCrops: string[];
}

export type CropCategory = "Vegetables" | "Fruits" | "Cereals" | "Pulses";

export interface MarketPrice {
  id: string;
  cropName: string;
  category: CropCategory;
  market: string;
  district: string;
  date: string;
  minPrice: number; // per quintal (100 kg)
  maxPrice: number;
  modalPrice: number;
}

export type MLModelType = "Linear Regression" | "Random Forest" | "Decision Tree" | "AdaBoost";

export interface PredictionResult {
  day: string; // e.g. "Tomorrow", "Day 2", etc.
  date: string;
  predictedPrice: number;
  confidenceScore: number;
  model: MLModelType;
}

export interface PredictionPayload {
  cropName: string;
  market: string;
  currentPrice: number;
  predictions: PredictionResult[];
  trendDirection: "UP" | "DOWN" | "STABLE";
  recommendation: "SELL_NOW" | "HOLD" | "SELL_LATER";
  comparisonModels: {
    [key in MLModelType]: number; // predicted modal price for tomorrow by alternative models
  };
}

export interface GovScheme {
  id: string;
  name: string;
  benefits: string;
  eligibility: string;
  requiredDocuments: string[];
  applyLink: string;
  category: string;
  subsidyPercentage: number;
  minLandRequirement?: number; // acres
  maxLandRequirement?: number; // acres
  farmerCategories?: string[];
}

export interface GovSchemeRecommendation extends GovScheme {
  relevanceScore: number; // 0 to 100
  relevanceReason: string;
}

export interface EducationalGuide {
  id: string;
  title: string;
  description: string;
  category: "Organic Farming" | "Pest Control" | "Irrigation" | "Fertilizers" | "Crop Management" | "Smart Farming";
  type: "document" | "video2d" | "video3d";
  url: string; // link or video file reference
  duration?: string;
  author: string;
  fileSize?: string;
}

export interface WeatherData {
  temp: number;
  humidity: number;
  rainForecast: string; // percentage
  windSpeed: number;
  district: string;
  recommendations: string[];
  forecast7Days: {
    day: string;
    temp: number;
    icon: string;
    description: string;
  }[];
}

export interface SmartAlert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  level: "info" | "warning" | "success" | "danger";
  category: "price" | "weather" | "scheme" | "advisory";
}

export interface ForumPost {
  id: string;
  author: string;
  district: string;
  role: "Farmer" | "Agronomist" | "Admin";
  crop: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: {
    id: string;
    author: string;
    role: string;
    content: string;
    timestamp: string;
  }[];
}
