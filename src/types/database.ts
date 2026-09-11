export type Tier = "free" | "creator" | "pro" | "studio";

export type PostCategory =
  | "shorts"
  | "animation"
  | "narrative"
  | "music"
  | "educational"
  | "comedy"
  | "cultural";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  wallet_address: string | null;
  tier: Tier;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  credits?: number;
  balance_ngn?: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  category: PostCategory;
  is_ai_generated: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  earnings_ngn: number;
  created_at: string;
  updated_at: string;
  // joined
  profile?: Profile;
  liked_by_me?: boolean;
}

export interface Like {
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FeedCursor {
  created_at: string;
  id: string;
}

export interface CreatePostInput {
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds?: number;
  category?: PostCategory;
  is_ai_generated?: boolean;
}

export interface UpdateProfileInput {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  wallet_address?: string;
}
