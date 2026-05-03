import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AdminInquiryService } from './admin-inquiry-service';
import { RateLimitService } from './rate-limit.service';

export interface ContactModel {
  userId?: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactSubmitService {
  constructor(
    private adminInquiryService: AdminInquiryService,
    private rateLimitService: RateLimitService
  ) {}

  submit(inquiry: ContactModel): Observable<any> {
    // If rate-limited, return an observable error indicating blocked state
    if (this.rateLimitService.isBlocked()) {
      const seconds = this.rateLimitService.secondsUntilAvailable();
      return throwError(() => ({ blocked: true, seconds }));
    }

    return this.adminInquiryService.createInquiry(inquiry as any).pipe(
      tap(() => this.rateLimitService.resetBackoff()),
      catchError((err) => {
        if (err && err.status === 429) {
          // apply backoff but propagate the error
          this.rateLimitService.applyBackoff();
        }
        return throwError(() => err);
      })
    );
  }
}
