import { Injectable, signal, inject } from '@angular/core';
import { ConfigService } from './config.service';
import { PlaybackTarget, AdCampaign } from '../models/media.model';

const SAMPLE_ADS: AdCampaign[] = [
  {
    id: 'ad-1',
    title: 'Cyber Pulse Next-Gen Gaming Headset',
    brandName: 'CyberPulse Sound Tech',
    description: 'Immerse yourself in 360 spatial surround audio with lossless ultra-low latency wireless tech.',
    callToAction: 'Explore Gear',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    targetUrl: '#',
    type: 'interstitial'
  },
  {
    id: 'ad-2',
    title: 'Aura Cloud Storage & Ultra VPN',
    brandName: 'Aura Security Network',
    description: 'Protect your online stream privacy and unlock worldwide media streaming with 10Gbps encrypted tunnels.',
    callToAction: 'Get 70% Off Now',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    targetUrl: '#',
    type: 'interstitial'
  },
  {
    id: 'ad-3',
    title: 'Quantum OLED 8K Ultra Display',
    brandName: 'Quantum Vision Labs',
    description: 'Experience true blacks and 2000 nits peak brightness for cinematic streaming right at home.',
    callToAction: 'Shop Collection',
    imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80',
    targetUrl: '#',
    type: 'interstitial'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AdManagerService {
  private configService = inject(ConfigService);

  readonly isAdActive = signal<boolean>(false);
  readonly currentAd = signal<AdCampaign | null>(null);
  readonly pendingTarget = signal<PlaybackTarget | null>(null);
  readonly adCountdown = signal<number>(5);
  readonly canSkip = signal<boolean>(false);
  readonly totalImpressions = signal<number>(0);

  private timerId: ReturnType<typeof setInterval> | null = null;
  private onAdCompletedCallback: (() => void) | null = null;

  requestPlaybackWithAd(target: PlaybackTarget, onProceed: () => void): void {
    const adsEnabled = this.configService.adsEnabled();

    if (!adsEnabled) {
      // Ads disabled in DB/Config -> directly play stream
      onProceed();
      return;
    }

    // Pick random interstitial ad
    const randomAd = SAMPLE_ADS[Math.floor(Math.random() * SAMPLE_ADS.length)];
    const skipDelay = this.configService.adSkipDelay();

    this.currentAd.set(randomAd);
    this.pendingTarget.set(target);
    this.onAdCompletedCallback = onProceed;
    this.adCountdown.set(skipDelay);
    this.canSkip.set(false);
    this.isAdActive.set(true);

    this.totalImpressions.update(count => count + 1);

    // Start countdown
    this.clearInterval();
    this.timerId = setInterval(() => {
      const remaining = this.adCountdown() - 1;
      this.adCountdown.set(remaining);

      if (remaining <= 0) {
        this.canSkip.set(true);
        this.clearInterval();
      }
    }, 1000);
  }

  skipAd(): void {
    if (!this.canSkip() && this.adCountdown() > 0) return;
    this.dismissAd();
  }

  dismissAd(): void {
    this.clearInterval();
    this.isAdActive.set(false);
    const cb = this.onAdCompletedCallback;
    this.onAdCompletedCallback = null;
    if (cb) {
      cb();
    }
  }

  private clearInterval(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
