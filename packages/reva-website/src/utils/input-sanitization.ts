import { z } from "zod";

const REGEX_SPECIAL_CHARACTERS = /[&\\;`@{}[\]<>|~^$%#*+=/]/;
const REGEX_SPECIAL_CHARACTERS_MESSAGE =
  "Les caractères spéciaux ne sont pas autorisés";
const REGEX_PHONE = /^\+?\d{10,12}$/;
const REGEX_PHONE_MESSAGE =
  "Le numéro de téléphone doit commencer par + (facultatif) suivi de 10 à 12 chiffres";
const DEFAULT_MAX_LENGTH = 10000;

/**
 * Zod schema for text
 * Validates against special characters and enforces length
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
 * Zod schema for phone numbers
 * Validates against special characters and enforces length
 */
export const sanitizedPhone = () => {
  return z.string().trim().regex(REGEX_PHONE, REGEX_PHONE_MESSAGE);
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

/**
 * Zod schema for URLs
 * Validates against special characters and enforces URL pattern
 */
export const sanitizedUrl = () => {
  return z.string().trim().url("Le champ doit contenir une URL valide");
};
