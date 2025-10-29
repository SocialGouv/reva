import { z } from "zod";

const REGEX_SPECIAL_CHARACTERS = /[&\\;`@{}[\]<>|~^$%#*+=/]/;
const REGEX_SPECIAL_CHARACTERS_MESSAGE =
  "Les caractères spéciaux ne sont pas autorisés";
const DEFAULT_MAX_LENGTH = 1000;

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
 * Zod schema for emails
 * Validates against special characters and enforces email pattern
 */
export const sanitizedEmail = () => {
  return z
    .string()
    .trim()
    .email("Le champ doit contenir une adresse électronique valide");
};
