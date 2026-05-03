import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductService } from '../../services/product-service';
import { UserService } from '../../services/user-service';
import { ProductCardComponent } from '../product-card-component/product-card-component';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProductCardComponent, ReactiveFormsModule, InputTextModule, ToastModule],
  providers: [MessageService],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
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
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  featuredProducts: any[] = [];
  currentIndex: number = 0;
  contactForm: FormGroup;
  isSubmitting = false;
  
  stats = [
    { key: 'properties', value: 1250, label: 'נכסים פעילים', icon: 'pi-home' },
    { key: 'clients', value: 3500, label: 'לקוחות מרוצים', icon: 'pi-users' },
    { key: 'cities', value: 45, label: 'ערים בכל הארץ', icon: 'pi-map-marker' },
    { key: 'years', value: 15, label: 'שנות ניסיון', icon: 'pi-star' }
  ];
  
  animatedStats: any = {};
  
  testimonials = [
    {
      name: 'דוד כהן',
      location: 'תל אביב',
      text: 'מצאתי את הדירה המושלמת תוך שבועיים! השירות היה מקצועי ומהיר. ממליץ בחום!'
    },
    {
      name: 'שרה לוי',
      location: 'ירושלים',
      text: 'הצוות עזר לי למצוא צימר מדהים לחופשה. התהליך היה פשוט וקל. תודה רבה!'
    },
    {
      name: 'יוסי אברהם',
      location: 'חיפה',
      text: 'שירות ברמה גבוהה! מצאתי נכס להשקעה במחיר מעולה. בהחלט אחזור שוב.'
    },
    {
      name: 'מיכל אביב',
      location: 'ראשון לציון',
      text: 'השירות המקצועי והמהיר שלהם עזר לי למכור את הדירה תוך חודש. מומלץ ביותר!'
    },
    {
      name: 'אלי גולדשטיין',
      location: 'נתניה',
      text: 'מצאתי בית למשפחה שלי במחיר הוגן. הפלטפורמה קלה לשימוש והתמיכה מעולה.'
    },
    {
      name: 'רונית מזרחי',
      location: 'באר שבע',
      text: 'השכרתי דירה דרך האתר והתהליך היה חלק ושקוף. מומלץ לכל מחפש דיור!'
    }
  ];
  
  currentTestimonialIndex = 0;
  
  private animationFrameId: number | null = null;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^0\d{1,2}-?\d{7}$/)]],
      message: ['']
    });
  }

  ngOnInit() {
    this.currentIndex = 0;
    this.loadFeaturedProducts();
    this.animateStats();
  }

  ngAfterViewInit() {
    this.setupScrollAnimations();
  }
  
  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
  
  animateStats() {
    this.stats.forEach(stat => {
      this.animateValue(stat.key, 0, stat.value, 2000);
    });
  }
  
  animateValue(key: string, start: number, end: number, duration: number) {
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuad = progress * (2 - progress);
      this.animatedStats[key] = Math.floor(start + (end - start) * easeOutQuad);
      
      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
      this.cdr.detectChanges();
    };
    
    this.animationFrameId = requestAnimationFrame(animate);
  }
  
  submitContactForm() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      setTimeout(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'הודעה נשלחה!',
          detail: 'תודה שפנית אלינו. נחזור אליך בהקדם האפשרי.',
          life: 5000
        });
        
        this.contactForm.reset();
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }, 1500);
    } else {
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
      
      this.messageService.add({
        severity: 'error',
        summary: 'שגיאה',
        detail: 'אנא מלא את כל השדות הנדרשים',
        life: 3000
      });
    }
  }

  setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    const elements = this.elementRef.nativeElement.querySelectorAll('section, h1, h2, h3, p, .feature-icon, button, .grid > div');
    elements.forEach((element: Element) => {
      element.classList.add('animate-on-scroll');
      observer.observe(element);
    });
  }

  loadFeaturedProducts() {
    this.featuredProducts = [];
    this.currentIndex = 0;
    this.cdr.detectChanges();
    
    this.productService.getProducts([], '', null, null, null, null, 1, 6).subscribe({
      next: (response) => {
        if (response && response.data && response.data.length > 0) {
          this.featuredProducts = [...response.data].sort(() => 0.5 - Math.random()).slice(0, 6);
          this.currentIndex = 0;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'שגיאה',
          detail: 'שגיאה בטעינת נכסים',
          life: 3000
        });
      }
    });
  }

  nextProduct() {
    if (this.featuredProducts && this.featuredProducts.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.featuredProducts.length;
      this.cdr.detectChanges();
    }
  }

  previousProduct() {
    if (this.featuredProducts && this.featuredProducts.length > 0) {
      this.currentIndex = this.currentIndex === 0 
        ? this.featuredProducts.length - 1 
        : this.currentIndex - 1;
      this.cdr.detectChanges();
    }
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  getNextProduct() {
    if (!this.featuredProducts || this.featuredProducts.length === 0) return null;
    const nextIndex = (this.currentIndex + 1) % this.featuredProducts.length;
    return this.featuredProducts[nextIndex];
  }

  getPreviousProduct() {
    if (!this.featuredProducts || this.featuredProducts.length === 0) return null;
    const prevIndex = this.currentIndex === 0 
      ? this.featuredProducts.length - 1 
      : this.currentIndex - 1;
    return this.featuredProducts[prevIndex];
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  addProperty() {
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/add-product']);
    } else {
      localStorage.setItem('returnUrl', '/add-product');
      this.router.navigate(['/auth']);
    }
  }
  
  getVisibleTestimonials() {
    const start = this.currentTestimonialIndex;
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(this.testimonials[(start + i) % this.testimonials.length]);
    }
    return visible;
  }
  
  nextTestimonial() {
    this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length;
  }
  
  previousTestimonial() {
    this.currentTestimonialIndex = this.currentTestimonialIndex === 0 
      ? this.testimonials.length - 1 
      : this.currentTestimonialIndex - 1;
  }
  
  goToTestimonial(index: number) {
    this.currentTestimonialIndex = index;
  }
  
  goToBlog() {
    this.router.navigate(['/blog']);
  }
}
