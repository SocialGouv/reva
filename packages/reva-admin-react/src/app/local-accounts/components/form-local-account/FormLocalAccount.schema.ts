import { z } from "zod";

export const LocalAccountFormSchema = z.object({
  firstname: z.string().optional().default(""),
  lastname: z
    .string()
    .min(2, "Ce champ doit contenir au moins 2 caractères")
    .default(""),
  email: z
    .string()
    .email("Le champ doit contenir une adresse email")
    .default(""),
});

export type LocalAccountFormData = z.infer<typeof LocalAccountFormSchema>;
