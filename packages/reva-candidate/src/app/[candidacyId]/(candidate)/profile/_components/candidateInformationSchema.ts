import { isBefore, sub, toDate } from "date-fns";
import { z } from "zod";

import { GenderEnum } from "@/constants/genders.constant";
import { deserializeStringToPhoneNumberStructure } from "@/utils/deserializeStringToPhoneNumberStructure.util";

const defaultErrorMessage = "Merci de remplir ce champ";

export const candidateInformationSchema = (inputShouldBeDisabled: boolean) =>
  z
    .object({
      gender: z.nativeEnum(GenderEnum).default(GenderEnum.undisclosed),
      lastname: z.string().min(1, defaultErrorMessage),
      givenName: z.string().optional(),
      firstname: z.string().min(1, defaultErrorMessage),
      firstname2: z.string().optional(),
      firstname3: z.string().optional(),
      birthdate: z.string().optional(),
      country: z.string().min(1, defaultErrorMessage).default("France"),
      birthDepartment: z.string().optional(),
      birthCity: z.string().optional(),
      nationality: z.string().optional(),
      countryIsFrance: z.boolean(),
      street: z.string().optional(),
      city: z.string().optional(),
      zip: z.union([
        z.string().regex(/^\d{5}$/, "Le code postal est invalide"),
        z.literal(""),
      ]),
      phone: z.string(),
      email: z.string().email(defaultErrorMessage),
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
      }

      const phoneNumberFormatted = deserializeStringToPhoneNumberStructure(
        data.phone,
      );

      if (
        phoneNumberFormatted.length >= 10 &&
        phoneNumberFormatted.length <= 14
      ) {
        data.phone = phoneNumberFormatted;
      } else {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le numéro de téléphone est invalide",
          path: ["phone"],
        });
      }

      if (
        data.countryIsFrance &&
        !data.birthDepartment?.length &&
        !inputShouldBeDisabled
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Merci de remplir ce champ",
          path: ["birthDepartment"],
        });
      }

      return data;
    });

export type FormCandidateInformationData = z.infer<
  ReturnType<typeof candidateInformationSchema>
>;
