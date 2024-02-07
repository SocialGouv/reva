import { z } from "zod";

export const maisonMereAAPFormSchema = z.object({
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

export type MaisonMereAAPFormSchema = z.infer<typeof maisonMereAAPFormSchema>;
