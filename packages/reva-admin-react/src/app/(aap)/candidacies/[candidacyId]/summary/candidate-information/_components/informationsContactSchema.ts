import { z } from "zod";

export const informationsContactSchema = z.object({
  street: z.string(),
  city: z.string(),
  postalCode: z.string(),
  phone: z.string(),
  email: z.string(),
});

export type FormInformationsContactData = z.infer<
  typeof informationsContactSchema
>;
