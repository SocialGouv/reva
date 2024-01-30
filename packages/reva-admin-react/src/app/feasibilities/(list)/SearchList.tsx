import { WhiteCard } from "@/components/card/white-card/WhiteCard";
import { Pagination } from "@/components/pagination/Pagination";
import { SearchFilterBar } from "@/components/search-filter-bar/SearchFilterBar";
import {
  DossierDeValidation,
  DossierDeValidationPage,
  Feasibility,
  FeasibilityPage,
} from "@/graphql/generated/graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns/format";

interface SearchListProps {
  categoryLabel: string;
  category: string;
  searchFilter: string;
  updateSearchFilter: (searchFilter: string) => void;
  searchResults: DossierDeValidationPage | FeasibilityPage;
  currentPage: number;
  baseHref: string;
}

const SearchList = ({
  categoryLabel,
  category,
  searchFilter,
  updateSearchFilter,
  searchResults,
  currentPage,
  baseHref,
}: SearchListProps) => {
  if (!searchResults) return null;
  return (
    <>
      <h4 className="text-3xl font-bold mb-6">{categoryLabel}</h4>

      <SearchFilterBar
        className="mb-6"
        searchFilter={searchFilter}
        resultCount={searchResults.info.totalRows}
        onSearchFilterChange={updateSearchFilter}
      />

      <ul className="flex flex-col gap-5">
        {searchResults.rows.map((r) => (
          <WhiteCard key={r.id} className="grid grid-cols-2 gap-2">
            <h3 className="text-xl font-semibold col-span-2">
              {r.candidacy.certification?.label}
            </h3>

            <p className="text-lg uppercase">
              {r.candidacy.candidate?.firstname}{" "}
              {r.candidacy.candidate?.lastname}
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
              linkProps={{ href: `${baseHref}/${r.id}` }}
            >
              Accéder au dossier
            </Button>
          </WhiteCard>
        ))}
      </ul>

      <br />
      <Pagination
        totalPages={searchResults.info.totalPages}
        currentPage={currentPage}
        baseHref={baseHref}
        baseParams={{ CATEGORY: category || "ALL" }}
        className="mx-auto"
      />
    </>
  );
};

export default SearchList;
