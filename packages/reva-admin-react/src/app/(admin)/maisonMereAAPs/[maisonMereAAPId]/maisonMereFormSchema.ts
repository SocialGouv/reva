import { z } from "zod";

const zoneInterventionShape = z
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
          .optional(),
      })
      .default({
        id: "",
        label: "",
        selected: false,
        children: [],
      }),
  )
  .default([]);

export const maisonMereAAPFormSchema = z.object({
  zoneInterventionPresentiel: zoneInterventionShape,
  zoneInterventionDistanciel: zoneInterventionShape,
});

export type MaisonMereAAPFormData = z.infer<typeof maisonMereAAPFormSchema>;
