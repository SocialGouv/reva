import { isBefore, sub, toDate } from "date-fns";
import { z } from "zod";

import { GenderEnum } from "@/constants/genders.constant";
import {
  sanitizedOptionalText,
  sanitizedText,
  sanitizedZipCode,
} from "@/utils/input-sanitization";

export const candidateInformationSchema = z
  .object({
    gender: z.nativeEnum(GenderEnum).default(GenderEnum.undisclosed),
    lastname: sanitizedText(),
    givenName: sanitizedOptionalText(),
    firstname: sanitizedText(),
    firstname2: sanitizedOptionalText(),
    firstname3: sanitizedOptionalText(),
    birthdate: sanitizedText(),
    country: sanitizedText().default("France"),
    birthDepartment: sanitizedOptionalText(),
    birthCity: sanitizedText(),
    nationality: sanitizedText(),
    countryIsFrance: z.boolean(),
    street: sanitizedText(),
    city: sanitizedText(),
    zip: sanitizedZipCode(),
    addressComplement: sanitizedOptionalText(),
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
