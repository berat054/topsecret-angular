import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-gift-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gift-card.html',
  styleUrl: './gift-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GiftCard {
  isCardFlipped = signal(false);
  isCopied = signal(false);
  isBoxOpened = signal(false);
  isSlotSpinning = signal(false);
  currentSlotIndex = signal(0);
  displayedCode = signal<string[]>([]);
  
  // Holographic effect
  mouseX = signal(0);
  mouseY = signal(0);
  isHovering = signal(false);
  
  private confettiTriggered = false;
  private slotAnimationStarted = false;
  
  readonly giftCode = 'RA-AQH2FSBYPA38NEP3';
  private readonly slotChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';

  onMouseMove(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.mouseX.set(x);
    this.mouseY.set(y);
    this.isHovering.set(true);
  }

  onMouseLeave(): void {
    this.isHovering.set(false);
    this.mouseX.set(50);
    this.mouseY.set(50);
  }

  getCardTransform(): string {
    if (!this.isHovering() || this.isCardFlipped()) {
      return this.isCardFlipped() ? 'rotateY(180deg)' : '';
    }
    const rotateX = (this.mouseY() - 50) / 10;
    const rotateY = (this.mouseX() - 50) / 10;
    return `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
  }

  getHoloGradient(): string {
    const x = this.mouseX();
    const y = this.mouseY();
    return `radial-gradient(circle at ${x}% ${y}%, 
      rgba(255, 70, 85, 0.3) 0%, 
      rgba(23, 241, 215, 0.2) 25%, 
      rgba(236, 232, 225, 0.15) 50%, 
      rgba(255, 70, 85, 0.1) 75%, 
      transparent 100%)`;
  }

  openBox(): void {
    this.isBoxOpened.set(true);
    
    // Kutu açılınca confetti
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ff4655', '#17f1d7', '#ece8e1', '#ff4655']
      });
    }, 300);
  }

  flipCard(): void {
    if (this.isCardFlipped()) {
      // Geri çevirme - animasyon yok
      this.isCardFlipped.set(false);
      return;
    }

    this.isCardFlipped.set(true);
    
    // Slot animasyonunu başlat
    if (!this.slotAnimationStarted) {
      this.slotAnimationStarted = true;
      this.startSlotAnimation();
    }

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4655', '#17f1d7', '#ece8e1', '#ff4655', '#17f1d7']
      });
    }, 400);
  }

  private startSlotAnimation(): void {
    const codeArray = this.giftCode.split('');
    this.isSlotSpinning.set(true);
    this.currentSlotIndex.set(0);
    
    // Başlangıçta rastgele karakterler göster
    this.displayedCode.set(codeArray.map(() => this.getRandomChar()));

    // Her karakteri sırayla yerleştir
    let index = 0;
    const revealInterval = setInterval(() => {
      if (index >= codeArray.length) {
        clearInterval(revealInterval);
        this.isSlotSpinning.set(false);
        // Animasyon bitince doğru kodu göster (güvenlik için)
        this.displayedCode.set(codeArray);
        return;
      }

      // Mevcut karakteri spin ettir ve sonra yerleştir
      this.spinAndReveal(index, codeArray[index]);
      this.currentSlotIndex.set(index + 1);
      index++;
    }, 100);
  }

  private spinAndReveal(index: number, finalChar: string): void {
    let spinCount = 0;
    const maxSpins = 4;

    const spinInterval = setInterval(() => {
      const currentCode = [...this.displayedCode()];
      
      if (spinCount >= maxSpins) {
        clearInterval(spinInterval);
        currentCode[index] = finalChar;
        this.displayedCode.set([...currentCode]);
        return;
      }

      currentCode[index] = this.getRandomChar();
      this.displayedCode.set([...currentCode]);
      spinCount++;
    }, 40);
  }

  private getRandomChar(): string {
    return this.slotChars[Math.floor(Math.random() * this.slotChars.length)];
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

  copyCode(event: Event): void {
    event.stopPropagation(); // Kartın flip olmasını engelle
    
    navigator.clipboard.writeText(this.giftCode).then(() => {
      this.isCopied.set(true);
      
      // Mini confetti
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#17f1d7', '#ece8e1']
      });
      
      // 2 saniye sonra reset
      setTimeout(() => {
        this.isCopied.set(false);
      }, 2000);
    });
  }
}
