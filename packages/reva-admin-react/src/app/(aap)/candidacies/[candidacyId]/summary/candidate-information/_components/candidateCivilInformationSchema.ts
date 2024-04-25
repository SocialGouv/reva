import { GenderEnum } from "@/constants";
import { isBefore, sub } from "date-fns";
import { z } from "zod";

const defaultErrorMessage = "Ce champ est obligatoire";

export const candidateCivilInformationSchema = z
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

      const dateSelected = new Date(data.birthdate);
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

export type FormCandidateCivilInformationData = z.infer<
  typeof candidateCivilInformationSchema
>;
