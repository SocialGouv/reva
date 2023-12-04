import { z } from "zod";

export const agenceFormSchema = z.object({
  adresseNumeroEtNomDeRue: z
    .string()
    .length(5, "Ce champs doit contenir au moins 5 caractères")
    .default(""),
  adresseInformationsComplementaires: z.string().optional().default(""),
  adresseCodePostal: z
    .string()
    .length(5, "Ce champs doit contenir au moins 5 caractères")
    .default(""),
  adresseVille: z
    .string()
    .length(5, "Ce champs doit contenir au moins 5 caractères")
    .default(""),
  nom: z.string().optional().default(""),
  telephone: z
    .string()
    .length(10, "Ce champs doit contenir 10 chiffres")
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
  agenceVisible: z.boolean().default(false),
  zoneInterventionPresentiel: z
    .array(
      z
        .object({
          id: z.string(),
          label: z.string(),
          isSelected: z.boolean(),
          departments: z
            .array(
              z.object({
                id: z.string(),
                label: z.string(),
                isSelected: z.boolean(),
              }),
            )
            .default([]),
        })
        .default({
          id: "",
          label: "",
          isSelected: false,
          departments: [],
        }),
    )
    .default([]),
  zoneInterventionDistanciel: z
    .array(
      z
        .object({
          id: z.string(),
          label: z.string(),
          isSelected: z.boolean(),
          departments: z
            .array(
              z.object({
                id: z.string(),
                label: z.string(),
                isSelected: z.boolean(),
              }),
            )
            .default([]),
        })
        .default({
          id: "",
          label: "",
          isSelected: false,
          departments: [],
        }),
    )
    .default([]),
});

export type AgenceFormData = z.infer<typeof agenceFormSchema>;
