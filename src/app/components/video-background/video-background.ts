import { Component, AfterViewInit, ViewChild, ElementRef, PLATFORM_ID, Inject, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-video-background',
  standalone: true,
  imports: [],
  templateUrl: './video-background.html',
  styleUrl: './video-background.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoBackground implements AfterViewInit {
  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.playVideo();
    }
  }

  private playVideo(): void {
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.muted = true;
      video.play().catch(() => {
        const playOnInteraction = () => {
          video.play();
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
      });
    }
  }
}
