export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^0\d{1,2}-?\d{7}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
}
