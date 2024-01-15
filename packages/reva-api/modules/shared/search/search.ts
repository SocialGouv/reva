import { Prisma } from "@prisma/client";

export const buildContainsFilterClause =
  (searchFilter: string) => (field: string) => ({
    [field]: { contains: searchFilter, mode: "insensitive" },
  });

export const getWhereClauseFromSearchFilter = (
  createWhereInput: (word: string) => Prisma.CandidacyWhereInput,
  searchFilter?: string
) => {
  if (searchFilter) {
    return createWhereInput(searchFilter);
  }
  return {};
};
