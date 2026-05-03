import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdminInquiryService } from '../../services/admin-inquiry-service';
import { UserService } from '../../services/user-service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule
  ],
  animations: [
    trigger('slideDown', [
      state('closed', style({ height: '0', opacity: '0', overflow: 'hidden' })),
      state('open', style({ height: '*', opacity: '1' })),
      transition('closed <=> open', animate('300ms ease-in-out'))
    ])
  ],
  providers: [MessageService],
  templateUrl: './contact-component.html',
  styleUrl: './contact-component.scss'
})
export class ContactComponent implements AfterViewInit {
  activeFaq: number | null = null;
  
  contactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };
  
  faqs = [
    {
      question: 'איך אני מפרסם נכס?',
      answer: 'התחבר לחשבון האישי שלך, לחץ על "המוצרים שלי" ואז על "הוסף מוצר חדש". מלא את כל הפרטים הנדרשים והעלה תמונות איכותיות של הנכס.'
    },
    {
      question: 'מה העמלות של האתר?',
      answer: 'עמלות האתר: מכירה - 2% מסך העסקה, השכרה - חודש שכירות אחד, נופש - 8% מסך ההזמנה. העמלה משולמת רק לאחר סגירת עסקה מוצלחת.'
    },
    {
      question: 'איך מבטלים הזמנה?',
      answer: 'לביטול הזמנה, פנה לשירות הלקוחות בטלפון 03-1234567 או במייל support@realestate.co.il. ביטול עד 48 שעות לפני התאריך זכאי להחזר מלא.'
    },
    {
      question: 'איך אני מעדכן נכס קיים?',
      answer: 'היכנס לאיזור האישי, לחץ על "המוצרים שלי", בחר את הנכס שברצונך לעדכן ולחץ על כפתור העריכה. תוכל לשנות מחיר, תיאור, תמונות ועוד.'
    },
    {
      question: 'מה אמצעי התשלום המקובלים?',
      answer: 'אנו מקבלים תשלום בכרטיסי אשראי, העברה בנקאית, PayPal וביט, וכן תשלום במזומן במקרים מסוימים. כל התשלומים מאובטחים ומוצפנים.'
    },
    {
      question: 'כמה זמן לוקח לאשר נכס?',
      answer: 'אישור נכס לוקח בדרך כלל עד 24 שעות. אנו בודקים שהנכס עומד בתקנים שלנו ושכל הפרטים מלאים כראוי. תקבל הודעה למייל.'
    },
    {
      question: 'האם יש אפשרות לראות את הנכס לפני ההזמנה?',
      answer: 'כן! לחץ על "צור קשר" בדף הנכס כדי לתאם סיור עם בעל הנכס. אנו ממליצים לראות את הנכס לפני החלטה סופית.'
    },
    {
      question: 'מה קורה אם יש בעיה עם הנכס?',
      answer: 'אם יש בעיה עם הנכס, פנה אלינו מיד ונטפל בעניין. אנו מציעים אחריות מלאה על כל הנכסים באתר ונפעל לפתרון מהיר.'
    }
  ];

  constructor(
    private messageService: MessageService,
    private adminInquiryService: AdminInquiryService,
    private userService: UserService,
    private elementRef: ElementRef
  ) {}

  ngAfterViewInit() {
    this.setupScrollAnimations();
  }

  toggleFaq(index: number) {
    this.activeFaq = this.activeFaq === index ? null : index;
  }

  setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    const elements = this.elementRef.nativeElement.querySelectorAll('.field, .contact-info-item, .faq-item, h1, p');
    elements.forEach((element: Element) => {
      element.classList.add('animate-on-scroll');
      observer.observe(element);
    });
  }

  onSubmit() {
    if (this.isFormValid()) {
      const currentUser = this.userService.getCurrentUser();
      const inquiry = {
        userId: currentUser?.userId,
        name: this.contactForm.name,
        email: this.contactForm.email,
        phone: this.contactForm.phone,
        subject: this.contactForm.subject,
        message: this.contactForm.message
      };
      
      this.adminInquiryService.createInquiry(inquiry).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'הפנייה נשלחה בהצלחה',
            detail: 'ניצור איתך קשר בהקדם האפשרי'
          });
          this.resetForm();
        },
        error: (err) => {
          console.error('Error sending message:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'שגיאה',
            detail: 'שגיאה בשליחת הפנייה'
          });
        }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'שגיאה',
        detail: 'אנא מלא את כל השדות הנדרשים'
      });
    }
  }

  isFormValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^0[2-9]\d{7,8}$/;
    
    const isEmailValid = emailRegex.test(this.contactForm.email);
    const isPhoneValid = !this.contactForm.phone || phoneRegex.test(this.contactForm.phone);
    
    return !!(
      this.contactForm.name &&
      this.contactForm.email &&
      isEmailValid &&
      isPhoneValid &&
      this.contactForm.subject &&
      this.contactForm.message
    );
  }

  resetForm() {
    this.contactForm = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    };
  }
}
