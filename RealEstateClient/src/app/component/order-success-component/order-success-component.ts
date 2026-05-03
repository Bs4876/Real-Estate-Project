import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './order-success-component.html',
  styleUrl: './order-success-component.scss'
})
export class OrderSuccessComponent implements OnInit, OnDestroy {
  orderId: number = 0;
  orderSuccess: boolean = true;
  private confettiInterval: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.orderId = +params['orderId'] || 0;
      this.orderSuccess = params['success'] !== 'false';
      
      if (this.orderSuccess) {
        this.triggerConfetti();
      }
    });
  }

  ngOnDestroy() {
    if (this.confettiInterval) {
      clearInterval(this.confettiInterval);
    }
  }

  triggerConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;
    
    this.confettiInterval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(this.confettiInterval);
        return;
      }
      
      this.createConfetti();
    }, 50);
  }

  createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    confetti.style.backgroundColor = this.getRandomColor();
    confetti.style.width = (Math.random() * 10 + 5) + 'px';
    confetti.style.height = (Math.random() * 10 + 5) + 'px';
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 4000);
  }

  getRandomColor(): string {
    const colors = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  goToOrders() {
    this.router.navigate(['/profile'], { queryParams: { tab: 1 } });
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }
}
