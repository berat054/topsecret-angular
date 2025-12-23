import { Component, signal, AfterViewInit, ElementRef, ViewChild, ViewChildren, QueryList, PLATFORM_ID, Inject, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

// Components
import { VideoBackground } from './components/video-background/video-background';
import { BeforeAfterSlider } from './components/before-after-slider/before-after-slider';
import { FanVideoCarousel } from './components/fan-video-carousel/fan-video-carousel';
import { GiftCard } from './components/gift-card/gift-card';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, VideoBackground, BeforeAfterSlider, FanVideoCarousel, GiftCard],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('sectionsWrapper') sectionsWrapperRef!: ElementRef<HTMLDivElement>;
  @ViewChild('giftCardComponent') giftCardRef!: GiftCard;
  @ViewChildren('sectionRef') sectionRefs!: QueryList<ElementRef<HTMLElement>>;

  currentSectionIndex = signal(0);
  readonly sectionCount = 16;

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
      setTimeout(() => {
        this.initFullpageScroll();
        this.initAnimations();
      }, 100);
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
    // Use @ViewChildren for Angular-way DOM access
    if (this.sectionRefs?.length) {
      this.sections = this.sectionRefs.map(ref => ref.nativeElement);
    } else {
      this.sections = Array.from(document.querySelectorAll('.section')) as HTMLElement[];
    }

    this.wheelHandler = (e: WheelEvent) => {
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

      if (Math.abs(diff) > 30) {
        if (diff > 0) {
          this.goToSection(this.currentSectionIndex() + 1);
        } else {
          this.goToSection(this.currentSectionIndex() - 1);
        }
        this.touchStartY = touchCurrentY;
      }
    };

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

    gsap.to(wrapper, {
      y: targetY,
      duration: 1,
      ease: 'power3.inOut',
      onComplete: () => {
        this.isScrolling = false;
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

    if (content) {
      gsap.fromTo(content,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }

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

    if (giftCard) {
      gsap.fromTo(giftCard,
        { opacity: 0, scale: 0.5, rotateY: -20 },
        { opacity: 1, scale: 1, rotateY: 0, duration: 1, delay: 0.5, ease: 'elastic.out(1, 0.5)' }
      );

      // Trigger confetti on gift section (index 15)
      if (index === 15 && !this.confettiTriggered) {
        this.confettiTriggered = true;
        setTimeout(() => this.giftCardRef?.triggerEntryConfetti(), 800);
      }
    }
  }

  private initAnimations(): void {
    this.animateSection(0, -1);

    gsap.to('.scroll-arrow', {
      y: 10,
      opacity: 0.5,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });

    gsap.to('.valorant-glow', {
      scale: 1.1,
      opacity: 0.8,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }
}
