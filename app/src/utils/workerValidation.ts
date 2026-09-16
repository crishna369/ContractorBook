export function sanitizeMobileInput(text: string): string {
  return text.replace(/\D/g, '').slice(0, 10);
}

export function isValidMobileNumber(mobileNumber: string): boolean {
  return mobileNumber.length === 0 || mobileNumber.length === 10;
}

export function sanitizeWholeNumberInput(text: string): string {
  return text.replace(/\D/g, '');
}
