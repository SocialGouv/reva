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
    if (searchFilter.length > 100) {
      throw new Error(
        "Veuillez réduire le nombre de caractères présents dans votre recherche."
      );
    }

    const words = searchFilter.split(/\s+/);
    if (words.length > 12) {
      throw new Error(
        "Veuillez réduire le nombre de mots présents dans votre recherche."
      );
    }
    return { AND: words.map(createWhereInput) };
  }
  return {};
};
