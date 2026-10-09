/**
 * Nigerian phone normalization.
 *
 * Accepts:
 *   08012345678     (local, 11 digits)
 *   8012345678      (local without leading 0, 10 digits)
 *   +2348012345678  (E.164)
 *   2348012345678   (international without +)
 *
 * Returns E.164 format: +2348012345678
 * Returns null if the input is not a valid Nigerian mobile number.
 *
 * Nigerian mobile prefixes are 070, 080, 081, 090, 091.
 * We only accept mobile numbers — no landlines.
 */

const MOBILE_PREFIX = /^(070|080|081|090|091)/;

export function normalizeNigerianPhone(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, "");

  let local: string;

  if (digits.startsWith("+234")) {
    local = "0" + digits.slice(4);
  } else if (digits.startsWith("234")) {
    local = "0" + digits.slice(3);
  } else if (digits.startsWith("0")) {
    local = digits;
  } else if (digits.length === 10) {
    local = "0" + digits;
  } else {
    return null;
  }

  if (local.length !== 11) return null;
  if (!MOBILE_PREFIX.test(local)) return null;

  return "+234" + local.slice(1);
}

export function isValidNigerianPhone(input: string): boolean {
  return normalizeNigerianPhone(input) !== null;
}

export function formatNigerianPhoneForDisplay(e164: string): string {
  if (!e164.startsWith("+234") || e164.length !== 14) return e164;
  const local = "0" + e164.slice(4);
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}