import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retryWhen, mergeMap, tap } from 'rxjs/operators';
import { RateLimitService } from './rate-limit.service';

@Injectable()
export class RateLimitInterceptor implements HttpInterceptor {
  constructor(private rateLimitService: RateLimitService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const maxRetries = 3; // perform up to 3 automatic retries
    const minDelay = 2; // seconds

    return next.handle(req).pipe(
      // on any successful response, reset backoff
      tap(() => this.rateLimitService.resetBackoff()),
      retryWhen((errors) => errors.pipe(
        mergeMap((err: any, attempt: number) => {
          // if not a 429, rethrow immediately
          if (!(err instanceof HttpErrorResponse) || err.status !== 429) {
            return throwError(() => err);
          }

          if (attempt >= maxRetries) {
            // exhausted retries: set backoff and rethrow
            this.rateLimitService.applyBackoff();
            return throwError(() => err);
          }

          // prefer Retry-After header if present
          let retryAfterSeconds: number | null = null;
          try {
            const header = err.headers?.get ? err.headers.get('Retry-After') : null;
            if (header) {
              // header may be seconds or an HTTP-date (RFC1123)
              const secondsNum = parseInt(header, 10);
              if (!isNaN(secondsNum)) {
                retryAfterSeconds = secondsNum;
              } else {
                // try parsing HTTP-date
                const parsedDate = Date.parse(header);
                if (!isNaN(parsedDate)) {
                  const now = Date.now();
                  const diffMs = parsedDate - now;
                  retryAfterSeconds = diffMs > 0 ? Math.ceil(diffMs / 1000) : 0;
                }
              }
            }
          } catch {
            // ignore header parsing errors
          }

          const delaySeconds = retryAfterSeconds ?? (minDelay * Math.pow(2, attempt));
          return timer(delaySeconds * 1000);
        })
      )),
      catchError((err: any) => throwError(() => err))
    );
  }
}
