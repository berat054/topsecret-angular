import { Component, signal, ElementRef, ViewChild, HostListener, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-before-after-slider',
  standalone: true,
  imports: [],
  templateUrl: './before-after-slider.html',
  styleUrl: './before-after-slider.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BeforeAfterSlider {
  @ViewChild('slider') sliderRef!: ElementRef<HTMLDivElement>;

  sliderPosition = signal(50);
  isDragging = signal(false);

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
