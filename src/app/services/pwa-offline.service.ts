import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { Movie, Channel, AnimeSeries } from '../models/media.model';

export interface OfflineStorageStats {
  cachedMoviesCount: number;
  cachedChannelsCount: number;
  cachedAnimeCount: number;
  lastSyncedAt: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PwaOfflineService {
  private platformId = inject(PLATFORM_ID);
  private swUpdate = inject(SwUpdate, { optional: true });

  readonly isOnline = signal<boolean>(true);
  readonly isSwAvailable = signal<boolean>(false);
  readonly updateAvailable = signal<boolean>(false);
  readonly offlineStats = signal<OfflineStorageStats>({
    cachedMoviesCount: 0,
    cachedChannelsCount: 0,
    cachedAnimeCount: 0,
    lastSyncedAt: null
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.isOnline.set(navigator.onLine);

      window.addEventListener('online', () => {
        this.isOnline.set(true);
      });

      window.addEventListener('offline', () => {
        this.isOnline.set(false);
      });

      if (this.swUpdate?.isEnabled) {
        this.isSwAvailable.set(true);
        this.swUpdate.versionUpdates.subscribe(evt => {
          if (evt.type === 'VERSION_READY') {
            this.updateAvailable.set(true);
          }
        });
      }

      this.loadCacheStats();
    }
  }

  reloadAppToUpdate(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    }
  }

  saveMediaCatalogToCache(catalog: { movies?: Movie[]; channels?: Channel[]; anime?: AnimeSeries[] }): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      if (catalog.movies) {
        localStorage.setItem('streamsuut_offline_movies', JSON.stringify(catalog.movies));
      }
      if (catalog.channels) {
        localStorage.setItem('streamsuut_offline_channels', JSON.stringify(catalog.channels));
      }
      if (catalog.anime) {
        localStorage.setItem('streamsuut_offline_anime', JSON.stringify(catalog.anime));
      }
      const now = new Date().toISOString();
      localStorage.setItem('streamsuut_offline_last_sync', now);

      this.loadCacheStats();
    } catch (e) {
      console.warn('Failed to cache media catalog offline:', e);
    }
  }

  getCachedCatalog(): { movies: Movie[] | null; channels: Channel[] | null; anime: AnimeSeries[] | null } {
    if (!isPlatformBrowser(this.platformId)) {
      return { movies: null, channels: null, anime: null };
    }

    try {
      const m = localStorage.getItem('streamsuut_offline_movies');
      const c = localStorage.getItem('streamsuut_offline_channels');
      const a = localStorage.getItem('streamsuut_offline_anime');

      return {
        movies: m ? JSON.parse(m) : null,
        channels: c ? JSON.parse(c) : null,
        anime: a ? JSON.parse(a) : null
      };
    } catch {
      return { movies: null, channels: null, anime: null };
    }
  }

  loadCacheStats(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const catalog = this.getCachedCatalog();
    const lastSync = localStorage.getItem('streamsuut_offline_last_sync');

    this.offlineStats.set({
      cachedMoviesCount: catalog.movies ? catalog.movies.length : 0,
      cachedChannelsCount: catalog.channels ? catalog.channels.length : 0,
      cachedAnimeCount: catalog.anime ? catalog.anime.length : 0,
      lastSyncedAt: lastSync
    });
  }
}
