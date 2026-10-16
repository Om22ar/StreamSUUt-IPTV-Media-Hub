import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Channel, Movie, AnimeSeries, PlaybackTarget } from '../models/media.model';
import { PwaOfflineService } from './pwa-offline.service';

const DEFAULT_CHANNELS: Channel[] = [
  {
    id: 'ch-1',
    name: 'NASA TV Live Stream',
    logo: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=300&q=80',
    group: 'Science & Tech',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    type: 'hls',
    isLive: true,
    language: 'English',
    country: 'USA',
    currentProgram: 'ISS Earth Orbit 4K Live Walk'
  },
  {
    id: 'ch-2',
    name: 'Red Bull Extreme Sports HD',
    logo: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=300&q=80',
    group: 'Sports',
    streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    type: 'hls',
    isLive: true,
    language: 'English',
    country: 'Global',
    currentProgram: 'X-Games Mountain Downhill Highlights'
  },
  {
    id: 'ch-3',
    name: 'Global News 24/7',
    logo: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=300&q=80',
    group: 'News',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/url_0/1920x1080-2500k/1920x1080-2500k_iphone.m3u8',
    type: 'hls',
    isLive: true,
    language: 'English',
    country: 'International',
    currentProgram: 'World Breaking News Dispatch'
  },
  {
    id: 'ch-4',
    name: 'Cinema Classic Channel',
    logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80',
    group: 'Entertainment',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'mp4',
    isLive: true,
    language: 'English',
    country: 'USA',
    currentProgram: 'Big Buck Bunny Animated Classic'
  },
  {
    id: 'ch-5',
    name: 'Anime & Cyber toon Stream',
    logo: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80',
    group: 'Anime',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    type: 'mp4',
    isLive: true,
    language: 'Japanese / Eng Sub',
    country: 'Japan',
    currentProgram: 'Cyber Fantasy Saga Live Broadcast'
  },
  {
    id: 'ch-6',
    name: 'Wild Nature 4K',
    logo: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=300&q=80',
    group: 'Documentary',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    type: 'mp4',
    isLive: true,
    language: 'English',
    country: 'UK',
    currentProgram: 'Secrets of the African Serengeti'
  }
];

const DEFAULT_MOVIES: Movie[] = [
  {
    id: 'm-1',
    title: 'Cyberpunk Vanguard 2088',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    year: 2025,
    rating: 8.9,
    genre: ['Sci-Fi', 'Action', 'Thriller'],
    duration: '2h 14m',
    description: 'In a rain-soaked neon metropolis, an upgraded rogue agent battles a syndicate controlling memory networks.',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    type: 'mp4'
  },
  {
    id: 'm-2',
    title: 'Echoes of the Cosmos',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    backdrop: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    year: 2024,
    rating: 9.2,
    genre: ['Sci-Fi', 'Adventure'],
    duration: '2h 38m',
    description: 'A deep-space expedition intercepts an ancient signal leading to an unmapped sector at the edge of space.',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'mp4'
  },
  {
    id: 'm-3',
    title: 'The Silent Kingdom',
    poster: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=600&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    year: 2023,
    rating: 8.5,
    genre: ['Fantasy', 'Drama'],
    duration: '1h 58m',
    description: 'When the ancient magic tree begins to wither, an orphaned warrior must journey across frozen tundras.',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    type: 'mp4'
  },
  {
    id: 'm-4',
    title: 'Sub-Zero Pursuit',
    poster: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    backdrop: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    year: 2024,
    rating: 7.9,
    genre: ['Action', 'Mystery'],
    duration: '1h 45m',
    description: 'A covert operative trapped in an arctic research facility uncovers a dangerous bioweapon experiment.',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    type: 'mp4'
  }
];

