import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimitService } from './rate-limit.service';

describe('RateLimitService', () => {
  // simple in-memory mock for sessionStorage in Node test environment
  function createMockStorage() {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; }
    } as unknown as Storage;
  }

  beforeEach(() => {
    // provide sessionStorage polyfill for vitest
    (globalThis as any).sessionStorage = createMockStorage();
  });

  it('should start unblocked', () => {
    const svc = new RateLimitService();
    expect(svc.isBlocked()).toBe(false);
    expect(svc.secondsUntilAvailable()).toBe(0);
  });

  it('applyBackoff should set nextAvailable and delay', () => {
    const svc = new RateLimitService();
    const nextIso = svc.applyBackoff();
    // sessionStorage should contain keys
    const next = sessionStorage.getItem('rateLimit_nextAvailableTime');
    const delay = sessionStorage.getItem('rateLimit_delaySeconds');

  expect(next).toBeTruthy();
  expect(delay).toBe('2');
  // next should match the returned ISO string
  expect(next).toBe(nextIso);
    expect(svc.isBlocked()).toBe(true);
    expect(svc.secondsUntilAvailable()).toBeGreaterThan(0);
  });

  it('applyBackoff should double delay when already blocked', () => {
    const svc = new RateLimitService();
    svc.applyBackoff();
    // call again immediately to double
    const next2 = svc.applyBackoff();
    const delay2 = sessionStorage.getItem('rateLimit_delaySeconds');
    expect(delay2).toBe('4');
    expect(new Date(next2).toString()).toBeTruthy();
    expect(svc.isBlocked()).toBe(true);
  });

  it('resetBackoff should clear storage and unblock', () => {
    const svc = new RateLimitService();
    svc.applyBackoff();
    svc.resetBackoff();
    expect(sessionStorage.getItem('rateLimit_nextAvailableTime')).toBeNull();
    expect(sessionStorage.getItem('rateLimit_delaySeconds')).toBeNull();
    expect(svc.isBlocked()).toBe(false);
  });
});
