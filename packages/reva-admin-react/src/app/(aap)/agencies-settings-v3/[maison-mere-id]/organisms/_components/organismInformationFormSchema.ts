import { z } from "zod";

const AddressFragmentsSchema = z.object({
  adresseNumeroEtNomDeRue: z.string().min(1, "Rue requise"),
  adresseCodePostal: z.string().min(1, "Code postal requis"),
  adresseVille: z.string().min(1, "Ville requise"),
});

export const organismInformationFormSchema = z
  .object({
    adresseComplete: z.string().trim().default(""),
    adresseFragments: AddressFragmentsSchema.optional(),
    adresseInformationsComplementaires: z.string().optional().default(""),
    nomPublic: z
      .string()
      .min(2, "Ce champ doit contenir au moins 2 caractères")
      .default(""),
    telephone: z
      .string()
      .length(10, "Ce champ doit contenir 10 chiffres")
      .default(""),
    siteInternet: z.string().optional().default(""),
    emailContact: z
      .string()
      .email("Le champ doit contenir une adresse électronique")
      .default(""),
    conformeNormesAccessibilite: z
      .enum(["CONFORME", "NON_CONFORME", ""])
      .superRefine((val, ctx) => {
        if (val === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ce champ est requis",
          });
        }
      }),
  })
  .superRefine((val, ctx) => {
    if (!val.adresseFragments) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["adresseComplete"],
        message: "Veuillez saisir puis sélectionner une adresse.",
      });
    }
  })
  .transform(({ adresseFragments, adresseComplete: _omit, ...rest }) => ({
    ...rest,
    ...adresseFragments,
  }))
  .pipe(
    z.object({
      adresseNumeroEtNomDeRue: z.string(),
      adresseCodePostal: z.string(),
      adresseVille: z.string(),
      adresseInformationsComplementaires: z.string().optional().default(""),
      nomPublic: z.string(),
      telephone: z.string(),
      siteInternet: z.string().optional().default(""),
      emailContact: z.string().email(),
      conformeNormesAccessibilite: z.enum(["CONFORME", "NON_CONFORME"]),
    }),
  );

export type OrganismInformationInputData = z.input<
  typeof organismInformationFormSchema
>;

export type OrganismInformationOutputData = z.output<
  typeof organismInformationFormSchema
>;
