import { Candidate } from "@/graphql/generated/graphql";

export const checkCandidateFields = (
  object: any,
  fields: (keyof Candidate)[],
) => {
  return fields.every((field) => object[field]);
};
