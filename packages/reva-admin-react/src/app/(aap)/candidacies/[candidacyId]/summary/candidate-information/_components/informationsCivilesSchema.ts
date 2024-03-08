import { z } from "zod";

export enum GenderEnum {
  man = "man",
  undisclosed = "undisclosed",
  woman = "woman",
}

export const informationsCivilesSchema = z.object({
  gender: z.nativeEnum(GenderEnum).default(GenderEnum.undisclosed),
  lastName: z.string(),
  usename: z.string().optional(),
  firstName: z.string(),
  firstName2: z.string().optional(),
  firstName3: z.string().optional(),
  birthdate: z.date(),
  country: z.string().default("France"),
  birthDepartment: z.string(),
  birthCity: z.string(),
  nationality: z.string(),
  securiteSocialeNumber: z.string(),
});

export type FormInformationsCivilesData = z.infer<
  typeof informationsCivilesSchema
>;
