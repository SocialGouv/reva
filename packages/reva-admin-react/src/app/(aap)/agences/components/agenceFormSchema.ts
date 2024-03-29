import { z } from "zod";

export const agenceFormSchema = z.object({
  firstname: z
    .string()
    .min(2, "Ce champ doit contenir au moins 2 caractères")
    .default(""),
  lastname: z
    .string()
    .min(2, "Ce champ doit contenir au moins 2 caractères")
    .default(""),
  email: z
    .string()
    .email("Le champ doit contenir une adresse email")
    .default(""),
  adresseNumeroEtNomDeRue: z
    .string()
    .min(2, "Ce champ doit contenir au moins 2 caractères")
    .default(""),
  adresseInformationsComplementaires: z.string().optional().default(""),
  adresseCodePostal: z
    .string()
    .min(5, "Ce champ doit contenir au moins 5 caractères")
    .default(""),
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
  zoneInterventionPresentiel: z
    .array(
      z
        .object({
          id: z.string(),
          label: z.string(),
          selected: z.boolean(),
          children: z
            .array(
              z.object({
                id: z.string(),
                label: z.string(),
                selected: z.boolean(),
              }),
            )
            .default([]),
        })
        .default({
          id: "",
          label: "",
          selected: false,
          children: [],
        }),
    )
    .default([]),
  zoneInterventionDistanciel: z
    .array(
      z
        .object({
          id: z.string(),
          label: z.string(),
          selected: z.boolean(),
          children: z
            .array(
              z.object({
                id: z.string(),
                label: z.string(),
                selected: z.boolean(),
              }),
            )
            .default([]),
        })
        .default({
          id: "",
          label: "",
          selected: false,
          children: [],
        }),
    )
    .default([]),
});

export type AgenceFormData = z.infer<typeof agenceFormSchema>;
