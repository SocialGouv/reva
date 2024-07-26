import { z } from "zod";

export const informationsGeneralesRemoteFormSchema = z
  .object({
    nom: z.string(),
    telephone: z.string().optional(),
    siteInternet: z.string().optional(),
    emailContact: z
      .union([
        z
          .string()
          .length(0, "Le champ doit être vide ou contenir une adresse email"),
        z
          .string()
          .email("Le champ doit être vide ou contenir une adresse email"),
      ])
      .optional()
      .default(""),
    isNotRemote: z.boolean(),
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
        isNotRemote,
        isRemoteFranceMetropolitaine,
        isRemoteGuadeloupe,
        isRemoteGuyane,
        isRemoteLaReunion,
        isRemoteMartinique,
        isRemoteMayotte,
        nom,
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
          console.log({ fieldValue });
          addIssue({
            path: [fieldName],
            message: "Merci de remplir ce champ",
            code: z.ZodIssueCode.custom,
          });
        }
      };
      if (!isNotRemote) {
        [
          {
            fieldName: "nom",
            fieldValue: nom,
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
      }
    },
  );

export type InformationsGeneralesRemoteFormData = z.infer<
  typeof informationsGeneralesRemoteFormSchema
>;
