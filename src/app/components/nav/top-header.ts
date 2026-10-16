import { Component, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ConfigService } from '../../services/config.service';
import { PwaStatusComponent } from '../pwa-status/pwa-status';

@Component({
  selector: 'app-top-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, PwaStatusComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-30 w-full bg-slate-950/75 backdrop-blur-xl border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        <!-- Logo & Branding -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 border border-white/20">
            <mat-icon class="text-2xl">sensors</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-lg font-black text-white tracking-tight leading-none">StreamSUUt</h1>
              <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PRO IPTV
              </span>
            </div>
            <p class="text-[11px] text-slate-400 font-medium">Dynamic Local Database Media Platform</p>
          </div>
        </div>

        <!-- Active Feature Badges, PWA Status & AI Trigger -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- PWA Service Worker Network & Cache Badge -->
          <app-pwa-status />

          <!-- Active DB Flags Status Pill -->
          <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-[11px] font-mono text-slate-300">
            <span class="w-2 h-2 rounded-full" [class.bg-emerald-400]="configService.channelsEnabled()" [class.bg-slate-600]="!configService.channelsEnabled()"></span>
            <span [class.opacity-40]="!configService.channelsEnabled()">CH</span>
            <span>/</span>
            <span class="w-2 h-2 rounded-full" [class.bg-emerald-400]="configService.moviesEnabled()" [class.bg-slate-600]="!configService.moviesEnabled()"></span>
            <span [class.opacity-40]="!configService.moviesEnabled()">MOV</span>
            <span>/</span>
            <span class="w-2 h-2 rounded-full" [class.bg-emerald-400]="configService.animeEnabled()" [class.bg-slate-600]="!configService.animeEnabled()"></span>
            <span [class.opacity-40]="!configService.animeEnabled()">ANI</span>
          </div>

          <!-- AI Assistant Drawer Button -->
          <button
            (click)="openAiDrawer.emit()"
            class="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all duration-200"
          >
            <mat-icon class="text-base text-purple-400 animate-spin-slow">auto_awesome</mat-icon>
            <span class="hidden xs:inline">AI Stream Assistant</span>
          </button>
        </div>

      </div>
    </header>
  `
})
export class TopHeaderComponent {
  @Output() openAiDrawer = new EventEmitter<void>();
  readonly configService = inject(ConfigService);
}
