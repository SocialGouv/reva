import { z } from "zod";

export const organismInformationFormSchema = z.object({
  adresseNumeroEtNomDeRue: z
    .string()
    .min(2, "Ce champ doit contenir au moins 2 caractères")
    .default(""),
  adresseInformationsComplementaires: z.string().optional().default(""),
  adresseCodePostal: z
    .string()
    .regex(/^(\d{5})$/, "Ce champ doit contenir un code postal"),
  adresseVille: z
    .string()
    .min(2, "Ce champ doit contenir au moins 2 caractères")
    .default(""),
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
    .email("Le champ doit contenir une adresse email")
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
});

export type OrganismInformationFormData = z.infer<
  typeof organismInformationFormSchema
>;
