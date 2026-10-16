import { Component, Output, EventEmitter, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
      <div class="w-full max-w-md bg-slate-900 border-l border-white/10 h-full flex flex-col shadow-2xl animate-slide-left">

        <!-- Header -->
        <div class="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <mat-icon class="text-lg">auto_awesome</mat-icon>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">StreamSUUt AI Assistant</h3>
              <p class="text-[10px] text-slate-400">Powered by Gemini AI</p>
            </div>
          </div>

          <button (click)="closeDrawer.emit()" class="text-slate-400 hover:text-white">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Chat History Container -->
        <div class="flex-1 p-6 overflow-y-auto space-y-4">
          <div class="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
            <p class="text-xs text-slate-300">
              👋 Hi! I am your AI Streaming Assistant. Ask me to find live IPTV channels, recommend movies by mood, or analyze M3U playlists!
            </p>
          </div>

          @if (geminiService.isLoading()) {
            <div class="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-3">
              <mat-icon class="animate-spin text-base">sync</mat-icon>
              <span>Gemini is generating streaming insights...</span>
            </div>
          }

          @if (geminiService.lastResponse()) {
            <div class="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-purple-400">AI Stream Response</span>
              <div class="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {{ geminiService.lastResponse() }}
              </div>
            </div>
          }
        </div>

        <!-- Suggestion Chips -->
        <div class="p-4 px-6 border-t border-white/5 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button (click)="askQuick('Top sci-fi movies tonight')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 whitespace-nowrap">
            🍿 Sci-Fi Movies
          </button>
          <button (click)="askQuick('Best sports IPTV channels')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 whitespace-nowrap">
            ⚽ Live Sports IPTV
          </button>
          <button (click)="askQuick('Top anime recommendation')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 whitespace-nowrap">
            🎌 Anime Hits
          </button>
        </div>

        <!-- Input Box -->
        <div class="p-4 border-t border-white/10 bg-slate-950/80 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI for streaming recommendations..."
            [ngModel]="userInput()"
            (ngModelChange)="userInput.set($event)"
            (keyup.enter)="sendQuery()"
            class="flex-1 px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            (click)="sendQuery()"
            class="p-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold"
          >
            <mat-icon class="text-sm">send</mat-icon>
          </button>
        </div>

      </div>
    </div>
  `
})
export class AiAssistantComponent {
  @Output() closeDrawer = new EventEmitter<void>();

  readonly geminiService = inject(GeminiService);
  readonly userInput = signal<string>('');

  sendQuery(): void {
    const q = this.userInput().trim();
    if (q) {
      this.geminiService.askStreamAI(q);
      this.userInput.set('');
    }
  }

  askQuick(query: string): void {
    this.userInput.set(query);
    this.sendQuery();
  }
}
