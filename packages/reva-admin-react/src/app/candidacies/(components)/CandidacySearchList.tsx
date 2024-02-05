import { WhiteCard } from "@/components/card/white-card/WhiteCard";
import {
  DossierDeValidation,
  DossierDeValidationPage,
  Feasibility,
  FeasibilityPage,
} from "@/graphql/generated/graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns/format";
import { SearchList } from "@/components/search/search-list/SearchList";
interface SearchListProps {
  categoryLabel: string;
  searchFilter: string;
  updateSearchFilter: (searchFilter: string) => void;
  searchResults: DossierDeValidationPage | FeasibilityPage;
  currentPage: number;
  searchResultLink: (searchResultCandidacyId: string) => string;
}

export const CandidacySearchList = ({
  categoryLabel,
  searchFilter,
  updateSearchFilter,
  searchResults,
  currentPage,
  searchResultLink,
}: SearchListProps) => {
  if (!searchResults) return null;
  return (
    <SearchList
      title={categoryLabel}
      currentPage={currentPage}
      totalPages={searchResults.info.totalPages}
      searchFilter={searchFilter}
      searchResultsTotal={searchResults.info.totalRows}
      updateSearchFilter={updateSearchFilter}
    >
      {searchResults.rows.map((r) => (
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
          <p className="text-lg col-span-2">
            Dossier envoyé le{" "}
            {format(
              (r as Feasibility)?.feasibilityFileSentAt ||
                (r as DossierDeValidation)?.dossierDeValidationSentAt,
              "d MMM yyyy",
            )}
          </p>
          <Button
            className="ml-auto col-start-2"
            linkProps={{
              href: searchResultLink(r.candidacy.id),
            }}
          >
            Accéder au dossier
          </Button>
        </WhiteCard>
      ))}
    </SearchList>
  );
};
