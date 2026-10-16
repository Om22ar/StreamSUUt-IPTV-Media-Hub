import { Component, Output, EventEmitter, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MediaService } from '../../services/media.service';
import { AdManagerService } from '../../services/ad-manager.service';
import { PlaybackTarget } from '../../models/media.model';

@Component({
  selector: 'app-favorites-view',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 pb-24">
      <div class="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
        <h2 class="text-xl font-black text-white flex items-center gap-2">
          <mat-icon class="text-amber-400">star</mat-icon> Saved Favorite Items
        </h2>
        <p class="text-xs text-slate-400">Your bookmarked channels & media streams saved in local database</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (item of savedItems(); track item.id) {
          <div class="bg-slate-900/80 border border-white/10 hover:border-amber-400/40 rounded-2xl p-4 transition-all shadow-lg flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 truncate">
              <img [src]="item.poster" [alt]="item.title" class="w-12 h-12 rounded-xl object-cover bg-slate-800" />
              <div class="truncate">
                <h4 class="text-sm font-bold text-white truncate">{{ item.title }}</h4>
                <p class="text-xs text-slate-400">{{ item.subtitle }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                (click)="playSavedItem(item)"
                class="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              >
                <mat-icon class="text-base">play_arrow</mat-icon>
              </button>
              <button
                (click)="mediaService.toggleFavorite(item.id)"
                class="p-2.5 rounded-xl bg-slate-800 text-amber-400 hover:text-slate-400"
              >
                <mat-icon class="text-base">star</mat-icon>
              </button>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-16 text-center space-y-3 bg-slate-900/40 border border-white/5 rounded-3xl">
            <mat-icon class="text-5xl text-slate-600">star_outline</mat-icon>
            <h4 class="text-base font-bold text-slate-300">No Favorites Saved Yet</h4>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">
              Click the star icon on any channel or movie card to bookmark it for quick access here!
            </p>
          </div>
        }
      </div>
    </div>
  `
})
export class FavoritesViewComponent {
  @Output() playTarget = new EventEmitter<PlaybackTarget>();

  readonly mediaService = inject(MediaService);
  readonly adManager = inject(AdManagerService);

  readonly savedItems = computed(() => {
    const favs = this.mediaService.favoriteIds();
    const channels = this.mediaService.channels()
      .filter(c => favs.includes(c.id))
      .map(c => ({
        id: c.id,
        title: c.name,
        subtitle: `${c.group} • Live IPTV`,
        url: c.streamUrl,
        type: c.type,
        category: 'channel' as const,
        poster: c.logo
      }));

    const movies = this.mediaService.movies()
      .filter(m => favs.includes(m.id))
      .map(m => ({
        id: m.id,
        title: m.title,
        subtitle: `${m.year} Movie`,
        url: m.streamUrl,
        type: m.type,
        category: 'movie' as const,
        poster: m.poster
      }));

    return [...channels, ...movies];
  });

  playSavedItem(item: PlaybackTarget): void {
    this.adManager.requestPlaybackWithAd(item, () => {
      this.playTarget.emit(item);
    });
  }
}
