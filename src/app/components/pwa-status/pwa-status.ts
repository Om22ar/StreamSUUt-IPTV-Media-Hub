import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PwaOfflineService } from '../../services/pwa-offline.service';

@Component({
  selector: 'app-pwa-status',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">

      <!-- Status Trigger Button -->
      <button
        (click)="toggleMenu()"
        class="px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
        [class.bg-emerald-500/10]="pwaService.isOnline()"
        [class.border-emerald-500/30]="pwaService.isOnline()"
        [class.text-emerald-400]="pwaService.isOnline()"
        [class.bg-amber-500/10]="!pwaService.isOnline()"
        [class.border-amber-500/30]="!pwaService.isOnline()"
        [class.text-amber-400]="!pwaService.isOnline()"
      >
        <span class="w-2 h-2 rounded-full animate-pulse"
          [class.bg-emerald-400]="pwaService.isOnline()"
          [class.bg-amber-400]="!pwaService.isOnline()"
        ></span>
        <mat-icon class="text-sm">
          {{ pwaService.isOnline() ? 'wifi' : 'wifi_off' }}
        </mat-icon>
        <span class="hidden md:inline">
          {{ pwaService.isOnline() ? 'PWA Online' : 'مترابط (Offline)' }}
        </span>
        @if (pwaService.updateAvailable()) {
          <span class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
        }
      </button>

      <!-- PWA SW Cache Details Popup Modal/Menu -->
      @if (showMenu()) {
        <div class="absolute top-11 left-0 z-50 w-72 p-4 bg-slate-900/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl space-y-3 animate-fade-in text-xs text-slate-200 dir-auto">

          <!-- Header -->
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <div class="flex items-center gap-2 font-bold text-white">
              <mat-icon class="text-indigo-400 text-base">cloud_done</mat-icon>
              <span>خدمة التخزين المحلي والـ PWA</span>
            </div>
            <button (click)="toggleMenu()" class="text-slate-400 hover:text-white">
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>

          <!-- Network & SW Status -->
          <div class="space-y-1.5 font-mono">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-400">حالة الاتصال:</span>
              <span [class.text-emerald-400]="pwaService.isOnline()" [class.text-amber-400]="!pwaService.isOnline()">
                {{ pwaService.isOnline() ? 'متصل بالشبكة (Online)' : 'يعمل بدون إنترنت (Offline)' }}
              </span>
            </div>

            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-400">Service Worker:</span>
              <span class="text-indigo-300 font-bold">
                {{ pwaService.isSwAvailable() ? 'مفعل (SW Active)' : 'جاهز للمزامنة' }}
              </span>
            </div>
          </div>

          <!-- Offline Cached Metadata Stats -->
          <div class="bg-white/5 rounded-xl p-2.5 border border-white/10 space-y-1">
            <div class="text-[11px] font-bold text-indigo-300 flex items-center justify-between">
              <span>الكتالوج المخزن أوفلاين:</span>
              <mat-icon class="text-xs">inventory_2</mat-icon>
            </div>
            <div class="grid grid-cols-3 gap-1 text-center font-mono text-[10px] pt-1">
              <div class="bg-slate-800/80 p-1.5 rounded-lg border border-white/5">
                <div class="text-white font-bold">{{ pwaService.offlineStats().cachedMoviesCount }}</div>
                <div class="text-[9px] text-slate-400">أفلام</div>
              </div>
              <div class="bg-slate-800/80 p-1.5 rounded-lg border border-white/5">
                <div class="text-white font-bold">{{ pwaService.offlineStats().cachedChannelsCount }}</div>
                <div class="text-[9px] text-slate-400">قنوات</div>
              </div>
              <div class="bg-slate-800/80 p-1.5 rounded-lg border border-white/5">
                <div class="text-white font-bold">{{ pwaService.offlineStats().cachedAnimeCount }}</div>
                <div class="text-[9px] text-slate-400">أنمي</div>
              </div>
            </div>
          </div>

          <!-- SW Update Notification Prompt -->
          @if (pwaService.updateAvailable()) {
            <div class="p-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-xl space-y-2">
              <p class="text-[11px] text-indigo-200">تحديث جديد للتطبيق متوفر للتثبيت!</p>
              <button
                (click)="pwaService.reloadAppToUpdate()"
                class="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-colors"
              >
                تحديث الآن (Reload)
              </button>
            </div>
          }

          <!-- Sync Action Button -->
          <button
            (click)="refreshCache()"
            class="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <mat-icon class="text-sm text-indigo-400">sync</mat-icon>
            <span>تحديث مخزون البيانات للعمل بدون إنترنت</span>
          </button>

        </div>
      }

    </div>
  `
})
export class PwaStatusComponent {
  readonly pwaService = inject(PwaOfflineService);
  readonly showMenu = signal<boolean>(false);

  toggleMenu(): void {
    this.showMenu.update(v => !v);
  }

  refreshCache(): void {
    this.pwaService.loadCacheStats();
  }
}
