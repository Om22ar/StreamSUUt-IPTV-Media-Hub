import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopHeaderComponent } from './components/nav/top-header';
import { BottomNavComponent, NavTab } from './components/nav/bottom-nav';
import { LocalCinemaComponent } from './components/local-cinema/local-cinema';
import { ChannelsViewComponent } from './components/channels/channels-view';
import { MoviesViewComponent } from './components/movies/movies-view';
import { AnimeViewComponent } from './components/anime/anime-view';
import { FavoritesViewComponent } from './components/favorites/favorites-view';
import { AdminConsoleComponent } from './components/admin/admin-console';
import { StreamPlayerComponent } from './components/player/stream-player';
import { AdInterstitialComponent } from './components/ad-interstitial/ad-interstitial';
import { AiAssistantComponent } from './components/ai-assistant/ai-assistant';
import { ConfigService } from './services/config.service';
import { PlaybackTarget } from './models/media.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TopHeaderComponent,
    BottomNavComponent,
    LocalCinemaComponent,
    ChannelsViewComponent,
    MoviesViewComponent,
    AnimeViewComponent,
    FavoritesViewComponent,
    AdminConsoleComponent,
    StreamPlayerComponent,
    AdInterstitialComponent,
    AiAssistantComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly configService = inject(ConfigService);

  readonly activeTab = signal<NavTab>('local');
  readonly activeTarget = signal<PlaybackTarget | null>(null);
  readonly showAiDrawer = signal<boolean>(false);

  constructor() {
    // Reactive effect: If active tab feature flag is disabled in local DB, auto-switch tab
    effect(() => {
      const current = this.activeTab();
      if (current === 'channels' && !this.configService.channelsEnabled()) {
        this.autoFallbackTab();
      } else if (current === 'movies' && !this.configService.moviesEnabled()) {
        this.autoFallbackTab();
      } else if (current === 'anime' && !this.configService.animeEnabled()) {
        this.autoFallbackTab();
      }
    });
  }

  onTabChange(tab: NavTab): void {
    this.activeTab.set(tab);
  }

  onPlayTarget(target: PlaybackTarget): void {
    this.activeTarget.set(target);
    // Smooth scroll to top where player is docked
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  closePlayer(): void {
    this.activeTarget.set(null);
  }

  private autoFallbackTab(): void {
    if (this.configService.channelsEnabled()) {
      this.activeTab.set('channels');
    } else if (this.configService.moviesEnabled()) {
      this.activeTab.set('movies');
    } else if (this.configService.animeEnabled()) {
      this.activeTab.set('anime');
    } else {
      this.activeTab.set('admin');
    }
  }
}
