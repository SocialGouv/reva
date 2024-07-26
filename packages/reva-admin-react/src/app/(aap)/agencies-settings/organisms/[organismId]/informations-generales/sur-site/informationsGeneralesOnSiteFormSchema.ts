import { z } from "zod";

export const informationsGeneralesOnSiteFormSchema = z.object({
  nom: z.string().min(1, "Merci de remplir ce champ"),
  adresseNumeroEtNomDeRue: z.string().min(1, "Merci de remplir ce champ"),
  adresseInformationsComplementaires: z.string().optional().default(""),
  adresseCodePostal: z
    .string()
    .min(1, "Merci de remplir ce champ")
    .regex(/^(\d{5}|)$/, "Ce champ doit être vide ou contenir un code postal"),
  adresseVille: z.string().min(1, "Merci de remplir ce champ"),
  telephone: z.string().min(1, "Merci de remplir ce champ"),
  emailContact: z
    .union([
      z
        .string()
        .length(0, "Le champ doit être vide ou contenir une adresse email"),
      z.string().email("Le champ doit être vide ou contenir une adresse email"),
    ])
    .optional()
    .default(""),
  siteInternet: z.string().optional().default(""),
  conformeNormesAccessbilite: z.enum([
    "CONFORME",
    "NON_CONFORME",
    "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC",
  ]),
});

export type InformationsGeneralesOnSiteFormData = z.infer<
  typeof informationsGeneralesOnSiteFormSchema
>;
