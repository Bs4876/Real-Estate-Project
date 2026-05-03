import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Angular and PrimeNG modules that trigger Angular linker/JIT in Node
vi.mock('@angular/core', () => ({}));
vi.mock('primeng/api', () => ({ MessageService: class {} }));

import { ContactComponent } from './contact-component';
import { MessageService } from 'primeng/api';
import { AdminInquiryService } from '../../services/admin-inquiry-service';
import { UserService } from '../../services/user-service';
import { RateLimitService } from '../../services/rate-limit.service';

// Mock Minimal dependencies
const mockMessageService = {
  add: vi.fn()
};

const mockAdminInquiryService = {
  createInquiry: vi.fn()
};

const mockUserService = {
  getCurrentUser: vi.fn(() => ({ userId: 1 }))
};

const mockRateLimitService = {
  isBlocked: vi.fn(() => false),
  secondsUntilAvailable: vi.fn(() => 0),
  resetBackoff: vi.fn(),
  applyBackoff: vi.fn()
};

describe('ContactComponent', () => {
  let component: ContactComponent;

  beforeEach(() => {
    component = new ContactComponent(
      mockMessageService as unknown as MessageService,
      mockAdminInquiryService as unknown as AdminInquiryService,
      mockUserService as unknown as UserService,
      mockRateLimitService as unknown as RateLimitService,
      { nativeElement: document.createElement('div') } as any
    );

    // set a valid form
    component.contactForm = {
      name: 'Test',
      email: 'a@b.com',
      phone: '',
      subject: 'Hi',
      message: 'Hello'
    };
  });

  it('should show blocked message when rate-limited', () => {
    (mockRateLimitService.isBlocked as any).mockReturnValue(true);
    (mockRateLimitService.secondsUntilAvailable as any).mockReturnValue(10);

    component.onSubmit();

    expect(mockMessageService.add).toHaveBeenCalled();
    const callArg = (mockMessageService.add as any).mock.calls[0][0];
    expect(callArg.severity).toBe('warn');
    expect(callArg.detail).toContain('אנא המתן');
  });

  it('should call createInquiry and reset backoff on success', async () => {
    (mockRateLimitService.isBlocked as any).mockReturnValue(false);

    (mockAdminInquiryService.createInquiry as any).mockReturnValue({ subscribe: (o: any) => o.next() });

    component.onSubmit();

    expect((mockAdminInquiryService.createInquiry as any).mock.calls.length).toBe(1);
    expect((mockRateLimitService.resetBackoff as any).mock.calls.length).toBe(1);
    expect(mockMessageService.add).toHaveBeenCalled();
  });

  it('should apply backoff when server returns 429', () => {
    (mockRateLimitService.isBlocked as any).mockReturnValue(false);

    (mockAdminInquiryService.createInquiry as any).mockReturnValue({ subscribe: (o: any) => o.error({ status: 429 }) });

    component.onSubmit();

    expect((mockRateLimitService.applyBackoff as any).mock.calls.length).toBe(1);
    expect(mockMessageService.add).toHaveBeenCalled();
  });
});
