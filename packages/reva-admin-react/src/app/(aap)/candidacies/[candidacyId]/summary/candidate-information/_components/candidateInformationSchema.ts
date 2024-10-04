import { GenderEnum } from "@/constants";
import { deserializeStringToPhoneNumberStructure } from "@/utils";
import { isBefore, sub } from "date-fns";
import { z } from "zod";

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
    phone: z.string(),
    email: z.string().email(defaultErrorMessage),
    addressComplement: z.string().optional(),
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
      const sixteenYearsAgo = sub(today, { years: 16 });
      const candidateBirthdayIsOlderThan16YearsAgo = isBefore(
        dateSelected,
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
