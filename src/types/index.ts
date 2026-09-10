export type VideoCategory =
  | "shorts"
  | "animation"
  | "narrative"
  | "music"
  | "educational"
  | "comedy"
  | "cultural";

export interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified: boolean;
  tier: "free" | "creator" | "pro" | "studio";
  followers: number;
  bio?: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number; // seconds
  views: number;
  likes: number;
  comments: number;
  earnings: number; // in NGN
  category: VideoCategory;
  creator: Creator;
  createdAt: string;
  isAIGenerated: boolean;
  tags?: string[];
}

export interface CreditPack {
  id: string;
  credits: number;
  priceNgn: number;
  priceUsdc?: number;
  label: string;
  popular?: boolean;
}

export interface UserWallet {
  address?: string;
  credits: number;
  balanceNgn: number;
  balanceUsdc: number;
  totalEarned: number;
}
