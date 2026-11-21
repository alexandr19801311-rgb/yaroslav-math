export type MascotMood = 'idle' | 'happy' | 'sad' | 'combo' | 'hint';

export class Mascot {
  private el!: HTMLElement;
  private faceEl!: HTMLElement;
  private leftEyeEl!: HTMLElement;
  private rightEyeEl!: HTMLElement;
  private currentMood: MascotMood = 'idle';

  private eyeTargetX = 0;
  private eyeTargetY = 0;
  private eyeCurrentX = 0;
  private eyeCurrentY = 0;
  
  private idleTimeout!: number;
  private animFrame!: number;
  
  private isDestroyed = false;

  constructor() {
    this.createDOM();
    this.startEyeLoop();
    this.startIdleTimer();
    this.bindEvents();
  }

  private createDOM(): void {
    this.el = document.createElement('div');
    this.el.className = 'mascot-container';
    this.el.innerHTML = `
      <div class="mascot-antenna"></div>
      <div class="mascot-body">
        <div class="mascot-face">
          <div class="mascot-eyes">
            <div class="mascot-eye"></div>
            <div class="mascot-eye"></div>
          </div>
          <div class="mascot-mouth"></div>
        </div>
      </div>
    `;

    document.body.appendChild(this.el);

    this.faceEl = this.el.querySelector('.mascot-face')!;
    
    const eyes = this.el.querySelectorAll('.mascot-eye');
    this.leftEyeEl = eyes[0] as HTMLElement;
    this.rightEyeEl = eyes[1] as HTMLElement;
  }

  private bindEvents(): void {
    const onMouseMove = (e: MouseEvent) => {
      this.trackPointer(e.clientX, e.clientY);
      this.resetIdleTimer();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        this.trackPointer(e.touches[0].clientX, e.touches[0].clientY);
        this.resetIdleTimer();
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchMove, { passive: true });
  }

  private startEyeLoop(): void {
    const loop = () => {
      if (this.isDestroyed) return;

      this.eyeCurrentX += (this.eyeTargetX - this.eyeCurrentX) * 0.15;
      this.eyeCurrentY += (this.eyeTargetY - this.eyeCurrentY) * 0.15;

      const eyeShiftX = this.eyeCurrentX * 4;
      const eyeShiftY = this.eyeCurrentY * 4;
      
      const pupilStyle = `transform: translate(${eyeShiftX}px, ${eyeShiftY}px);`;

      if (this.currentMood !== 'happy' && this.currentMood !== 'sad') {
        this.leftEyeEl.style.cssText = pupilStyle;
        this.rightEyeEl.style.cssText = pupilStyle;
      }

      this.faceEl.style.transform = `translate(${this.eyeCurrentX * 2}px, ${this.eyeCurrentY * 2}px)`;

      this.animFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  public trackPointer(x: number, y: number): void {
    const rect = this.el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      this.eyeTargetX = Math.max(-1, Math.min(1, dx / (window.innerWidth / 2)));
      this.eyeTargetY = Math.max(-1, Math.min(1, dy / (window.innerHeight / 2)));
    }
  }

  private startIdleTimer(): void {
    this.resetIdleTimer();
  }

  private resetIdleTimer(): void {
    window.clearTimeout(this.idleTimeout);
    
    this.idleTimeout = window.setTimeout(() => {
      if (this.currentMood === 'idle') {
        this.eyeTargetX = -0.5;
        setTimeout(() => { this.eyeTargetX = 0; }, 1000);
        setTimeout(() => { this.eyeTargetX = 0.5; }, 2000);
        setTimeout(() => { this.eyeTargetX = 0; }, 3000);
      }
    }, 8000);
  }

  public setMood(mood: MascotMood): void {
    if (this.currentMood === mood && mood !== 'happy') return;
    this.currentMood = mood;

    this.el.className = `mascot-container mascot-${mood}`;

    if (mood === 'happy') {
      this.playHappyJump();
    }
  }

  private playHappyJump(): void {
    this.el.classList.add('mascot-jump');
    setTimeout(() => this.el.classList.remove('mascot-jump'), 600);
  }

  public destroy(): void {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrame);
    window.clearTimeout(this.idleTimeout);
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}