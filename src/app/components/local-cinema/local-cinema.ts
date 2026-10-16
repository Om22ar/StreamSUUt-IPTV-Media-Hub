import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  ViewChild,
  ElementRef,
  OnDestroy,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface LocalMediaItem {
  id: string;
  name: string;
  sizeFormatted: string;
  type: 'video' | 'audio';
  fileUrl: string;
  fileObject?: File;
  subtitleUrl?: string;
  subtitleName?: string;
  subtitleCues?: ParsedCue[];
}

export interface ParsedCue {
  id: number;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
}

@Component({
  selector: 'app-local-cinema',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-fade-in">

      <!-- Header Banner & Instructions -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 p-6 md:p-8 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div class="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <mat-icon class="text-sm">folder_open</mat-icon>
                المشغل المحلي • Local Cinema
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SRT / VTT SUBTITLE ENGINE
              </span>
            </div>
            <h2 class="text-2xl md:text-3xl font-black text-white tracking-tight">
              سينما الجهاز المحلية والوسائط العالية الدقة
            </h2>
            <p class="text-slate-300 text-sm max-w-2xl leading-relaxed">
              قم بتشغيل مقاطع الفيديو والأفلام والملفات الصوتية المخزنة على جهازك بجودة فائقة ودعم كامل للترجمة الخارجية باللغة العربية والإنجليزية، مع التحكم بضبط زمن الترجمة وسرعة التشغيل.
            </p>
          </div>

          <!-- Quick Actions & Sample Load -->
          <div class="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              (click)="loadDemoSample()"
              class="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
            >
              <mat-icon class="text-base">play_circle_filled</mat-icon>
              <span>تجربة فيديو عينة مع ترجمة</span>
            </button>
          </div>
        </div>
      </div>

      <!-- File Drop & Upload Zone -->
      <div
        class="relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 group cursor-pointer"
        [class.border-indigo-500]="isDragging()"
        [class.bg-indigo-500/10]="isDragging()"
        [class.border-white/15]="!isDragging()"
        [class.bg-slate-900/50]="!isDragging()"
        [class.hover:border-indigo-400/50]="!isDragging()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <input
          #mediaFileInput
          type="file"
          accept="video/*,audio/*,.mkv,.mp4,.webm,.avi,.mov,.mp3,.wav,.flac,.m4a"
          class="hidden"
          (change)="onMediaFileSelected($event)"
        />
        <input
          #subFileInput
          type="file"
          accept=".srt,.vtt,text/vtt,application/x-subrip"
          class="hidden"
          (change)="onSubtitleFileSelected($event)"
        />

        <div class="max-w-md mx-auto space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <mat-icon class="text-3xl">file_upload</mat-icon>
          </div>

          <div class="space-y-1">
            <h3 class="text-base font-bold text-white">اسحب وأسقط الملفات هنا أو قم باختيارها</h3>
            <p class="text-xs text-slate-400">
              يدعم مقاطع الفيديو (MP4, MKV, WEBM, MOV) والصوتيات (MP3, WAV, FLAC) مع ملفات الترجمة (.SRT, .VTT)
            </p>
          </div>

          <div class="flex items-center justify-center gap-3 pt-2">
            <button
              (click)="mediaFileInput.click()"
              class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center gap-2 transition-all"
            >
              <mat-icon class="text-base text-indigo-400">movie</mat-icon>
              <span>اختر فيديو / صوت</span>
            </button>

            <button
              (click)="subFileInput.click()"
              class="px-5 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <mat-icon class="text-base text-purple-400">subtitles</mat-icon>
              <span>إضافة ملف ترجمة (.SRT)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Active Local Player Stage -->
      @if (activeItem()) {
        <div class="space-y-4 bg-slate-950/80 rounded-3xl border border-white/10 p-4 md:p-6 backdrop-blur-xl shadow-2xl relative">

          <!-- Player Title Bar -->
          <div class="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <mat-icon>{{ activeItem()?.type === 'video' ? 'movie' : 'audiotrack' }}</mat-icon>
              </div>
              <div class="min-w-0">
                <h3 class="text-sm font-bold text-white truncate">{{ activeItem()?.name }}</h3>
                <div class="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{{ activeItem()?.sizeFormatted }}</span>
                  <span>•</span>
                  <span class="uppercase font-mono text-emerald-400">{{ activeItem()?.type }}</span>
                  @if (activeItem()?.subtitleName) {
                    <span>•</span>
                    <span class="text-purple-300 flex items-center gap-0.5">
                      <mat-icon class="text-xs">subtitles</mat-icon>
                      {{ activeItem()?.subtitleName }}
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- Header Controls -->
            <div class="flex items-center gap-2">
              <button
                (click)="subFileInput.click()"
                class="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                title="تغيير الترجمة"
              >
                <mat-icon class="text-sm">subtitles</mat-icon>
                <span class="hidden sm:inline">تغيير الترجمة</span>
              </button>

              <button
                (click)="closePlayer()"
                class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="إغلاق المشغل"
              >
                <mat-icon class="text-base">close</mat-icon>
              </button>
            </div>
          </div>

          <!-- Video / Audio Canvas Display -->
          <div
            #playerContainer
            class="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center group"
            [class.aspect-square]="activeItem()?.type === 'audio'"
            [class.max-h-80]="activeItem()?.type === 'audio'"
          >
            <!-- Audio Mode Visualizer / Album Backdrop -->
            @if (activeItem()?.type === 'audio') {
              <div class="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div class="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40 border-4 border-white/10" [class.animate-spin-slow]="isPlaying()">
                  <mat-icon class="text-6xl text-white">graphic_eq</mat-icon>
                </div>
                <div>
                  <h4 class="text-lg font-bold text-white">{{ activeItem()?.name }}</h4>
                  <p class="text-xs text-indigo-300">ملف صوتي محلي • Local Audio Cinema</p>
                </div>
              </div>
            }

            <video
              #videoRef
              class="w-full h-full object-contain"
              [src]="activeItem()?.fileUrl"
              (timeupdate)="onTimeUpdate()"
              (loadedmetadata)="onLoadedMetadata()"
              (ended)="onEnded()"
              (click)="togglePlay()"
              tabindex="0"
              (keydown.space)="togglePlay()"
            >
              @if (vttBlobUrl()) {
                <track
                  kind="subtitles"
                  [src]="vttBlobUrl()"
                  srclang="ar"
                  label="العربية"
                  default
                />
              }
            </video>

            <!-- Custom Subtitle Overlay Container -->
            @if (currentSubtitleText()) {
              <div
                class="absolute bottom-16 inset-x-6 text-center pointer-events-none z-20 flex justify-center"
              >
                <div
                  class="bg-black/80 text-white font-bold rounded-lg px-4 py-2 shadow-2xl border border-white/10 max-w-2xl dir-auto leading-snug tracking-wide"
                  [ngStyle]="{
                    'font-size': subtitleFontSize() + 'px',
                    'text-shadow': '0px 2px 4px rgba(0,0,0,0.9)'
                  }"
                >
                  {{ currentSubtitleText() }}
                </div>
              </div>
            }

            <!-- Center Big Play Button Overlay -->
            @if (!isPlaying()) {
              <button
                (click)="togglePlay()"
                class="absolute inset-0 m-auto w-20 h-20 rounded-full bg-indigo-600/90 text-white backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20 hover:scale-110 transition-transform z-10"
              >
                <mat-icon class="text-4xl">play_arrow</mat-icon>
              </button>
            }

            <!-- Subtitle Sync Status Indicator -->
            @if (subtitleOffset() !== 0) {
              <div class="absolute top-4 left-4 z-20 bg-purple-900/80 backdrop-blur-md border border-purple-400/40 text-purple-200 px-3 py-1 rounded-full text-xs font-mono font-bold">
                تعديل الترجمة: {{ subtitleOffset() > 0 ? '+' : '' }}{{ subtitleOffset().toFixed(1) }}s
              </div>
            }
          </div>

          <!-- Cinema Controls Bar -->
          <div class="bg-slate-900/90 rounded-2xl border border-white/10 p-4 space-y-3">

            <!-- Progress Bar -->
            <div
              class="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer group/bar"
              tabindex="0"
              role="slider"
              aria-label="Seek progress bar"
              [attr.aria-valuenow]="currentTime()"
              [attr.aria-valuemin]="0"
              [attr.aria-valuemax]="duration()"
              (click)="seekTo($event)"
              (keydown.enter)="seekTo($any($event))"
            >
              <div
                class="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-100"
                [style.width.%]="progressPercentage()"
              ></div>
            </div>

            <!-- Primary Buttons Row -->
            <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">

              <div class="flex items-center gap-2">
                <!-- Play/Pause -->
                <button
                  (click)="togglePlay()"
                  class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <mat-icon class="text-xl">{{ isPlaying() ? 'pause' : 'play_arrow' }}</mat-icon>
                </button>

                <!-- Skip -10s -->
                <button
                  (click)="skip(-10)"
                  class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                  title="تراجع 10 ثوانٍ"
                >
                  <mat-icon class="text-lg">replay_10</mat-icon>
                </button>

                <!-- Skip +10s -->
                <button
                  (click)="skip(10)"
                  class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                  title="تقديم 10 ثوانٍ"
                >
                  <mat-icon class="text-lg">forward_10</mat-icon>
                </button>

                <!-- Time Counter -->
                <div class="font-mono text-slate-300 font-bold px-2">
                  {{ formatTime(currentTime()) }} / {{ formatTime(duration()) }}
                </div>
              </div>

              <!-- Center/Right Features -->
              <div class="flex items-center gap-2 flex-wrap">

                <!-- Playback Speed selector -->
                <div class="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  <span class="text-[10px] text-slate-400 px-1 font-bold">السرعة:</span>
                  @for (spd of [0.75, 1.0, 1.25, 1.5, 2.0]; track spd) {
                    <button
                      (click)="setPlaybackRate(spd)"
                      class="px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition-all"
                      [class.bg-indigo-500]="playbackRate() === spd"
                      [class.text-white]="playbackRate() === spd"
                      [class.text-slate-400]="playbackRate() !== spd"
                    >
                      {{ spd }}x
                    </button>
                  }
                </div>

                <!-- Subtitle Size Adjuster -->
                <div class="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  <span class="text-[10px] text-slate-400 px-1 font-bold">حجم الخط:</span>
                  <button
                    (click)="changeSubtitleFontSize(-2)"
                    class="p-1 hover:text-white"
                    title="تصغير خط الترجمة"
                  >
                    <mat-icon class="text-sm">remove</mat-icon>
                  </button>
                  <span class="font-mono text-[10px] font-bold text-purple-300 w-6 text-center">{{ subtitleFontSize() }}px</span>
                  <button
                    (click)="changeSubtitleFontSize(2)"
                    class="p-1 hover:text-white"
                    title="تكبير خط الترجمة"
                  >
                    <mat-icon class="text-sm">add</mat-icon>
                  </button>
                </div>

                <!-- Subtitle Delay Sync Adjuster -->
                <div class="flex items-center gap-1 bg-purple-500/10 p-1 rounded-xl border border-purple-500/20">
                  <span class="text-[10px] text-purple-300 px-1 font-bold">تزامن:</span>
                  <button
                    (click)="adjustSubtitleOffset(-0.5)"
                    class="px-1.5 py-0.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded font-mono text-[10px]"
                    title="-0.5s تأخير"
                  >
                    -0.5s
                  </button>
                  <button
                    (click)="adjustSubtitleOffset(0.5)"
                    class="px-1.5 py-0.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded font-mono text-[10px]"
                    title="+0.5s تقديم"
                  >
                    +0.5s
                  </button>
                  @if (subtitleOffset() !== 0) {
                    <button
                      (click)="resetSubtitleOffset()"
                      class="px-1 text-[10px] text-rose-400 hover:underline"
                    >
                      إعادة
                    </button>
                  }
                </div>

                <!-- Fullscreen & Picture in Picture -->
                <button
                  (click)="toggleFullscreen()"
                  class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="ملء الشاشة"
                >
                  <mat-icon class="text-lg">fullscreen</mat-icon>
                </button>

              </div>

            </div>

          </div>

        </div>
      }

      <!-- Local Playlists & Loaded Files Library -->
      <div class="bg-slate-950/70 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <mat-icon class="text-indigo-400">queue_music</mat-icon>
            <h3 class="text-base font-bold text-white">قائمة وسائط الجهاز المشغلة مؤخراً</h3>
          </div>
          <span class="text-xs text-slate-400 font-mono">{{ localPlaylist().length }} ملفات</span>
        </div>

        @if (localPlaylist().length === 0) {
          <div class="py-8 text-center text-slate-400 text-xs border border-white/5 rounded-2xl bg-white/5">
            لم يتم تحميل أي ملفات محلية بعد. قم بسحب فيديو أو صوت للبدء مباشرة.
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (item of localPlaylist(); track item.id) {
              <div
                tabindex="0"
                role="button"
                (click)="selectPlaylistItem(item)"
                (keydown.enter)="selectPlaylistItem(item)"
                class="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                [class.border-indigo-500]="activeItem()?.id === item.id"
                [class.bg-indigo-500/10]="activeItem()?.id === item.id"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <mat-icon>{{ item.type === 'video' ? 'movie' : 'audiotrack' }}</mat-icon>
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                      {{ item.name }}
                    </h4>
                    <p class="text-[10px] text-slate-400">{{ item.sizeFormatted }}</p>
                  </div>
                </div>

                <button
                  (click)="removeFromPlaylist($event, item.id)"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
                >
                  <mat-icon class="text-base">delete</mat-icon>
                </button>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `
})
export class LocalCinemaComponent implements OnDestroy {
  private platformId = inject(PLATFORM_ID);

  @ViewChild('videoRef') videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('playerContainer') playerContainer?: ElementRef<HTMLDivElement>;

  readonly isDragging = signal<boolean>(false);
  readonly activeItem = signal<LocalMediaItem | null>(null);
  readonly localPlaylist = signal<LocalMediaItem[]>([]);

  readonly isPlaying = signal<boolean>(false);
  readonly currentTime = signal<number>(0);
  readonly duration = signal<number>(0);
  readonly playbackRate = signal<number>(1.0);

  readonly vttBlobUrl = signal<string | null>(null);
  readonly parsedCues = signal<ParsedCue[]>([]);
  readonly currentSubtitleText = signal<string>('');
  readonly subtitleOffset = signal<number>(0);
  readonly subtitleFontSize = signal<number>(20);

  readonly progressPercentage = computed(() => {
    const dur = this.duration();
    if (!dur) return 0;
    return Math.min(100, (this.currentTime() / dur) * 100);
  });

  ngOnDestroy(): void {
    if (this.vttBlobUrl()) {
      URL.revokeObjectURL(this.vttBlobUrl()!);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files);
      const mediaFile = files.find(f => f.type.startsWith('video/') || f.type.startsWith('audio/') || !!f.name.match(/\.(mp4|mkv|webm|avi|mov|mp3|wav|flac)$/i));
      const subFile = files.find(f => !!f.name.match(/\.(srt|vtt)$/i));

      if (mediaFile) {
        this.processLocalMediaFile(mediaFile, subFile);
      } else if (subFile && this.activeItem()) {
        this.processSubtitleFile(subFile);
      }
    }
  }

  onMediaFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processLocalMediaFile(input.files[0]);
    }
  }

  onSubtitleFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processSubtitleFile(input.files[0]);
    }
  }

  processLocalMediaFile(file: File, subFile?: File): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const fileUrl = URL.createObjectURL(file);
    const isAudio = file.type.startsWith('audio/') || !!file.name.match(/\.(mp3|wav|flac|m4a)$/i);

    const item: LocalMediaItem = {
      id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: file.name,
      sizeFormatted: this.formatBytes(file.size),
      type: isAudio ? 'audio' : 'video',
      fileUrl,
      fileObject: file
    };

    this.activeItem.set(item);
    this.localPlaylist.update(list => [item, ...list.filter(i => i.name !== item.name)]);

    if (subFile) {
      this.processSubtitleFile(subFile);
    } else {
      this.currentSubtitleText.set('');
      this.parsedCues.set([]);
      this.vttBlobUrl.set(null);
    }

    setTimeout(() => {
      const video = this.videoRef?.nativeElement;
      if (video) {
        video.play().then(() => this.isPlaying.set(true)).catch((err) => console.debug(err));
      }
    }, 150);
  }

  processSubtitleFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      const cues = this.parseSrtOrVtt(content);
      this.parsedCues.set(cues);

      const vttText = this.convertToVttString(content);
      const blob = new Blob([vttText], { type: 'text/vtt' });
      if (this.vttBlobUrl()) {
        URL.revokeObjectURL(this.vttBlobUrl()!);
      }
      const url = URL.createObjectURL(blob);
      this.vttBlobUrl.set(url);

      if (this.activeItem()) {
        const updated = {
          ...this.activeItem()!,
          subtitleName: file.name,
          subtitleUrl: url,
          subtitleCues: cues
        };
        this.activeItem.set(updated);
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  private parseSrtOrVtt(text: string): ParsedCue[] {
    const cues: ParsedCue[] = [];
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = normalized.split(/\n\s*\n/);

    let id = 1;
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 2) continue;

      let timeLine = '';
      const textLines: string[] = [];

      for (const line of lines) {
        if (line.includes('-->')) {
          timeLine = line;
        } else if (timeLine && line.trim()) {
          textLines.push(line.trim());
        }
      }

      if (!timeLine) continue;

      const timeMatch = timeLine.match(/(\d\d:\d\d:\d\d[.,]\d\d\d)\s*-->\s*(\d\d:\d\d:\d\d[.,]\d\d\d)/);
      if (timeMatch) {
        const start = this.timeToSeconds(timeMatch[1]);
        const end = this.timeToSeconds(timeMatch[2]);
        const cueText = textLines.join('\n');
        cues.push({ id: id++, start, end, text: cueText });
      }
    }

    return cues;
  }

  private timeToSeconds(timeStr: string): number {
    const normalized = timeStr.replace(',', '.');
    const parts = normalized.split(':');
    if (parts.length === 3) {
      const hrs = parseFloat(parts[0]);
      const mins = parseFloat(parts[1]);
      const secs = parseFloat(parts[2]);
      return hrs * 3600 + mins * 60 + secs;
    }
    return 0;
  }

  private convertToVttString(srtContent: string): string {
    let text = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    text = text.replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2');
    return 'WEBVTT\n\n' + text;
  }

  loadDemoSample(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Load high-res demo open source video (Big Buck Bunny) with Arabic subtitle demo
    const demoItem: LocalMediaItem = {
      id: 'demo_sample',
      name: 'Big Buck Bunny 4K Cinema Sample.mp4',
      sizeFormatted: '18.4 MB',
      type: 'video',
      fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      subtitleName: 'Arabic_Subtitles_Demo.srt'
    };

    const sampleArabicSrt = `1
00:00:01,000 --> 00:00:06,000
مرحباً بكم في المشغل المحلي - Local Cinema 🎬

2
00:00:07,000 --> 00:00:12,000
عرض عينة الفيديو بدقة عالية مع دعم الترجمة العربية تلقائياً

3
00:00:13,000 --> 00:00:20,000
يمكنك تعديل حجم الخط وتوقيت المزامنة مباشرة أثناء التشغيل!`;

    const cues = this.parseSrtOrVtt(sampleArabicSrt);
    this.parsedCues.set(cues);

    const vttText = this.convertToVttString(sampleArabicSrt);
    const blob = new Blob([vttText], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    this.vttBlobUrl.set(url);

    demoItem.subtitleUrl = url;
    demoItem.subtitleCues = cues;

    this.activeItem.set(demoItem);
    this.localPlaylist.update(list => [demoItem, ...list.filter(i => i.id !== demoItem.id)]);

    setTimeout(() => {
      const video = this.videoRef?.nativeElement;
      if (video) {
        video.play().then(() => this.isPlaying.set(true)).catch((err) => console.debug(err));
      }
    }, 150);
  }

  togglePlay(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => this.isPlaying.set(true)).catch((err) => console.debug(err));
    } else {
      video.pause();
      this.isPlaying.set(false);
    }
  }

  skip(seconds: number): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
  }

  seekTo(event: MouseEvent): void {
    const video = this.videoRef?.nativeElement;
    if (!video || !this.duration()) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    video.currentTime = pos * this.duration();
  }

  setPlaybackRate(rate: number): void {
    this.playbackRate.set(rate);
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.playbackRate = rate;
    }
  }

  adjustSubtitleOffset(sec: number): void {
    this.subtitleOffset.update(v => v + sec);
    this.updateActiveSubtitle(this.currentTime());
  }

  resetSubtitleOffset(): void {
    this.subtitleOffset.set(0);
    this.updateActiveSubtitle(this.currentTime());
  }

  changeSubtitleFontSize(delta: number): void {
    this.subtitleFontSize.update(s => Math.max(12, Math.min(48, s + delta)));
  }

  onTimeUpdate(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;

    this.currentTime.set(video.currentTime);
    this.updateActiveSubtitle(video.currentTime);
  }

  private updateActiveSubtitle(now: number): void {
    const offsetNow = now - this.subtitleOffset();
    const cues = this.parsedCues();

    if (!cues || cues.length === 0) {
      this.currentSubtitleText.set('');
      return;
    }

    const matched = cues.find(c => offsetNow >= c.start && offsetNow <= c.end);
    if (matched) {
      this.currentSubtitleText.set(matched.text);
    } else {
      this.currentSubtitleText.set('');
    }
  }

  onLoadedMetadata(): void {
    const video = this.videoRef?.nativeElement;
    if (video) {
      this.duration.set(video.duration || 0);
    }
  }

  onEnded(): void {
    this.isPlaying.set(false);
  }

  toggleFullscreen(): void {
    const container = this.playerContainer?.nativeElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => console.debug(err));
    } else {
      document.exitFullscreen().catch((err) => console.debug(err));
    }
  }

  selectPlaylistItem(item: LocalMediaItem): void {
    this.activeItem.set(item);
    if (item.subtitleCues) {
      this.parsedCues.set(item.subtitleCues);
    } else {
      this.parsedCues.set([]);
      this.currentSubtitleText.set('');
    }

    setTimeout(() => {
      const video = this.videoRef?.nativeElement;
      if (video) {
        video.play().then(() => this.isPlaying.set(true)).catch((err) => console.debug(err));
      }
    }, 150);
  }

  removeFromPlaylist(event: Event, id: string): void {
    event.stopPropagation();
    this.localPlaylist.update(list => list.filter(i => i.id !== id));
    if (this.activeItem()?.id === id) {
      this.closePlayer();
    }
  }

  closePlayer(): void {
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.pause();
    }
    this.activeItem.set(null);
    this.isPlaying.set(false);
    this.currentSubtitleText.set('');
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
