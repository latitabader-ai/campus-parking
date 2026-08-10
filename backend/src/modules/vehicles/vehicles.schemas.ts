// src/modules/vehicles/vehicles.schemas.ts
// Zod schemas for vehicle registration and plate lookup.
//
// DISCLAIMER: Plate validation uses a localised Saudi format for MVP demo purposes.
// Real ANPR/OCR is not implemented.
//
// Accepted formats (both are stored as normalised Latin with space separator):
//   Latin form:  "ABJ 1234"  (3 uppercase A–Z + space or hyphen + 1–4 digits)
//   Arabic form: "أ ب ج 1234" (3 Arabic letters, whitespace-separated, + 1–4 digits)
//
// Normalisation: Arabic letters are transliterated to the Latin equivalent and stored
// as "ABJ 1234". The UI may display both forms side-by-side for readability.

import { z } from 'zod';

// Arabic letter → Latin transliteration map (simplified demo set covering ا–ي)
const ARABIC_TO_LATIN: Record<string, string> = {
  'أ': 'A', 'ا': 'A', 'ب': 'B', 'ت': 'T', 'ث': 'S',
  'ج': 'J', 'ح': 'H', 'خ': 'X', 'د': 'D', 'ذ': 'Z',
  'ر': 'R', 'ز': 'Z', 'س': 'S', 'ش': 'H', 'ص': 'S',
  'ض': 'D', 'ط': 'T', 'ظ': 'Z', 'ع': 'A', 'غ': 'G',
  'ف': 'F', 'ق': 'Q', 'ك': 'K', 'ل': 'L', 'م': 'M',
  'ن': 'N', 'ه': 'H', 'و': 'W', 'ي': 'Y',
};

// Latin form: ABC 1234 or ABC-1234 (3 letters, separator, 1–4 digits)
const LATIN_PLATE_RE = /^[A-Z]{3}[\s-]\d{1,4}$/;
// Arabic form: 3 Arabic letters separated by optional whitespace + digits
const ARABIC_PLATE_RE = /^[\u0600-\u06FF]+[\s\u0600-\u06FF]*\d{1,4}$/;

function normalisePlate(raw: string): string {
  const v = raw.trim().toUpperCase().replace(/\s+/g, ' ');
  // If all-ASCII already, normalise separator to space
  if (/^[A-Z]{3}[\s-]\d{1,4}$/.test(v)) {
    return v.replace('-', ' ');
  }
  // Arabic form: extract Arabic letters and digits
  const arabicLetters = [...v].filter(c => ARABIC_TO_LATIN[c]);
  const digits        = v.match(/\d{1,4}/)?.[0] ?? '';
  if (arabicLetters.length === 3 && digits) {
    return arabicLetters.map(c => ARABIC_TO_LATIN[c]).join('') + ' ' + digits;
  }
  return v;
}

export function isValidPlate(raw: string): boolean {
  const norm = normalisePlate(raw.trim().toUpperCase().replace(/\s+/g, ' '));
  return LATIN_PLATE_RE.test(norm);
}

export const RegisterVehicleSchema = z.object({
  plate: z
    .string()
    .min(1, 'Plate is required')
    .transform(v => normalisePlate(v))
    .refine(v => LATIN_PLATE_RE.test(v) || ARABIC_PLATE_RE.test(v.toUpperCase()), {
      message: 'Plate must be in Saudi format: ABJ 1234 (Latin) or أ ب ج 1234 (Arabic)',
    }),
  make:  z.string().max(50).optional().nullable(),
  model: z.string().max(50).optional().nullable(),
  color: z.string().max(30).optional().nullable(),
});

export const PlateQuerySchema = z.object({
  plate: z
    .string()
    .min(1, 'plate query param is required')
    .transform(v => normalisePlate(v.toUpperCase().replace(/\s+/g, ' '))),
});

export type RegisterVehicleInput = z.infer<typeof RegisterVehicleSchema>;
