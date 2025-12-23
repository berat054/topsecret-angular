import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { FanVideo } from '../../models/fan-video.interface';
import { FAN_VIDEOS } from '../../data/videos.data';

@Component({
  selector: 'app-fan-video-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fan-video-carousel.html',
  styleUrl: './fan-video-carousel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FanVideoCarousel {
  currentVideoIndex = signal(0);
  playingVideoIndex = signal<number | null>(null);

  readonly fanVideos: FanVideo[] = FAN_VIDEOS;

  nextVideo(): void {
    if (this.currentVideoIndex() < this.fanVideos.length - 1) {
      this.pauseCurrentVideo();
      const newIndex = this.currentVideoIndex() + 1;
      this.currentVideoIndex.set(newIndex);
      this.playingVideoIndex.set(null);
      this.animateVideoCard(newIndex);
    }
  }

  prevVideo(): void {
    if (this.currentVideoIndex() > 0) {
      this.pauseCurrentVideo();
      const newIndex = this.currentVideoIndex() - 1;
      this.currentVideoIndex.set(newIndex);
      this.playingVideoIndex.set(null);
      this.animateVideoCard(newIndex);
    }
  }

  goToVideo(index: number): void {
    if (index >= 0 && index < this.fanVideos.length && index !== this.currentVideoIndex()) {
      this.pauseCurrentVideo();
      this.currentVideoIndex.set(index);
      this.playingVideoIndex.set(null);
      this.animateVideoCard(index);
    }
  }

  playVideo(event: Event, index: number): void {
    const container = event.currentTarget as HTMLElement;
    const video = container.querySelector('video') as HTMLVideoElement;

    if (video && this.playingVideoIndex() !== index) {
      this.pauseCurrentVideo();
      video.controls = true;
      video.play();
      this.playingVideoIndex.set(index);
    }
  }

  private animateVideoCard(index: number): void {
    // Sadece ilk video için animasyon
    if (index !== 0) return;

    setTimeout(() => {
      const card = document.querySelector(`[data-card-index="${index}"]`);
      if (card) {
        const title = card.querySelector('.video-title');
        const subtitle = card.querySelector('.video-subtitle');

        if (title) {
          gsap.fromTo(title,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
          );
        }

        if (subtitle) {
          gsap.fromTo(subtitle,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, delay: 0.15, ease: 'power2.out' }
          );
        }
      }
    }, 300);
  }

  private pauseCurrentVideo(): void {
    const playingIndex = this.playingVideoIndex();
    if (playingIndex !== null) {
      const videos = document.querySelectorAll('.video-card video') as NodeListOf<HTMLVideoElement>;
      videos.forEach((video, idx) => {
        if (idx === playingIndex) {
          video.pause();
          video.controls = false;
        }
      });
    }
  }
}
