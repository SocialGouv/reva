import { Candidate } from "@/graphql/generated/graphql";

export const checkCandidateFields = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  object: any,
  fields: (keyof Candidate)[],
) => {
  return fields.every((field) => object[field]);
};
