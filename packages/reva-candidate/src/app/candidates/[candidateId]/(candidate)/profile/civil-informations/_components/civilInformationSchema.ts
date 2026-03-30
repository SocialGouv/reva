import { isBefore, sub, toDate } from "date-fns";
import { z } from "zod";

import { GenderEnum } from "@/constants/genders.constant";
import {
  sanitizedOptionalText,
  sanitizedText,
} from "@/utils/input-sanitization";

export const civilInformationSchema = () =>
  z
    .object({
      gender: z
        .nativeEnum(GenderEnum, {
          invalid_type_error: "Une de ces options doit être sélectionnée.",
        })
        .default(GenderEnum.undisclosed),
      lastname: sanitizedText(),
      givenName: sanitizedOptionalText(),
      firstname: sanitizedText(),
      firstname2: sanitizedOptionalText(),
      firstname3: sanitizedOptionalText(),
      middleNames: sanitizedOptionalText(),
      birthdate: sanitizedText(),
      country: sanitizedText().default("France"),
      birthDepartment: sanitizedOptionalText(),
      birthCity: sanitizedText(),
      nationality: sanitizedText(),
      countryIsFrance: z.boolean(),
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

export type FormCivilInformationData = z.infer<
  ReturnType<typeof civilInformationSchema>
>;
