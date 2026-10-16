import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AdManagerService } from '../../services/ad-manager.service';

@Component({
  selector: 'app-ad-interstitial',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (adManager.isAdActive() && adManager.currentAd()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
        <div class="relative w-full max-w-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">

          <!-- Top Header & Countdown Timer -->
          <div class="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide flex items-center gap-1">
                <mat-icon class="text-sm">campaign</mat-icon> Sponsored Ad
              </span>
              <span class="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-none font-medium">
                {{ adManager.currentAd()?.brandName }}
              </span>
            </div>

            <!-- Skip / Countdown Button -->
            <div>
              @if (!adManager.canSkip()) {
                <span class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 border border-white/10 text-slate-300 text-xs font-semibold">
                  <span class="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></span>
                  Skip in {{ adManager.adCountdown() }}s
                </span>
              } @else {
                <button
                  (click)="adManager.skipAd()"
                  class="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  Skip Ad <mat-icon class="text-sm">skip_next</mat-icon>
                </button>
              }
            </div>
          </div>

          <!-- Ad Main Banner Content -->
          <div class="relative aspect-video w-full bg-slate-950 overflow-hidden group">
            <img
              [src]="adManager.currentAd()?.imageUrl"
              [alt]="adManager.currentAd()?.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

            <div class="absolute bottom-6 inset-x-6 flex flex-col gap-2">
              <h3 class="text-xl sm:text-2xl font-black text-white leading-tight">
                {{ adManager.currentAd()?.title }}
              </h3>
              <p class="text-xs sm:text-sm text-slate-300 max-w-lg line-clamp-2">
                {{ adManager.currentAd()?.description }}
              </p>
            </div>
          </div>

          <!-- Ad Action Footer -->
          <div class="p-4 px-6 bg-slate-900/95 border-t border-white/10 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <mat-icon>verified</mat-icon>
              </div>
              <div>
                <p class="text-xs text-slate-400 font-medium">Sponsor Offer</p>
                <p class="text-sm font-semibold text-white truncate max-w-[180px] sm:max-w-xs">
                  {{ adManager.pendingTarget()?.title || 'Media Stream' }} loading next
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <a
                [href]="adManager.currentAd()?.targetUrl"
                target="_blank"
                class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1"
              >
                {{ adManager.currentAd()?.callToAction }}
                <mat-icon class="text-sm">open_in_new</mat-icon>
              </a>

              <button
                (click)="adManager.dismissAd()"
                class="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
              >
                Continue to Stream
              </button>
            </div>
          </div>

        </div>
      </div>
    }
  `
})
export class AdInterstitialComponent {
  readonly adManager = inject(AdManagerService);
}
