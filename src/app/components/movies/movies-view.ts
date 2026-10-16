import { Component, Output, EventEmitter, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MediaService } from '../../services/media.service';
import { AdManagerService } from '../../services/ad-manager.service';
import { Movie, PlaybackTarget } from '../../models/media.model';

@Component({
  selector: 'app-movies-view',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 pb-24">

      <!-- Header & Search -->
      <div class="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-black text-white flex items-center gap-2">
              <mat-icon class="text-emerald-400">local_movies</mat-icon> HD Movies Cinema
            </h2>
            <p class="text-xs text-slate-400">On-demand blockbuster movies & cinematic MP4 streams</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <mat-icon class="absolute left-3.5 top-3 text-slate-500 text-lg">search</mat-icon>
            <input
              type="text"
              placeholder="Search movies by title, genre, year..."
              [ngModel]="movieSearchQuery()"
              (ngModelChange)="movieSearchQuery.set($event)"
              class="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <!-- Genre Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          @for (genre of genres(); track genre) {
            <button
              (click)="selectedGenre.set(genre)"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200"
              [class.bg-emerald-500]="selectedGenre() === genre"
              [class.text-slate-950]="selectedGenre() === genre"
              [class.bg-slate-800/80]="selectedGenre() !== genre"
              [class.text-slate-300]="selectedGenre() !== genre"
              [class.hover:bg-slate-700]="selectedGenre() !== genre"
            >
              {{ genre }}
            </button>
          }
        </div>
      </div>

      <!-- Movie Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (movie of filteredMovies(); track movie.id) {
          <div class="group bg-slate-900/80 border border-white/10 hover:border-emerald-500/50 rounded-3xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between">

            <!-- Poster Image Header -->
            <div class="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
              <img
                [src]="movie.poster"
                [alt]="movie.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

              <!-- Top Rating Badge -->
              <div class="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/10 text-amber-400 text-xs font-bold flex items-center gap-1 backdrop-blur-md">
                <mat-icon class="text-sm">star</mat-icon> {{ movie.rating }}
              </div>

              <!-- Favorite Button -->
              <button
                (click)="mediaService.toggleFavorite(movie.id)"
                class="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-400 hover:text-amber-400 backdrop-blur-md transition-colors"
                [class.text-amber-400]="mediaService.isFavorite(movie.id)"
              >
                <mat-icon class="text-sm">star</mat-icon>
              </button>

              <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>{{ movie.year }}</span>
                <span>{{ movie.duration }}</span>
              </div>
            </div>

            <!-- Content Details -->
            <div class="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 class="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {{ movie.title }}
                </h3>
                <p class="text-xs text-slate-400 line-clamp-2 mt-1">
                  {{ movie.description }}
                </p>
                <div class="flex flex-wrap gap-1.5 mt-2">
                  @for (g of movie.genre; track g) {
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-white/5">
                      {{ g }}
                    </span>
                  }
                </div>
              </div>

              <button
                (click)="playMovie(movie)"
                class="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <mat-icon class="text-base">play_arrow</mat-icon> Watch Movie
              </button>
            </div>

          </div>
        }
      </div>

    </div>
  `
})
export class MoviesViewComponent {
  @Output() playTarget = new EventEmitter<PlaybackTarget>();

  readonly mediaService = inject(MediaService);
  readonly adManager = inject(AdManagerService);

  readonly movieSearchQuery = signal<string>('');
  readonly selectedGenre = signal<string>('All');

  readonly genres = computed(() => ['All', 'Sci-Fi', 'Action', 'Fantasy', 'Adventure', 'Mystery']);

  readonly filteredMovies = computed(() => {
    let result = this.mediaService.movies();
    const query = this.movieSearchQuery().toLowerCase().trim();
    const genre = this.selectedGenre();

    if (genre !== 'All') {
      result = result.filter(m => m.genre.includes(genre));
    }
    if (query) {
      result = result.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query)
      );
    }
    return result;
  });

  playMovie(movie: Movie): void {
    const target: PlaybackTarget = {
      id: movie.id,
      title: movie.title,
      subtitle: `${movie.year} • ${movie.duration}`,
      url: movie.streamUrl,
      type: movie.type,
      category: 'movie',
      poster: movie.poster
    };

    this.adManager.requestPlaybackWithAd(target, () => {
      this.playTarget.emit(target);
    });
  }
}
