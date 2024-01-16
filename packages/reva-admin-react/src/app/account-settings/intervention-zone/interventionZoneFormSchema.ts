import { z } from "zod";

export const interventionZoneFormSchema = z.object({
  typologie: z.enum(["generaliste", "expertFiliere", "expertBranche"]),
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

export type InterventionZoneFormData = z.infer<
  typeof interventionZoneFormSchema
>;
