import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ConfigService } from '../../services/config.service';

export type NavTab = 'local' | 'channels' | 'movies' | 'anime' | 'favorites' | 'admin';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Floating Glassmorphism Bottom Navigation Bar -->
    <nav class="fixed bottom-4 inset-x-3 max-w-2xl mx-auto z-40">
      <div class="p-1.5 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/80 flex items-center justify-around gap-1">

        <!-- Local Cinema Tab -->
        <button
          (click)="selectTab('local')"
          class="flex-1 py-2 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group"
          [class.bg-indigo-500/20]="activeTab === 'local'"
          [class.text-indigo-400]="activeTab === 'local'"
          [class.text-slate-400]="activeTab !== 'local'"
          [class.hover:text-slate-200]="activeTab !== 'local'"
        >
          @if (activeTab === 'local') {
            <span class="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          }
          <mat-icon class="text-xl">folder_open</mat-icon>
          <span class="text-[10px] font-bold tracking-tight">المحلي • Cinema</span>
        </button>

        <!-- IPTV Channels Tab -->
        @if (configService.channelsEnabled()) {
          <button
            (click)="selectTab('channels')"
            class="flex-1 py-2 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group"
            [class.bg-emerald-500/20]="activeTab === 'channels'"
            [class.text-emerald-400]="activeTab === 'channels'"
            [class.text-slate-400]="activeTab !== 'channels'"
            [class.hover:text-slate-200]="activeTab !== 'channels'"
          >
            @if (activeTab === 'channels') {
              <span class="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            }
            <mat-icon class="text-xl">live_tv</mat-icon>
            <span class="text-[11px] font-bold tracking-tight">Channels</span>
          </button>
        }

        <!-- Movies Tab -->
        @if (configService.moviesEnabled()) {
          <button
            (click)="selectTab('movies')"
            class="flex-1 py-2 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group"
            [class.bg-emerald-500/20]="activeTab === 'movies'"
            [class.text-emerald-400]="activeTab === 'movies'"
            [class.text-slate-400]="activeTab !== 'movies'"
            [class.hover:text-slate-200]="activeTab !== 'movies'"
          >
            <mat-icon class="text-xl">movie</mat-icon>
            <span class="text-[11px] font-bold tracking-tight">Movies</span>
          </button>
        }

        <!-- Anime Tab -->
        @if (configService.animeEnabled()) {
          <button
            (click)="selectTab('anime')"
            class="flex-1 py-2 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group"
            [class.bg-emerald-500/20]="activeTab === 'anime'"
            [class.text-emerald-400]="activeTab === 'anime'"
            [class.text-slate-400]="activeTab !== 'anime'"
            [class.hover:text-slate-200]="activeTab !== 'anime'"
          >
            <mat-icon class="text-xl">psychology</mat-icon>
            <span class="text-[11px] font-bold tracking-tight">Anime</span>
          </button>
        }

        <!-- Favorites Tab -->
        <button
          (click)="selectTab('favorites')"
          class="flex-1 py-2 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group"
          [class.bg-emerald-500/20]="activeTab === 'favorites'"
          [class.text-emerald-400]="activeTab === 'favorites'"
          [class.text-slate-400]="activeTab !== 'favorites'"
          [class.hover:text-slate-200]="activeTab !== 'favorites'"
        >
          <mat-icon class="text-xl">star</mat-icon>
          <span class="text-[11px] font-bold tracking-tight">Saved</span>
        </button>

        <!-- Dynamic DB Console / Settings Tab -->
        <button
          (click)="selectTab('admin')"
          class="flex-1 py-2 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group"
          [class.bg-purple-500/20]="activeTab === 'admin'"
          [class.text-purple-400]="activeTab === 'admin'"
          [class.text-slate-400]="activeTab !== 'admin'"
          [class.hover:text-slate-200]="activeTab !== 'admin'"
        >
          <mat-icon class="text-xl">settings_suggest</mat-icon>
          <span class="text-[11px] font-bold tracking-tight">DB Config</span>
        </button>

      </div>
    </nav>
  `
})
export class BottomNavComponent {
  @Input() activeTab: NavTab = 'channels';
  @Output() tabChange = new EventEmitter<NavTab>();

  readonly configService = inject(ConfigService);

  selectTab(tab: NavTab): void {
    this.tabChange.emit(tab);
  }
}
