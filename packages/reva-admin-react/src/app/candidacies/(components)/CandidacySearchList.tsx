import { WhiteCard } from "@/components/card/white-card/WhiteCard";
import Button from "@codegouvfr/react-dsfr/Button";
import {
  SearchList,
  SearchListProps,
} from "@/components/search/search-list/SearchList";

type CandidacySearchResult<T> = T & {
  id: string;
  candidacy: {
    id: string;
    certification?: { label: string } | null;
    candidate?: { firstname: string; lastname: string } | null;
    department?: { code: string; label: string } | null;
  };
};

export const CandidacySearchList = <T,>({
  title,
  searchFilter,
  updateSearchFilter,
  searchResultsPage,
  searchResultLink,
  children,
}: SearchListProps<CandidacySearchResult<T>> & {
  searchResultLink: (candidacyId: string) => string;
}) => {
  if (!searchResultsPage) return null;
  return (
    <SearchList<CandidacySearchResult<T>>
      title={title}
      searchFilter={searchFilter}
      searchResultsPage={searchResultsPage}
      updateSearchFilter={updateSearchFilter}
    >
      {(r) => (
        <WhiteCard key={r.id} className="grid grid-cols-2 gap-2">
          <h3 className="text-xl font-semibold col-span-2">
            {r.candidacy.certification?.label}
          </h3>

          <p className="text-lg uppercase">
            {r.candidacy.candidate?.firstname} {r.candidacy.candidate?.lastname}
          </p>
          <p className="text-lg">
            {r.candidacy.department?.label} ({r.candidacy.department?.code})
          </p>
          {children?.(r)}
          <Button
            className="ml-auto col-start-2"
            linkProps={{
              href: searchResultLink(r.candidacy.id),
            }}
          >
            Accéder à la candidature
          </Button>
        </WhiteCard>
      )}
    </SearchList>
  );
};
