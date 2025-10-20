import { z } from "zod";

export const informationRemoteFormSchema = z
  .object({
    nomPublic: z.string(),
    telephone: z.string().optional(),
    siteInternet: z.string().optional(),
    emailContact: z
      .union([
        z
          .string()
          .length(
            0,
            "Le champ doit être vide ou contenir une adresse électronique",
          ),
        z
          .string()
          .email(
            "Le champ doit être vide ou contenir une adresse électronique",
          ),
      ])
      .optional()
      .default(""),
    isRemoteFranceMetropolitaine: z.boolean(),
    isRemoteGuadeloupe: z.boolean(),
    isRemoteGuyane: z.boolean(),
    isRemoteMartinique: z.boolean(),
    isRemoteMayotte: z.boolean(),
    isRemoteLaReunion: z.boolean(),
    isRemoteSaintPierreEtMiquelon: z.boolean(),
    isRemoteSainteLucieSaintMartin: z.boolean(),
  })
  .superRefine(
    (
      {
        isRemoteFranceMetropolitaine,
        isRemoteGuadeloupe,
        isRemoteGuyane,
        isRemoteLaReunion,
        isRemoteMartinique,
        isRemoteMayotte,
        nomPublic,
        emailContact,
        telephone,
      },
      { addIssue },
    ) => {
      const assertRequiredField = ({
        fieldName,
        fieldValue,
      }: {
        fieldName: string;
        fieldValue: unknown;
      }) => {
        if (!fieldValue) {
          addIssue({
            path: [fieldName],
            message: "Merci de remplir ce champ",
            code: z.ZodIssueCode.custom,
          });
        }
      };
      [
        {
          fieldName: "nomPublic",
          fieldValue: nomPublic,
        },
        {
          fieldName: "emailContact",
          fieldValue: emailContact,
        },
        {
          fieldName: "telephone",
          fieldValue: telephone,
        },
      ].forEach(assertRequiredField);
      if (
        ![
          isRemoteFranceMetropolitaine,
          isRemoteGuadeloupe,
          isRemoteGuyane,
          isRemoteLaReunion,
          isRemoteMartinique,
          isRemoteMayotte,
        ].some((r) => !!r)
      ) {
        addIssue({
          path: ["isRemoteFranceMetropolitaine"],
          message: "Au moins une case doit être cochée",
          code: z.ZodIssueCode.custom,
        });
      }
    },
  );

export type InformationRemoteFormData = z.infer<
  typeof informationRemoteFormSchema
>;
