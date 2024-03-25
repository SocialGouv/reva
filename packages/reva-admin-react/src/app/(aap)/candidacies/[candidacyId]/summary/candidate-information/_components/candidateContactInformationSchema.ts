import { z } from "zod";

const defaultErrorMessage = "Ce champ est obligatoire";

export const candidateContactInformationSchema = z.object({
  street: z.string().min(1, defaultErrorMessage),
  city: z.string().min(1, defaultErrorMessage),
  zip: z.string().min(5, defaultErrorMessage),
  phone: z.string().length(10, defaultErrorMessage),
  email: z.string().email(defaultErrorMessage),
});

export type FormCandidateContactInformationData = z.infer<
  typeof candidateContactInformationSchema
>;
