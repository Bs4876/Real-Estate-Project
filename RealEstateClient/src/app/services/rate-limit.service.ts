import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RateLimitService {
  private readonly STORAGE_KEY = 'rateLimit_nextAvailableTime';
  private readonly STORAGE_DELAY_KEY = 'rateLimit_delaySeconds';
  private minDelaySeconds = 2; // initial backoff
  private _isBlocked$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.syncStateFromStorage();
    // Start a simple interval to update blocked state based on time
    setInterval(() => this.syncStateFromStorage(), 1000);
  }

  private syncStateFromStorage() {
    const next = sessionStorage.getItem(this.STORAGE_KEY);
    if (!next) {
      this._isBlocked$.next(false);
      return;
    }
    const nextTime = new Date(next).getTime();
    const now = Date.now();
    if (nextTime > now) {
      this._isBlocked$.next(true);
    } else {
      this._isBlocked$.next(false);
    }
  }

  isBlocked(): boolean {
    const next = sessionStorage.getItem(this.STORAGE_KEY);
    if (!next) return false;
    const nextTime = new Date(next).getTime();
    return nextTime > Date.now();
  }

  isBlocked$(): Observable<boolean> {
    return this._isBlocked$.asObservable();
  }

  // When a 429 is received, call this to apply exponential backoff. Returns the new nextAvailableTime (ISO string).
  applyBackoff(): string {
    const currentDelayStr = sessionStorage.getItem(this.STORAGE_DELAY_KEY);
    let delay = currentDelayStr ? parseInt(currentDelayStr, 10) : this.minDelaySeconds;

    // If there is already a nextAvailableTime in the future, start from that delay doubled
    const existingNext = sessionStorage.getItem(this.STORAGE_KEY);
    if (existingNext) {
      const existingNextTime = new Date(existingNext).getTime();
      const now = Date.now();
      if (existingNextTime > now) {
        // double the delay
        delay = Math.max(delay * 2, this.minDelaySeconds * 2);
      }
    }

    // store updated delay and nextAvailableTime
    sessionStorage.setItem(this.STORAGE_DELAY_KEY, delay.toString());
    const nextAvailable = new Date(Date.now() + delay * 1000);
    sessionStorage.setItem(this.STORAGE_KEY, nextAvailable.toISOString());

    this._isBlocked$.next(true);
    return nextAvailable.toISOString();
  }

  // Reset backoff on successful request
  resetBackoff() {
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_DELAY_KEY);
    this._isBlocked$.next(false);
  }

  // Return seconds until next available or 0
  secondsUntilAvailable(): number {
    const next = sessionStorage.getItem(this.STORAGE_KEY);
    if (!next) return 0;
    const nextTime = new Date(next).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((nextTime - now) / 1000));
  }
}
