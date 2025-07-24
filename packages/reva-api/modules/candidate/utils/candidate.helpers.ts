import { buildContainsFilterClause } from "@/modules/shared/search/search";

export const candidateSearchWord = (word: string) => {
  const containsFilter = buildContainsFilterClause(word);
  return {
    OR: [
      containsFilter("lastname"),
      containsFilter("givenName"),
      containsFilter("firstname"),
      containsFilter("firstname2"),
      containsFilter("firstname3"),
      containsFilter("email"),
      containsFilter("phone"),
    ],
  };
};
