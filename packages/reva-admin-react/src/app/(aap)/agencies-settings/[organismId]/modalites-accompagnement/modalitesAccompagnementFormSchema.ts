import { z } from "zod";

export const modalitesAccompagnementFormSchema = z
  .object({
    nom: z.string().min(1, "Merci de remplir ce champ"),
    telephone: z.string().optional().default(""),
    siteInternet: z.string().optional().default(""),
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
    isOnSite: z.boolean(),
    isRemote: z.boolean(),
    isRemoteFranceMetropolitaine: z.boolean(),
    isRemoteGuadeloupe: z.boolean(),
    isRemoteGuyane: z.boolean(),
    isRemoteMartinique: z.boolean(),
    isRemoteMayotte: z.boolean(),
    isRemoteLaReunion: z.boolean(),
    adresseNumeroEtNomDeRue: z.string().optional().default(""),
    adresseInformationsComplementaires: z.string().optional().default(""),
    adresseCodePostal: z
      .string()
      .regex(
        /^(\d{5}|)$/,
        "Ce champ doit être vide ou contenir un code postal",
      ),
    adresseVille: z.string().optional().default(""),
    conformeNormesAccessbilite: z
      .enum([
        "CONFORME",
        "NON_CONFORME",
        "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC",
      ])
      .nullable(),
  })
  .superRefine(
    (
      {
        isOnSite,
        isRemote,
        adresseNumeroEtNomDeRue,
        adresseCodePostal,
        adresseVille,
        conformeNormesAccessbilite,
        isRemoteFranceMetropolitaine,
        isRemoteGuadeloupe,
        isRemoteGuyane,
        isRemoteLaReunion,
        isRemoteMartinique,
        isRemoteMayotte,
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

      if (isOnSite) {
        [
          {
            fieldName: "adresseNumeroEtNomDeRue",
            fieldValue: adresseNumeroEtNomDeRue,
          },
          {
            fieldName: "adresseCodePostal",
            fieldValue: adresseCodePostal,
          },
          {
            fieldName: "adresseVille",
            fieldValue: adresseVille,
          },
          {
            fieldName: "conformeNormesAccessbilite",
            fieldValue: conformeNormesAccessbilite,
          },
        ].forEach(assertRequiredField);
      }
      if (isRemote) {
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
            path: ["isRemote"],
            message: "Au moins une case doit être cochée",
            code: z.ZodIssueCode.custom,
          });
        }
      }
    },
  );

export type ModalitesAccompagnementFormData = z.infer<
  typeof modalitesAccompagnementFormSchema
>;
