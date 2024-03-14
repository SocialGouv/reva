import { isBefore, sub } from "date-fns";
import { z } from "zod";

export enum GenderEnum {
  man = "man",
  undisclosed = "undisclosed",
  woman = "woman",
}

const defaultErrorMessage = "Ce champ est obligatoire";

export const candidateInformationSchema = z
  .object({
    gender: z.nativeEnum(GenderEnum).default(GenderEnum.undisclosed),
    lastName: z.string().min(1, defaultErrorMessage),
    givenName: z.string().optional(),
    firstName: z.string().min(1, defaultErrorMessage),
    firstName2: z.string().optional(),
    firstName3: z.string().optional(),
    birthdate: z.string(),
    country: z.string().min(1, defaultErrorMessage).default("France"),
    birthDepartment: z.string().optional(),
    birthCity: z.string().min(1, defaultErrorMessage),
    nationality: z.string().min(1, defaultErrorMessage),
    socialSecurityNumber: z.string().min(1, defaultErrorMessage),
    street: z.string().min(1, defaultErrorMessage),
    city: z.string().min(1, defaultErrorMessage),
    postalCode: z.string().min(1, defaultErrorMessage),
    phone: z.string().min(1, defaultErrorMessage),
    email: z.string().min(1, defaultErrorMessage),
    countryIsFrance: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.birthdate) {
      const date = new Date(data.birthdate);
      if (date.toString() === "Invalid Date") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La date de naissance est invalide",
          path: ["birthdate"],
        });
      }

      const today = new Date();

      const dateSelected = data.birthdate;
      const eighteenYearsAgo = sub(today, { years: 18 });
      const candidateBirthdayIsOlderThan18YearsAgo = isBefore(
        dateSelected,
        eighteenYearsAgo,
      );

      if (!candidateBirthdayIsOlderThan18YearsAgo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le candidat doit être majeur",
          path: ["birthdate"],
        });
      }
    }

    if (data.countryIsFrance && !data.birthDepartment?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ce champ est obligatoire",
        path: ["birthDepartment"],
      });
    }

    return data;
  });

export type FormCandidateInformationData = z.infer<
  typeof candidateInformationSchema
>;
