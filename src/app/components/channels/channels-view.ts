import { Component, Output, EventEmitter, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MediaService } from '../../services/media.service';
import { AdManagerService } from '../../services/ad-manager.service';
import { Channel, PlaybackTarget } from '../../models/media.model';

@Component({
  selector: 'app-channels-view',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 pb-24">

      <!-- M3U Import & Search Bar Container -->
      <div class="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-black text-white flex items-center gap-2">
              <mat-icon class="text-emerald-400">live_tv</mat-icon> Live IPTV Channels
            </h2>
            <p class="text-xs text-slate-400">HLS Stream endpoints (.m3u8) & M3U Playlist parser engine</p>
          </div>

          <!-- M3U Playlist Parser Trigger Button -->
          <button
            (click)="showM3uModal.set(!showM3uModal())"
            class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <mat-icon class="text-base text-emerald-400">playlist_add</mat-icon>
            <span>Import M3U Playlist</span>
          </button>
        </div>

        <!-- Search Input & Filter Pills -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <mat-icon class="absolute left-3.5 top-3 text-slate-500 text-lg">search</mat-icon>
            <input
              type="text"
              placeholder="Search live channels, programs, categories..."
              [ngModel]="mediaService.searchQuery()"
              (ngModelChange)="mediaService.searchQuery.set($event)"
              class="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        <!-- Category Pills Bar -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          @for (cat of mediaService.channelCategories(); track cat) {
            <button
              (click)="mediaService.activeCategoryFilter.set(cat)"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200"
              [class.bg-emerald-500]="mediaService.activeCategoryFilter() === cat"
              [class.text-slate-950]="mediaService.activeCategoryFilter() === cat"
              [class.bg-slate-800/80]="mediaService.activeCategoryFilter() !== cat"
              [class.text-slate-300]="mediaService.activeCategoryFilter() !== cat"
              [class.hover:bg-slate-700]="mediaService.activeCategoryFilter() !== cat"
            >
              {{ cat }}
            </button>
          }
        </div>
      </div>

      <!-- M3U Parser Modal Overlay -->
      @if (showM3uModal()) {
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <mat-icon class="text-emerald-400">playlist_add_check</mat-icon> M3U Playlist Parser
              </h3>
              <button (click)="showM3uModal.set(false)" class="text-slate-400 hover:text-white">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <p class="text-xs text-slate-400">
              Paste raw M3U / M3U8 IPTV playlist text with <code>#EXTINF</code> declarations to dynamically load new channel feeds into your local database.
            </p>

            <textarea
              [ngModel]="m3uInputText()"
              (ngModelChange)="m3uInputText.set($event)"
              rows="6"
              placeholder="#EXTINF:-1 tvg-id=&quot;ch1&quot; tvg-logo=&quot;logo.png&quot; group-title=&quot;News&quot;, Global News Live&#10;https://example.com/stream.m3u8"
              class="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs font-mono text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            ></textarea>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                (click)="showM3uModal.set(false)"
                class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                (click)="parseM3U()"
                class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Parse & Load Channels
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Channel Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (ch of mediaService.filteredChannels(); track ch.id) {
          <div class="group bg-slate-900/70 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-4 transition-all duration-300 shadow-lg flex flex-col justify-between gap-4 relative overflow-hidden">

            <!-- Card Header -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <img
                  [src]="ch.logo"
                  [alt]="ch.name"
                  class="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-white/10 shadow-md group-hover:scale-105 transition-transform"
                />
                <div>
                  <h4 class="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {{ ch.name }}
                  </h4>
                  <p class="text-[11px] text-slate-400 font-medium truncate">
                    {{ ch.group }} • {{ ch.language || 'HD Stream' }}
                  </p>
                </div>
              </div>

              <button
                (click)="mediaService.toggleFavorite(ch.id); $event.stopPropagation()"
                class="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                [class.text-amber-400]="mediaService.isFavorite(ch.id)"
                [class.text-slate-600]="!mediaService.isFavorite(ch.id)"
              >
                <mat-icon class="text-lg">star</mat-icon>
              </button>
            </div>

            <!-- Current Program Info -->
            <div class="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 truncate">
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span class="text-[11px] text-slate-300 font-medium truncate">{{ ch.currentProgram || 'Live Stream Signal' }}</span>
              </div>
              <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {{ ch.type.toUpperCase() }}
              </span>
            </div>

            <!-- Card Play Action -->
            <button
              (click)="playChannel(ch)"
              class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 group-hover:from-emerald-500 group-hover:to-teal-500 text-emerald-300 group-hover:text-slate-950 font-bold text-xs border border-emerald-500/30 group-hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2 shadow-lg group-hover:shadow-emerald-500/20"
            >
              <mat-icon class="text-base">play_circle_filled</mat-icon> Watch Stream
            </button>

          </div>
        } @empty {
          <div class="col-span-full py-16 text-center space-y-3 bg-slate-900/40 border border-white/5 rounded-3xl">
            <mat-icon class="text-5xl text-slate-600">no_cell</mat-icon>
            <h4 class="text-base font-bold text-slate-300">No IPTV Channels Found</h4>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">
              Try modifying your search filter or import an M3U playlist feed.
            </p>
          </div>
        }
      </div>

    </div>
  `
})
export class ChannelsViewComponent {
  @Output() playTarget = new EventEmitter<PlaybackTarget>();

  readonly mediaService = inject(MediaService);
  readonly adManager = inject(AdManagerService);

  readonly showM3uModal = signal<boolean>(false);
  readonly m3uInputText = signal<string>('');

  playChannel(ch: Channel): void {
    const target: PlaybackTarget = {
      id: ch.id,
      title: ch.name,
      subtitle: ch.group,
      url: ch.streamUrl,
      type: ch.type,
      category: 'channel',
      poster: ch.logo
    };

    // Request playback with Interstitial Ad check
    this.adManager.requestPlaybackWithAd(target, () => {
      this.playTarget.emit(target);
    });
  }

  parseM3U(): void {
    const text = this.m3uInputText().trim();
    if (text) {
      this.mediaService.parseM3UContent(text);
      this.m3uInputText.set('');
      this.showM3uModal.set(false);
    }
  }
}
