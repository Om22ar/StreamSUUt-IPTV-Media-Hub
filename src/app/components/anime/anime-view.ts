import { Component, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MediaService } from '../../services/media.service';
import { AdManagerService } from '../../services/ad-manager.service';
import { AnimeSeries, AnimeEpisode, PlaybackTarget } from '../../models/media.model';

@Component({
  selector: 'app-anime-view',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 pb-24">

      <!-- Anime Header Banner -->
      <div class="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900/80 via-slate-900 to-indigo-950 p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div class="relative z-10 max-w-xl space-y-3">
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Cyberpunk & Fantasy Anime Hub
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white">
            Unlimited HD Anime Episodes
          </h2>
          <p class="text-xs sm:text-sm text-slate-300">
            Stream high-frame-rate subbed & dubbed anime series with instant ExoPlayer streaming.
          </p>
        </div>
      </div>

      <!-- Anime Series Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        @for (series of mediaService.animeList(); track series.id) {
          <div class="bg-slate-900/80 border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row gap-5">

            <!-- Series Poster -->
            <div class="relative aspect-[3/4] w-full md:w-44 rounded-2xl overflow-hidden bg-slate-950 shrink-0">
              <img [src]="series.poster" [alt]="series.title" class="w-full h-full object-cover" />
              <div class="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-slate-950/80 text-amber-400 text-xs font-bold flex items-center gap-1">
                <mat-icon class="text-xs">star</mat-icon> {{ series.rating }}
              </div>
            </div>

            <!-- Series Details & Episode List -->
            <div class="flex-1 space-y-3 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between gap-2">
                  <h3 class="text-lg font-bold text-white">{{ series.title }}</h3>
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {{ series.status }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 line-clamp-2 mt-1">{{ series.description }}</p>

                <div class="flex flex-wrap gap-1.5 mt-2">
                  @for (g of series.genres; track g) {
                    <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                      {{ g }}
                    </span>
                  }
                </div>
              </div>

              <!-- Episode List Selector -->
              <div class="space-y-2 pt-2 border-t border-white/5">
                <h4 class="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Episodes ({{ series.episodes.length }})</span>
                  <span class="text-[10px] text-slate-500">1080p MP4</span>
                </h4>

                <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  @for (ep of series.episodes; track ep.id) {
                    <button
                      (click)="playEpisode(series, ep)"
                      class="w-full p-2 rounded-xl bg-slate-950/60 hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/30 text-left flex items-center justify-between gap-2 transition-all group"
                    >
                      <div class="flex items-center gap-2.5 truncate">
                        <div class="w-7 h-7 rounded-lg bg-slate-800 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
                          E{{ ep.number }}
                        </div>
                        <span class="text-xs font-medium text-slate-200 group-hover:text-purple-300 truncate">
                          {{ ep.title }}
                        </span>
                      </div>

                      <div class="flex items-center gap-2 shrink-0">
                        <span class="text-[10px] text-slate-500 font-mono">{{ ep.duration }}</span>
                        <mat-icon class="text-base text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          play_circle
                        </mat-icon>
                      </div>
                    </button>
                  }
                </div>
              </div>

            </div>

          </div>
        }
      </div>

    </div>
  `
})
export class AnimeViewComponent {
  @Output() playTarget = new EventEmitter<PlaybackTarget>();

  readonly mediaService = inject(MediaService);
  readonly adManager = inject(AdManagerService);

  playEpisode(series: AnimeSeries, ep: AnimeEpisode): void {
    const target: PlaybackTarget = {
      id: ep.id,
      title: `${series.title} - Episode ${ep.number}`,
      subtitle: ep.title,
      url: ep.streamUrl,
      type: ep.type,
      category: 'anime',
      poster: ep.thumbnail
    };

    this.adManager.requestPlaybackWithAd(target, () => {
      this.playTarget.emit(target);
    });
  }
}
