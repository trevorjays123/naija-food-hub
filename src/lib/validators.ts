// Nigerian phone: accepts +2348012345678, 2348012345678, 08012345678, 8012345678
export function isValidNigerianPhone(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits.length === 13;
  if (digits.startsWith("0")) return digits.length === 11;
  return digits.length === 10 && /^[789]/.test(digits);
}

export function normalizeNigerianPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return `+234${digits.slice(1)}`;
  return `+234${digits}`;
}
