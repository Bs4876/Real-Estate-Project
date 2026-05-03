import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterModule],
  templateUrl: './about-component.html',
  styleUrl: './about-component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(150, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class AboutComponent implements AfterViewInit {
  constructor(private router: Router, private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.setupScrollAnimations();
  }

  setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    const elements = this.elementRef.nativeElement.querySelectorAll('section, h1, h2, h3, p, .feature-icon, .mission-icon, button, .grid > div, .feature-box, .mission-card, .term-item');
    elements.forEach((element: Element) => {
      element.classList.add('animate-on-scroll');
      observer.observe(element);
    });
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  goToAddProduct() {
    this.router.navigate(['/add-product']);
  }
}
