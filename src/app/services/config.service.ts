import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { AppConfig } from '../models/media.model';

const DEFAULT_CONFIG: AppConfig = {
  id: 1,
  enable_channels: 1,
  enable_movies: 1,
  enable_anime: 1,
  enable_ads: 1,
  ad_skip_delay_seconds: 5,
  custom_m3u_url: 'https://iptv-org.github.io/iptv/index.m3u',
  app_title: 'StreamSUUt Media Hub',
  theme: 'dark',
  updated_at: new Date().toISOString()
};

const STORAGE_KEY = 'streamsuut_app_config_v1';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private http = inject(HttpClient);

  readonly config = signal<AppConfig>(this.loadInitialConfig());

  // Computed feature flags
  readonly channelsEnabled = computed(() => this.config().enable_channels === 1);
  readonly moviesEnabled = computed(() => this.config().enable_movies === 1);
  readonly animeEnabled = computed(() => this.config().enable_anime === 1);
  readonly adsEnabled = computed(() => this.config().enable_ads === 1);
  readonly adSkipDelay = computed(() => this.config().ad_skip_delay_seconds || 5);

  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.syncWithBackend();
    }
  }

  private loadInitialConfig(): AppConfig {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
        }
      } catch (e) {
        console.warn('Failed to parse stored config:', e);
      }
    }
    return DEFAULT_CONFIG;
  }

  private syncWithBackend(): void {
    this.http.get<AppConfig>('/api/config').subscribe({
      next: (serverConfig) => {
        if (serverConfig && typeof serverConfig === 'object') {
          this.updateLocalConfig(serverConfig);
        }
      },
      error: () => {
        // Fallback to local default if offline or SSR initialization
        this.saveConfig(this.config());
      }
    });
  }

  updateConfig(partial: Partial<AppConfig>): void {
    const updated = {
      ...this.config(),
      ...partial,
      updated_at: new Date().toISOString()
    };
    this.updateLocalConfig(updated);

    // Save to Express API as well
    this.http.post<AppConfig>('/api/config/update', updated).subscribe({
      next: (res) => {
        if (res) this.updateLocalConfig(res);
      },
      error: (err) => {
        console.warn('Backend sync failed, stored locally:', err);
      }
    });
  }

  toggleFlag(key: 'enable_channels' | 'enable_movies' | 'enable_anime' | 'enable_ads'): void {
    const currentVal = this.config()[key];
    const newVal = currentVal === 1 ? 0 : 1;
    this.updateConfig({ [key]: newVal });
  }

  resetDefaults(): void {
    this.updateConfig(DEFAULT_CONFIG);
  }

  private updateLocalConfig(newConfig: AppConfig): void {
    this.config.set(newConfig);
    this.saveConfig(newConfig);
  }

  private saveConfig(cfg: AppConfig): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
      } catch (e) {
        console.warn('Failed to save config to localStorage:', e);
      }
    }
  }
}
