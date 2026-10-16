export interface AppConfig {
  id: number;
  enable_channels: number; // 0 or 1
  enable_movies: number;   // 0 or 1
  enable_anime: number;    // 0 or 1
  enable_ads: number;      // 0 or 1
  ad_skip_delay_seconds: number;
  custom_m3u_url: string;
  app_title: string;
  theme: 'dark' | 'glass-cyan' | 'purple-glow';
  updated_at: string;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  streamUrl: string;
  type: 'hls' | 'mp4';
  isLive: boolean;
  language?: string;
  country?: string;
  currentProgram?: string;
}

export interface Movie {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  year: number;
  rating: number;
  genre: string[];
  duration: string;
  description: string;
  streamUrl: string;
  type: 'hls' | 'mp4';
}

export interface AnimeEpisode {
  id: string;
  number: number;
  title: string;
  duration: string;
  thumbnail: string;
  streamUrl: string;
  type: 'hls' | 'mp4';
}

export interface AnimeSeries {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  genres: string[];
  rating: number;
  status: string;
  episodesCount: number;
  description: string;
  episodes: AnimeEpisode[];
}

export interface AdCampaign {
  id: string;
  title: string;
  brandName: string;
  description: string;
  callToAction: string;
  imageUrl: string;
  targetUrl: string;
  type: 'banner' | 'interstitial';
}

export interface PlaybackTarget {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  type: 'hls' | 'mp4';
  category: 'channel' | 'movie' | 'anime';
  poster?: string;
}
