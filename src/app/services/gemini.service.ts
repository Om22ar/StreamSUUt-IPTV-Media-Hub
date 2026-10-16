import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface AIRecommendation {
  type: 'channel' | 'movie' | 'anime';
  title: string;
  reason: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private http = inject(HttpClient);

  readonly isLoading = signal<boolean>(false);
  readonly lastResponse = signal<string>('');
  readonly error = signal<string | null>(null);

  askStreamAI(userQuery: string, contextCategory?: string) {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<{ answer: string; error?: string }>('/api/gemini', {
      prompt: userQuery,
      contextCategory: contextCategory || 'general'
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.error) {
          this.error.set(res.error);
        } else {
          this.lastResponse.set(res.answer);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Could not reach StreamSUUt AI Assistant. Using fallback recommendations.');
        this.lastResponse.set(
          `🤖 **StreamSUUt AI Assistant Suggestion:**\n\nBased on your interest in ${contextCategory || 'streaming'}, try watching **NASA TV Live Stream** or **Cyberpunk Vanguard 2088**!`
        );
      }
    });
  }
}
