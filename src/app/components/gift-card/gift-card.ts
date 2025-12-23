import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-gift-card',
  standalone: true,
  imports: [],
  templateUrl: './gift-card.html',
  styleUrl: './gift-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GiftCard {
  isCardFlipped = signal(false);
  private confettiTriggered = false;

  flipCard(): void {
    this.isCardFlipped.set(!this.isCardFlipped());

    if (this.isCardFlipped()) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff4655', '#17f1d7', '#ece8e1', '#ff4655', '#17f1d7']
        });
      }, 400);
    }
  }

  triggerEntryConfetti(): void {
    if (this.confettiTriggered) return;
    this.confettiTriggered = true;

    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#ff4655', '#17f1d7', '#ece8e1', '#0f1923']
      });

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#ff4655', '#17f1d7', '#ece8e1', '#0f1923']
      });
    }, 250);
  }
}
