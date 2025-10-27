import { z } from "zod";

const REGEX_SPECIAL_CHARACTERS = /["&\\;)"@]/;
const REGEX_SPECIAL_CHARACTERS_MESSAGE =
  "Les caractères spéciaux ne sont pas autorisés";
const DEFAULT_MAX_LENGTH = 1000;

/**
 * Zod schema for personal names (firstname, lastname, etc.)
 * Validates against special characters and enforces minimum length
 */
export const sanitizedText = ({
  minLength = 1,
  maxLength = DEFAULT_MAX_LENGTH,
}: { minLength?: number; maxLength?: number } = {}) => {
  return z
    .string()
    .trim()
    .min(
      minLength,
      `Ce champ doit contenir au moins ${minLength === 1 ? "1 caractère" : `${minLength} caractères`}`,
    )
    .max(
      maxLength,
      `Ce champ doit contenir maximum ${maxLength === 1 ? "1 caractère" : `${maxLength} caractères`}`,
    )
    .refine(
      (value: string) => {
        if (!value) return true;
        return !REGEX_SPECIAL_CHARACTERS.test(value);
      },
      {
        message: REGEX_SPECIAL_CHARACTERS_MESSAGE,
      },
    );
};

/**
 * Zod schema for optional text
 * Validates against special characters and enforces length
 */
export const sanitizedOptionalText = ({
  maxLength = DEFAULT_MAX_LENGTH,
}: { maxLength?: number } = {}) => {
  return z
    .string()
    .optional()
    .transform((val) => val ?? "")
    .pipe(sanitizedText({ minLength: 0, maxLength }));
};

/**
 * Zod schema for phone numbers
 * Validates against special characters and enforces length
 */
export const sanitizedPhone = ({
  minLength = 10,
  maxLength = 12,
}: { minLength?: number; maxLength?: number } = {}) => {
  return z
    .string()
    .trim()
    .min(
      minLength,
      `Ce champ doit contenir minimum ${minLength === 1 ? "1 chiffre" : `${minLength} chiffres`}`,
    )
    .max(
      maxLength,
      `Ce champ doit contenir maximum ${maxLength === 1 ? "1 chiffre" : `${maxLength} chiffres`}`,
    )
    .refine(
      (value: string) => {
        if (!value) return true;
        return !REGEX_SPECIAL_CHARACTERS.test(value);
      },
      {
        message: REGEX_SPECIAL_CHARACTERS_MESSAGE,
      },
    );
};

/**
 * Zod schema for optional phone numbers
 * Validates against special characters and enforces length
 */
export const sanitizedOptionalPhone = ({
  maxLength = 12,
}: { maxLength?: number } = {}) => {
  return z
    .string()
    .optional()
    .transform((val) => val ?? "")
    .pipe(sanitizedPhone({ minLength: 0, maxLength }));
};

/**
 * Zod schema for zip codes
 * Validates against special characters and enforces numeric pattern
 */
export const sanitizedZipCode = ({ length = 5 }: { length?: number } = {}) => {
  const regex = new RegExp(`^\\d{${length}}$`);
  return z
    .string()
    .trim()
    .regex(regex, `Le code postal doit contenir ${length} chiffres`)
    .refine(
      (value: string) => {
        if (!value) return true;
        return !REGEX_SPECIAL_CHARACTERS.test(value);
      },
      {
        message: REGEX_SPECIAL_CHARACTERS_MESSAGE,
      },
    );
};

/**
 * Zod schema for emails
 * Validates against special characters and enforces email pattern
 */
export const sanitizedEmail = () => {
  return z
    .string()
    .trim()
    .email("Le champ doit contenir une adresse électronique valide");
};

/**
 * Zod schema for siret numbers
 * Enforces 14 digits pattern
 */
export const sanitizedSiret = () => {
  return z.string().regex(/^\d{14}$/, {
    message: "Le numéro de SIRET doit contenir 14 chiffres",
  });
};
