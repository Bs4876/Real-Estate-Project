import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ContactSubmitService } from './contact-submit.service';

describe('ContactSubmitService', () => {
  let service: ContactSubmitService;
  let adminMock: any;
  let rateMock: any;

  beforeEach(() => {
    adminMock = {
      createInquiry: vi.fn()
    };
    rateMock = {
      isBlocked: vi.fn(() => false),
      secondsUntilAvailable: vi.fn(() => 0),
      resetBackoff: vi.fn(),
      applyBackoff: vi.fn()
    };

    service = new ContactSubmitService(adminMock as any, rateMock as any);
  });

  it('should error when blocked', async () => {
    rateMock.isBlocked.mockReturnValue(true);
    await expect(firstValueFrom(service.submit({ name: 'a', email: 'a@b.com', subject: 's', message: 'm' } as any)))
      .rejects.toMatchObject({ blocked: true });
  });

  it('should reset backoff on success', async () => {
    adminMock.createInquiry.mockReturnValue(of(null));
    const p = firstValueFrom(service.submit({ name: 'a', email: 'a@b.com', subject: 's', message: 'm' } as any));
    await p;
    expect(rateMock.resetBackoff).toHaveBeenCalled();
  });

  it('should apply backoff on 429 error', async () => {
    adminMock.createInquiry.mockReturnValue(throwError(() => ({ status: 429 })));
    await expect(firstValueFrom(service.submit({ name: 'a', email: 'a@b.com', subject: 's', message: 'm' } as any))).rejects.toBeDefined();
    expect(rateMock.applyBackoff).toHaveBeenCalled();
  });
});
