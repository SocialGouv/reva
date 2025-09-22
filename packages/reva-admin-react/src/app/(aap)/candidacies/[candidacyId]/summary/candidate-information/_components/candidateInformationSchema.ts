import { isBefore, sub, toDate } from "date-fns";
import { z } from "zod";

import { GenderEnum } from "@/constants/genders.constant";

const defaultErrorMessage = "Merci de remplir ce champ";

export const candidateInformationSchema = z
  .object({
    gender: z.nativeEnum(GenderEnum).default(GenderEnum.undisclosed),
    lastname: z.string().min(1, defaultErrorMessage),
    givenName: z.string().optional(),
    firstname: z.string().min(1, defaultErrorMessage),
    firstname2: z.string().optional(),
    firstname3: z.string().optional(),
    birthdate: z.string(),
    country: z.string().min(1, defaultErrorMessage).default("France"),
    birthDepartment: z.string().optional(),
    birthCity: z.string().min(1, defaultErrorMessage),
    nationality: z.string().min(1, defaultErrorMessage),
    countryIsFrance: z.boolean(),
    street: z.string().min(1, defaultErrorMessage),
    city: z.string().min(1, defaultErrorMessage),
    zip: z
      .string()
      .min(5, "Le code postal doit contenir au moins 5 chiffres")
      .regex(/^\d{5}$/, "Le code postal est invalide"),
    addressComplement: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.birthdate) {
      const date = toDate(data.birthdate);
      if (date.toString() === "Invalid Date") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La date de naissance est invalide",
          path: ["birthdate"],
        });
      }

      const today = new Date();

      const sixteenYearsAgo = sub(today, { years: 16 });
      const candidateBirthdayIsOlderThan16YearsAgo = isBefore(
        date,
        sixteenYearsAgo,
      );

      if (!candidateBirthdayIsOlderThan16YearsAgo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le candidat doit avoir plus de 16 ans",
          path: ["birthdate"],
        });
      }
    } else {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Merci de remplir ce champ",
        path: ["birthdate"],
      });
    }

    if (data.countryIsFrance && !data.birthDepartment?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Merci de remplir ce champ",
        path: ["birthDepartment"],
      });
    }

    return data;
  });

export type FormCandidateInformationData = z.infer<
  typeof candidateInformationSchema
>;
