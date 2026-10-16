import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PlaybackTarget } from '../../models/media.model';
import Hls from 'hls.js';

@Component({
  selector: 'app-stream-player',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-full min-h-[320px] max-h-[80vh] bg-slate-950/90 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col group">
      <!-- Player Backdrop & Video Tag -->
      <div class="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
        <video
          #videoPlayer
          class="w-full h-full object-contain cursor-pointer"
          tabindex="0"
          (click)="togglePlay()"
          (keydown.space)="togglePlay()"
          (timeupdate)="onTimeUpdate()"
          (loadedmetadata)="onLoadedMetadata()"
          (ended)="onEnded()"
          (error)="onVideoError($event)"
          playsinline
        ></video>

        <!-- Loading / Buffering Overlay -->
        @if (isBuffering()) {
          <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-emerald-400 z-10">
            <mat-icon class="animate-spin text-4xl">sync</mat-icon>
            <p class="text-sm font-medium tracking-wide text-slate-200">Connecting HLS Live Stream...</p>
          </div>
        }

        <!-- Playback Error State -->
        @if (hasError()) {
          <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center p-6 z-20">
            <div class="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <mat-icon class="text-3xl">error_outline</mat-icon>
            </div>
            <div>
              <h4 class="text-lg font-bold text-white mb-1">Stream Signals Interrupted</h4>
              <p class="text-xs text-slate-400 max-w-md">
                Unable to decode live endpoint or link expired. Try reconnecting or switching server channels.
              </p>
            </div>
            <button
              (click)="retryPlayback()"
              class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <mat-icon>refresh</mat-icon> Reconnect Stream
            </button>
          </div>
        }

        <!-- Top Status Bar overlay -->
        <div class="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div class="flex items-center gap-3">
            @if (target?.type === 'hls' || isLiveStream()) {
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 backdrop-blur-md">
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                LIVE HLS
              </span>
            } @else {
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                VOD HD
              </span>
            }
            <h3 class="text-sm font-semibold text-white truncate max-w-md">{{ target?.title }}</h3>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-white/10 backdrop-blur-sm">
              StreamSUUt ExoEngine
            </span>
            <button
              (click)="closePlayer()"
              class="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-rose-500/80 text-white flex items-center justify-center transition-colors border border-white/10"
              title="Close Player"
            >
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>
        </div>

        <!-- Center Big Play Button (when paused) -->
        @if (!isPlaying() && !isBuffering() && !hasError()) {
          <button
            (click)="togglePlay()"
            class="absolute w-16 h-16 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all duration-200 z-10"
          >
            <mat-icon class="text-3xl">play_arrow</mat-icon>
          </button>
        }
      </div>

      <!-- Glassmorphism Custom Player Controls Bar -->
      <div class="p-3 bg-slate-900/90 backdrop-blur-md border-t border-white/10 flex flex-col gap-2 z-10">
        <!-- Progress Bar for non-live or seekable streams -->
        @if (!isLiveStream()) {
          <div
            class="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer group/bar"
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
              class="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-100"
              [style.width.%]="progressPercentage()"
            ></div>
          </div>
        }

        <div class="flex items-center justify-between gap-4 text-slate-300">
          <!-- Play / Pause / Rewind / Fast-forward -->
          <div class="flex items-center gap-2">
            <button
              (click)="togglePlay()"
              class="p-2 rounded-xl hover:bg-white/10 text-white transition-colors"
              [title]="isPlaying() ? 'Pause' : 'Play'"
            >
              <mat-icon>{{ isPlaying() ? 'pause' : 'play_arrow' }}</mat-icon>
            </button>

            @if (!isLiveStream()) {
              <button (click)="skipTime(-10)" class="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Rewind 10s">
                <mat-icon class="text-sm">replay_10</mat-icon>
              </button>
              <button (click)="skipTime(10)" class="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Forward 10s">
                <mat-icon class="text-sm">forward_10</mat-icon>
              </button>
              <span class="text-xs font-mono text-slate-400 ml-2">
                {{ formatTime(currentTime()) }} / {{ formatTime(duration()) }}
              </span>
            } @else {
              <span class="text-xs font-mono text-rose-400 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                LIVE SIGNAL ACTIVE
              </span>
            }
          </div>

          <!-- Volume & Sound Controls -->
          <div class="flex items-center gap-2">
            <button (click)="toggleMute()" class="p-2 rounded-xl hover:bg-white/10 text-white transition-colors">
              <mat-icon>{{ isMuted() || volume() === 0 ? 'volume_off' : volume() < 0.5 ? 'volume_down' : 'volume_up' }}</mat-icon>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              [value]="volume()"
              (input)="onVolumeChange($event)"
              class="w-20 accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
            />
          </div>

          <!-- Quality Badge & Fullscreen -->
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              1080p 60FPS
            </span>
            <button (click)="togglePictureInPicture()" class="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Picture in Picture">
              <mat-icon>picture_in_picture_alt</mat-icon>
            </button>
            <button (click)="toggleFullscreen()" class="p-2 rounded-xl hover:bg-white/10 text-white transition-colors" title="Fullscreen">
              <mat-icon>fullscreen</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StreamPlayerComponent implements OnChanges, OnDestroy {
  @Input() target: PlaybackTarget | null = null;
  @Input() onClose: (() => void) | null = null;

  @ViewChild('videoPlayer') videoRef!: ElementRef<HTMLVideoElement>;

  readonly isPlaying = signal<boolean>(false);
  readonly isBuffering = signal<boolean>(true);
  readonly hasError = signal<boolean>(false);
  readonly isMuted = signal<boolean>(false);
  readonly volume = signal<number>(0.8);
  readonly currentTime = signal<number>(0);
  readonly duration = signal<number>(0);
  readonly isLiveStream = signal<boolean>(false);

  private hlsInstance: Hls | null = null;

  readonly progressPercentage = () => {
    const dur = this.duration();
    if (!dur || dur === 0) return 0;
    return (this.currentTime() / dur) * 100;
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['target'] && this.target) {
      this.initStream(this.target);
    }
  }

  ngOnDestroy(): void {
    this.destroyHls();
  }

  initStream(target: PlaybackTarget): void {
    this.hasError.set(false);
    this.isBuffering.set(true);
    this.destroyHls();

    const isHls = target.type === 'hls' || target.url.includes('.m3u8');
    this.isLiveStream.set(target.category === 'channel' || isHls);

    setTimeout(() => {
      const video = this.videoRef?.nativeElement;
      if (!video) return;

      video.volume = this.volume();
      video.muted = this.isMuted();

      if (isHls) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          this.hlsInstance = hls;
          hls.loadSource(target.url);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            this.isBuffering.set(false);
            video.play().then(() => this.isPlaying.set(true)).catch(() => this.isPlaying.set(false));
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              console.warn('Fatal HLS Error:', data.type);
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  this.hasError.set(true);
                  this.isBuffering.set(false);
                  this.destroyHls();
                  break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native Safari HLS
          video.src = target.url;
          video.play().then(() => {
            this.isBuffering.set(false);
            this.isPlaying.set(true);
          }).catch(() => this.isPlaying.set(false));
        } else {
          // Direct source fallback
          video.src = target.url;
          video.play().catch((err) => console.debug('Direct play state:', err));
        }
      } else {
        // Standard MP4 video stream
        video.src = target.url;
        video.play().then(() => {
          this.isBuffering.set(false);
          this.isPlaying.set(true);
        }).catch(() => this.isPlaying.set(false));
      }
    }, 50);
  }

  togglePlay(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => this.isPlaying.set(true)).catch((err) => console.debug('Play paused state:', err));
    } else {
      video.pause();
      this.isPlaying.set(false);
    }
  }

  toggleMute(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    video.muted = !video.muted;
    this.isMuted.set(video.muted);
  }

  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = parseFloat(input.value);
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    video.volume = val;
    this.volume.set(val);
    this.isMuted.set(val === 0);
  }

  onTimeUpdate(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    this.currentTime.set(video.currentTime);
  }

  onLoadedMetadata(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    this.duration.set(video.duration || 0);
    this.isBuffering.set(false);
  }

  seekTo(event: MouseEvent): void {
    const video = this.videoRef?.nativeElement;
    if (!video || this.isLiveStream()) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * video.duration;
    video.currentTime = newTime;
    this.currentTime.set(newTime);
  }

  skipTime(seconds: number): void {
    const video = this.videoRef?.nativeElement;
    if (!video || this.isLiveStream()) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  }

  onEnded(): void {
    this.isPlaying.set(false);
  }

  onVideoError(evt: Event): void {
    console.warn('Video Player Error:', evt);
    this.isBuffering.set(false);
    this.hasError.set(true);
  }

  retryPlayback(): void {
    if (this.target) {
      this.initStream(this.target);
    }
  }

  toggleFullscreen(): void {
    const videoContainer = this.videoRef?.nativeElement?.parentElement;
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch((err) => console.debug('FS err:', err));
    } else {
      document.exitFullscreen().catch((err) => console.debug('Exit FS err:', err));
    }
  }

  togglePictureInPicture(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch((err) => console.debug('Exit PIP err:', err));
    } else if (video.requestPictureInPicture) {
      video.requestPictureInPicture().catch((err) => console.debug('PIP err:', err));
    }
  }

  closePlayer(): void {
    this.destroyHls();
    if (this.onClose) {
      this.onClose();
    }
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  private destroyHls(): void {
    if (this.hlsInstance) {
      this.hlsInstance.destroy();
      this.hlsInstance = null;
    }
  }
}