const DEFAULT_ANIME: AnimeSeries[] = [
  {
    id: 'a-1',
    title: 'Neo Tokyo Re-Genesis',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    backdrop: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
    genres: ['Cyberpunk', 'Mecha', 'Action'],
    rating: 9.4,
    status: 'Ongoing',
    episodesCount: 24,
    description: 'In the year 2099, pilot recruits synchronize with neural exo-suits to defend the megacity from rogue constructs.',
    episodes: [
      {
        id: 'ep-101',
        number: 1,
        title: 'Awakening of the Unit Zero',
        duration: '24m',
        thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'mp4'
      },
      {
        id: 'ep-102',
        number: 2,
        title: 'Neural Link Overdrive',
        duration: '23m',
        thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        type: 'mp4'
      },
      {
        id: 'ep-103',
        number: 3,
        title: 'Shadows over Sector 7',
        duration: '25m',
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        type: 'mp4'
      }
    ]
  },
  {
    id: 'a-2',
    title: 'Blade of the Astral Dragon',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    genres: ['Fantasy', 'Shonen', 'Martial Arts'],
    rating: 9.1,
    status: 'Completed',
    episodesCount: 12,
    description: 'A young swordsman unlocks the sealed spirit of an ancient dragon, embarking on a quest across seven elemental realms.',
    episodes: [
      {
        id: 'ep-201',
        number: 1,
        title: 'The Dragon Sealed in Flame',
        duration: '24m',
        thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        type: 'mp4'
      },
      {
        id: 'ep-202',
        number: 2,
        title: 'Trial of the Nine Temples',
        duration: '24m',
        thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        type: 'mp4'
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private http = inject(HttpClient);

  readonly channels = signal<Channel[]>(DEFAULT_CHANNELS);
  readonly movies = signal<Movie[]>(DEFAULT_MOVIES);
  readonly animeList = signal<AnimeSeries[]>(DEFAULT_ANIME);

  readonly activePlaybackTarget = signal<PlaybackTarget | null>(null);
  readonly favoriteIds = signal<string[]>(this.loadFavorites());
  readonly activeCategoryFilter = signal<string>('All');
  readonly searchQuery = signal<string>('');

  // Derived filtered channels
  readonly filteredChannels = computed(() => {
    let result = this.channels();
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.activeCategoryFilter();

    if (category !== 'All') {
      result = result.filter(c => c.group.toLowerCase() === category.toLowerCase());
    }
    if (query) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.group.toLowerCase().includes(query) ||
        (c.currentProgram && c.currentProgram.toLowerCase().includes(query))
      );
    }
    return result;
  });

  readonly channelCategories = computed(() => {
    const set = new Set<string>();
    this.channels().forEach(c => set.add(c.group));
    return ['All', ...Array.from(set)];
  });

  private platformId = inject(PLATFORM_ID);
  private pwaOffline = inject(PwaOfflineService);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.syncLocalData();
    }
  }

  private loadFavorites(): string[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('streamsuut_favorites');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  toggleFavorite(id: string): void {
    const current = this.favoriteIds();
    const next = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    this.favoriteIds.set(next);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('streamsuut_favorites', JSON.stringify(next));
    }
  }

  isFavorite(id: string): boolean {
    return this.favoriteIds().includes(id);
  }

  setPlaybackTarget(target: PlaybackTarget | null): void {
    this.activePlaybackTarget.set(target);
  }

  parseM3UContent(m3uText: string): Channel[] {
    const lines = m3uText.split(/\r?\n/);
    const parsedChannels: Channel[] = [];
    let currentChannel: Partial<Channel> = {};

    lines.forEach((line, idx) => {
      line = line.trim();
      if (line.startsWith('#EXTINF:')) {
        // Parse attributes
        const nameMatch = line.split(',').pop() || `Channel ${parsedChannels.length + 1}`;
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        const groupMatch = line.match(/group-title="([^"]+)"/);

        currentChannel = {
          id: `m3u-${Date.now()}-${idx}`,
          name: nameMatch.trim(),
          logo: logoMatch ? logoMatch[1] : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80',
          group: groupMatch ? groupMatch[1] : 'Custom IPTV',
          isLive: true,
          currentProgram: 'Live Stream'
        };
      } else if (line.startsWith('http://') || line.startsWith('https://')) {
        if (currentChannel.name) {
          const isHls = line.includes('.m3u8');
          parsedChannels.push({
            id: currentChannel.id || `m3u-${Date.now()}-${idx}`,
            name: currentChannel.name,
            logo: currentChannel.logo || '',
            group: currentChannel.group || 'Custom M3U',
            streamUrl: line,
            type: isHls ? 'hls' : 'mp4',
            isLive: true,
            currentProgram: currentChannel.currentProgram || 'Live Stream'
          });
          currentChannel = {};
        }
      }
    });

    if (parsedChannels.length > 0) {
      // Append or replace
      this.channels.update(existing => [...parsedChannels, ...existing]);
    }
    return parsedChannels;
  }

  addCustomChannel(newChannel: Omit<Channel, 'id'>): void {
    const channel: Channel = {
      ...newChannel,
      id: `custom-${Date.now()}`
    };
    this.channels.update(list => [channel, ...list]);
  }

  addCustomMovie(newMovie: Omit<Movie, 'id'>): void {
    const movie: Movie = {
      ...newMovie,
      id: `movie-${Date.now()}`
    };
    this.movies.update(list => [movie, ...list]);
  }

  private syncLocalData(): void {
    // First check if cached offline data exists
    const cached = this.pwaOffline.getCachedCatalog();
    if (cached.channels) this.channels.set(cached.channels);
    if (cached.movies) this.movies.set(cached.movies);
    if (cached.anime) this.animeList.set(cached.anime);

    // Save default initial catalog if empty cache
    this.pwaOffline.saveMediaCatalogToCache({
      channels: this.channels(),
      movies: this.movies(),
      anime: this.animeList()
    });

    // Optionally fetch updated catalog from backend API when online
    this.http.get<{ channels: Channel[]; movies: Movie[]; anime: AnimeSeries[] }>('/api/media/catalog')
      .subscribe({
        next: (data) => {
          if (data?.channels?.length) this.channels.set(data.channels);
          if (data?.movies?.length) this.movies.set(data.movies);
          if (data?.anime?.length) this.animeList.set(data.anime);

          this.pwaOffline.saveMediaCatalogToCache({
            channels: this.channels(),
            movies: this.movies(),
            anime: this.animeList()
          });
        },
        error: () => {
          // Retain current or offline cached data
        }
      });
  }
}
