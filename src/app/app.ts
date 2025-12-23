import { Component, signal, AfterViewInit, ElementRef, ViewChild, HostListener, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit, OnDestroy {
  protected readonly title = signal('birthday-site');

  @ViewChild('slider') sliderRef!: ElementRef<HTMLDivElement>;
  @ViewChild('sliderHandle') sliderHandleRef!: ElementRef<HTMLDivElement>;
  @ViewChild('beforeImage') beforeImageRef!: ElementRef<HTMLDivElement>;
  @ViewChild('sectionsWrapper') sectionsWrapperRef!: ElementRef<HTMLDivElement>;
  @ViewChild('videoBackground') videoRef!: ElementRef<HTMLVideoElement>;

  sliderPosition = signal(50);
  isDragging = signal(false);
  currentSectionIndex = signal(0);
  isCardFlipped = signal(false);

  // Video carousel state
  currentVideoIndex = signal(0);
  playingVideoIndex = signal<number | null>(null);
  fanVideos = [
    { name: 'Serkan Kocakoç', subtitle: 'Bastografi', src: 'https://res.cloudinary.com/dmfya9jbf/video/upload/v1766510373/Bastografi_uk7hlf.mp4' },
    { name: 'Hüseyin İskeçe', subtitle: 'Doktor', src: 'https://res.cloudinary.com/dmfya9jbf/video/upload/v1766510575/Doktor_l4dux8.mp4' },
    { name: 'Ramazan Durmuş', subtitle: 'Metrobüs Şoförü', src: 'https://res.cloudinary.com/dmfya9jbf/video/upload/v1766510425/Ramazan_Abi_hobmsx.mp4' },
    { name: 'Yusuf Bilgin', subtitle: 'UlaşımPark/Kocaeli', src: 'https://res.cloudinary.com/dmfya9jbf/video/upload/v1766510417/Yusuf_Abi_sht9wy.mp4' },
    { name: 'İbrahim Yılmaz', subtitle: 'Adaray Şefi', src: 'https://res.cloudinary.com/dmfya9jbf/video/upload/v1766510358/%C4%B0brahim_Y%C4%B1lmaz_ysu3s2.mp4' }
  ];

  private isBrowser: boolean;
  private isScrolling = false;
  private sections: HTMLElement[] = [];
  private touchStartY = 0;
  private wheelHandler: ((e: WheelEvent) => void) | null = null;
  private touchStartHandler: ((e: TouchEvent) => void) | null = null;
  private touchMoveHandler: ((e: TouchEvent) => void) | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private confettiTriggered = false;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        this.initFullpageScroll();
        this.initAnimations();
        this.playBackgroundVideo();
      }, 100);
    }
  }

  private playBackgroundVideo(): void {
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.muted = true; // Ensure muted for autoplay
      video.play().catch(() => {
        // If autoplay fails, try on user interaction
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

  ngOnDestroy(): void {
    if (this.wheelHandler) {
      window.removeEventListener('wheel', this.wheelHandler);
    }
    if (this.touchStartHandler) {
      window.removeEventListener('touchstart', this.touchStartHandler);
    }
    if (this.touchMoveHandler) {
      window.removeEventListener('touchmove', this.touchMoveHandler);
    }
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
    }
  }

  private initFullpageScroll(): void {
    this.sections = Array.from(document.querySelectorAll('.section')) as HTMLElement[];

    // Mouse wheel handler
    this.wheelHandler = (e: WheelEvent) => {
      // Don't block scroll on slider
      const target = e.target as HTMLElement;
      if (target.closest('.slider-container')) return;

      e.preventDefault();

      if (this.isScrolling) return;

      if (e.deltaY > 0) {
        this.goToSection(this.currentSectionIndex() + 1);
      } else if (e.deltaY < 0) {
        this.goToSection(this.currentSectionIndex() - 1);
      }
    };

    // Touch handlers for mobile
    this.touchStartHandler = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.slider-container')) return;
      this.touchStartY = e.touches[0].clientY;
    };

    this.touchMoveHandler = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.slider-container')) return;

      if (this.isScrolling) return;

      const touchCurrentY = e.touches[0].clientY;
      const diff = this.touchStartY - touchCurrentY;

      // Minimum swipe distance: 30px
      if (Math.abs(diff) > 30) {
        if (diff > 0) {
          this.goToSection(this.currentSectionIndex() + 1);
        } else {
          this.goToSection(this.currentSectionIndex() - 1);
        }
        this.touchStartY = touchCurrentY; // Reset to prevent multiple triggers
      }
    };

    // Keyboard navigation
    this.keyHandler = (e: KeyboardEvent) => {
      if (this.isScrolling) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        this.goToSection(this.currentSectionIndex() + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        this.goToSection(this.currentSectionIndex() - 1);
      }
    };

    window.addEventListener('wheel', this.wheelHandler, { passive: false });
    window.addEventListener('touchstart', this.touchStartHandler, { passive: true });
    window.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
    window.addEventListener('keydown', this.keyHandler);
  }

  navigateToSection(index: number): void {
    this.goToSection(index);
  }

  private goToSection(index: number): void {
    // Clamp index to valid range
    if (index < 0 || index >= this.sections.length) return;
    if (index === this.currentSectionIndex()) return;

    this.isScrolling = true;
    const previousIndex = this.currentSectionIndex();
    this.currentSectionIndex.set(index);

    const wrapper = this.sectionsWrapperRef?.nativeElement;
    if (!wrapper) {
      this.isScrolling = false;
      return;
    }

    const targetY = -index * window.innerHeight;

    // Smooth transform animation with GSAP
    gsap.to(wrapper, {
      y: targetY,
      duration: 1,
      ease: 'power3.inOut',
      onComplete: () => {
        this.isScrolling = false;
        // Trigger animations for new section
        this.animateSection(index, previousIndex);
      }
    });
  }

  private animateSection(index: number, previousIndex: number): void {
    const section = this.sections[index];
    if (!section) return;

    const content = section.querySelector('.section-content');
    const titleWords = section.querySelectorAll('.title-word');
    const giftCard = section.querySelector('.gift-card-wrapper');

    // Animate content container first
    if (content) {
      gsap.fromTo(content,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }

    // Staggered text animation for title words
    if (titleWords.length > 0) {
      gsap.fromTo(titleWords,
        { opacity: 0, y: 30, rotationX: -20 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.6,
          stagger: 0.08,
          delay: 0.2,
          ease: 'back.out(1.2)'
        }
      );
    }

    // Special gift card animation & confetti
    if (giftCard) {
      gsap.fromTo(giftCard,
        { opacity: 0, scale: 0.5, rotateY: -20 },
        { opacity: 1, scale: 1, rotateY: 0, duration: 1, delay: 0.5, ease: 'elastic.out(1, 0.5)' }
      );

      // Trigger confetti on section 9 (Gift section)
      if (index === 8 && !this.confettiTriggered) {
        this.confettiTriggered = true;
        setTimeout(() => this.fireConfetti(), 800);
      }
    }
  }

  private fireConfetti(): void {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Left side burst
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1']
      });

      // Right side burst
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1']
      });
    }, 250);
  }

  flipCard(): void {
    this.isCardFlipped.set(!this.isCardFlipped());

    // Extra confetti burst when revealing the code
    if (this.isCardFlipped()) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1']
        });
      }, 400);
    }
  }

  // Video carousel navigation
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
      // Pause any other playing video first
      this.pauseCurrentVideo();

      video.controls = true;
      video.play();
      this.playingVideoIndex.set(index);
    }
  }

  private animateVideoCard(index: number): void {
    // Delay to let slide animation complete
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

  private initAnimations(): void {
    // Initial animation for first section
    this.animateSection(0, -1);

    // Scroll indicator animation
    gsap.to('.scroll-arrow', {
      y: 10,
      opacity: 0.5,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });

    // Gift card glow pulse
    gsap.to('.gift-card-glow', {
      scale: 1.1,
      opacity: 0.8,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  // Slider handlers for before/after comparison
  onSliderMouseDown(event: MouseEvent | TouchEvent): void {
    event.stopPropagation();
    this.isDragging.set(true);
    this.updateSliderPosition(event);
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onMouseMove(event: MouseEvent | TouchEvent): void {
    if (this.isDragging()) {
      this.updateSliderPosition(event);
    }
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onMouseUp(): void {
    this.isDragging.set(false);
  }

  private updateSliderPosition(event: MouseEvent | TouchEvent): void {
    if (!this.sliderRef) return;

    const slider = this.sliderRef.nativeElement;
    const rect = slider.getBoundingClientRect();

    let clientX: number;
    if (event instanceof TouchEvent) {
      clientX = event.touches[0]?.clientX ?? event.changedTouches[0]?.clientX ?? 0;
    } else {
      clientX = event.clientX;
    }

    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    this.sliderPosition.set(percentage);
  }
}
