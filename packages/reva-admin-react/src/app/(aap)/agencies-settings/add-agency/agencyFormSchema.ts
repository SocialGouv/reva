import { z } from "zod";

export const agencyFormSchema = z.object({
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
  nom: z
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
  conformeNormesAccessbilite: z.enum([
    "CONFORME",
    "NON_CONFORME",
    "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC",
  ]),
  organismDegrees: z
    .object({ id: z.string(), label: z.string(), checked: z.boolean() })
    .array(),
  organismDomaines: z
    .object({ id: z.string(), label: z.string(), checked: z.boolean() })
    .array(),
});

export type AgencyFormData = z.infer<typeof agencyFormSchema>;
