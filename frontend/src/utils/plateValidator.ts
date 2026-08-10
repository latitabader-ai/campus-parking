// src/utils/plateValidator.ts
// Client-side Saudi plate format validator — mirrors the backend vehicles.schemas.ts logic.
//
// Accepted formats:
//   Latin:  "ABJ 1234" or "ABJ-1234"  (3 uppercase letters + separator + 1–4 digits)
//   Arabic: "أ ب ج 1234"              (3 Arabic letters + 1–4 digits)

const ARABIC_TO_LATIN: Record<string, string> = {
  'أ': 'A', 'ا': 'A', 'ب': 'B', 'ت': 'T', 'ث': 'S',
  'ج': 'J', 'ح': 'H', 'خ': 'X', 'د': 'D', 'ذ': 'Z',
  'ر': 'R', 'ز': 'Z', 'س': 'S', 'ش': 'H', 'ص': 'S',
  'ض': 'D', 'ط': 'T', 'ظ': 'Z', 'ع': 'A', 'غ': 'G',
  'ف': 'F', 'ق': 'Q', 'ك': 'K', 'ل': 'L', 'م': 'M',
  'ن': 'N', 'ه': 'H', 'و': 'W', 'ي': 'Y',
};

const LATIN_RE  = /^[A-Z]{3}[\s-]\d{1,4}$/;
const ARABIC_RE = /^[\u0600-\u06FF][\s\u0600-\u06FF]{0,5}\d{1,4}$/;

export function normalisePlate(raw: string): string {
  const v = raw.trim().toUpperCase().replace(/\s+/g, ' ');
  if (LATIN_RE.test(v)) return v.replace('-', ' ');
  // Try to transliterate Arabic letters
  const arabicLetters = [...v].filter(c => ARABIC_TO_LATIN[c]);
  const digits        = v.match(/\d{1,4}/)?.[0] ?? '';
  if (arabicLetters.length === 3 && digits) {
    return arabicLetters.map(c => ARABIC_TO_LATIN[c]).join('') + ' ' + digits;
  }
  return v;
}

/** Returns true if the raw plate string matches either the Latin or Arabic Saudi format. */
export function isValidPlate(raw: string): boolean {
  const v = raw.trim().toUpperCase().replace(/\s+/g, ' ');
  return LATIN_RE.test(v.replace('-', ' ')) || ARABIC_RE.test(v);
}

/** Display helper: shows "ABJ 1234" alongside Arabic glyphs if transliteration can be reversed. */
export function displayPlate(latin: string): string {
  return latin; // For MVP: stored form is already readable. Full bilingual display is V1.
}
