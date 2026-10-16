import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ConfigService } from '../../services/config.service';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'app-admin-console',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 pb-24">

      <!-- Title & Banner -->
      <div class="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <mat-icon class="text-2xl">storage</mat-icon>
            </div>
            <div>
              <h2 class="text-xl font-black text-white">Dynamic Local Database & Feature Manager</h2>
              <p class="text-xs text-slate-400">Configure app database flags <code>enable_channels</code>, <code>enable_movies</code>, <code>enable_anime</code> (0 / 1)</p>
            </div>
          </div>

          <button
            (click)="configService.resetDefaults()"
            class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/10"
          >
            <mat-icon class="text-sm">restart_alt</mat-icon> Reset DB
          </button>
        </div>
      </div>

      <!-- Feature Toggles Grid (0 / 1) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

        <!-- Channels Toggle -->
        <div class="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-slate-400">enable_channels</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
              [class.bg-emerald-500/20]="configService.channelsEnabled()"
              [class.text-emerald-400]="configService.channelsEnabled()"
              [class.bg-rose-500/20]="!configService.channelsEnabled()"
              [class.text-rose-400]="!configService.channelsEnabled()"
            >
              VALUE: {{ configService.config().enable_channels }}
            </span>
          </div>
          <div>
            <h4 class="text-sm font-bold text-white">Live IPTV Channels Tab</h4>
            <p class="text-xs text-slate-400 mt-0.5">Show or hide the live channel tab in the bottom navigation bar dynamically.</p>
          </div>
          <button
            (click)="configService.toggleFlag('enable_channels')"
            class="w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
            [class.bg-emerald-500]="configService.channelsEnabled()"
            [class.text-slate-950]="configService.channelsEnabled()"
            [class.bg-slate-800]="!configService.channelsEnabled()"
            [class.text-slate-300]="!configService.channelsEnabled()"
          >
            <mat-icon class="text-base">{{ configService.channelsEnabled() ? 'visibility' : 'visibility_off' }}</mat-icon>
            {{ configService.channelsEnabled() ? 'ENABLED (1) - Click to Hide' : 'DISABLED (0) - Click to Show' }}
          </button>
        </div>

        <!-- Movies Toggle -->
        <div class="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-slate-400">enable_movies</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
              [class.bg-emerald-500/20]="configService.moviesEnabled()"
              [class.text-emerald-400]="configService.moviesEnabled()"
              [class.bg-rose-500/20]="!configService.moviesEnabled()"
              [class.text-rose-400]="!configService.moviesEnabled()"
            >
              VALUE: {{ configService.config().enable_movies }}
            </span>
          </div>
          <div>
            <h4 class="text-sm font-bold text-white">HD Movies Cinema Tab</h4>
            <p class="text-xs text-slate-400 mt-0.5">Show or hide the movies tab in the bottom navigation bar dynamically.</p>
          </div>
          <button
            (click)="configService.toggleFlag('enable_movies')"
            class="w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
            [class.bg-emerald-500]="configService.moviesEnabled()"
            [class.text-slate-950]="configService.moviesEnabled()"
            [class.bg-slate-800]="!configService.moviesEnabled()"
            [class.text-slate-300]="!configService.moviesEnabled()"
          >
            <mat-icon class="text-base">{{ configService.moviesEnabled() ? 'visibility' : 'visibility_off' }}</mat-icon>
            {{ configService.moviesEnabled() ? 'ENABLED (1) - Click to Hide' : 'DISABLED (0) - Click to Show' }}
          </button>
        </div>

        <!-- Anime Toggle -->
        <div class="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-slate-400">enable_anime</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
              [class.bg-emerald-500/20]="configService.animeEnabled()"
              [class.text-emerald-400]="configService.animeEnabled()"
              [class.bg-rose-500/20]="!configService.animeEnabled()"
              [class.text-rose-400]="!configService.animeEnabled()"
            >
              VALUE: {{ configService.config().enable_anime }}
            </span>
          </div>
          <div>
            <h4 class="text-sm font-bold text-white">Anime Series Hub Tab</h4>
            <p class="text-xs text-slate-400 mt-0.5">Show or hide the anime tab in the bottom navigation bar dynamically.</p>
          </div>
          <button
            (click)="configService.toggleFlag('enable_anime')"
            class="w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
            [class.bg-emerald-500]="configService.animeEnabled()"
            [class.text-slate-950]="configService.animeEnabled()"
            [class.bg-slate-800]="!configService.animeEnabled()"
            [class.text-slate-300]="!configService.animeEnabled()"
          >
            <mat-icon class="text-base">{{ configService.animeEnabled() ? 'visibility' : 'visibility_off' }}</mat-icon>
            {{ configService.animeEnabled() ? 'ENABLED (1) - Click to Hide' : 'DISABLED (0) - Click to Show' }}
          </button>
        </div>

      </div>

      <!-- Ad Manager Settings & Add Custom Stream -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Ad Manager Panel -->
        <div class="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <mat-icon class="text-amber-400">campaign</mat-icon> Interstitial Ad Manager Settings
          </h3>

          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-white/5">
            <div>
              <p class="text-xs font-bold text-white">Enable Interstitial Ads</p>
              <p class="text-[11px] text-slate-400">Show sponsor popups before stream launch</p>
            </div>
            <button
              (click)="configService.toggleFlag('enable_ads')"
              class="px-3 py-1.5 rounded-xl font-bold text-xs transition-colors"
              [class.bg-amber-500]="configService.adsEnabled()"
              [class.text-slate-950]="configService.adsEnabled()"
              [class.bg-slate-800]="!configService.adsEnabled()"
              [class.text-slate-400]="!configService.adsEnabled()"
            >
              {{ configService.adsEnabled() ? 'ACTIVE (1)' : 'OFF (0)' }}
            </button>
          </div>

          <div class="space-y-1">
            <label for="adSkipDelayInput" class="text-xs font-semibold text-slate-300">Ad Skip Timer (Seconds)</label>
            <input
              id="adSkipDelayInput"
              type="number"
              min="1"
              max="30"
              [ngModel]="configService.config().ad_skip_delay_seconds"
              (ngModelChange)="updateAdTimer($event)"
              class="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs"
            />
          </div>
        </div>

        <!-- Add Custom IPTV Stream Form -->
        <div class="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <mat-icon class="text-emerald-400">add_to_queue</mat-icon> Add Custom IPTV Stream
          </h3>

          <div class="space-y-3">
            <input
              type="text"
              placeholder="Channel Name (e.g. EuroNews HD)"
              [ngModel]="newChName()"
              (ngModelChange)="newChName.set($event)"
              class="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs"
            />

            <input
              type="text"
              placeholder="Group Category (e.g. News, Sports)"
              [ngModel]="newChGroup()"
              (ngModelChange)="newChGroup.set($event)"
              class="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs"
            />

            <input
              type="text"
              placeholder="Stream Endpoint URL (.m3u8 or .mp4)"
              [ngModel]="newChUrl()"
              (ngModelChange)="newChUrl.set($event)"
              class="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-mono text-emerald-300"
            />

            <button
              (click)="addChannel()"
              class="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              Save Stream to Database
            </button>
          </div>
        </div>

      </div>

      <!-- Live JSON Database Schema Viewer -->
      <div class="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <mat-icon class="text-purple-400">code</mat-icon> Live Local Database Schema (AppConfig)
        </h3>
        <pre class="p-4 bg-slate-950 rounded-2xl text-xs font-mono text-emerald-400 overflow-x-auto border border-white/5">{{ configService.config() | json }}</pre>
      </div>

    </div>
  `
})
export class AdminConsoleComponent {
  readonly configService = inject(ConfigService);
  readonly mediaService = inject(MediaService);

  readonly newChName = signal<string>('');
  readonly newChGroup = signal<string>('Custom IPTV');
  readonly newChUrl = signal<string>('');

  updateAdTimer(sec: number): void {
    if (sec > 0) {
      this.configService.updateConfig({ ad_skip_delay_seconds: sec });
    }
  }

  addChannel(): void {
    const name = this.newChName().trim();
    const url = this.newChUrl().trim();
    if (name && url) {
      const isHls = url.includes('.m3u8');
      this.mediaService.addCustomChannel({
        name,
        group: this.newChGroup().trim() || 'Custom IPTV',
        streamUrl: url,
        logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80',
        type: isHls ? 'hls' : 'mp4',
        isLive: true,
        currentProgram: 'Custom User Live Stream'
      });

      this.newChName.set('');
      this.newChUrl.set('');
    }
  }
}
