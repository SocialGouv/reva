import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { Button } from "@codegouvfr/react-dsfr/Button";

export const SearchFilterBar = ({
  className,
  searchFilter,
  onSearchFilterChange,
  resultCount,
}: {
  className: string;
  searchFilter: string;
  onSearchFilterChange: (filter: string) => void;
  resultCount: number;
}) => {
  const resultCountLabel = `${resultCount} résultat${
    resultCount > 1 ? "s" : ""
  }`;

  return (
    <div className={`flex flex-col ${className}`}>
      <SearchBar className="mb-6" onButtonClick={onSearchFilterChange} />
      {searchFilter ? (
        <>
          <div className="font-semibold text-xl">
            {resultCountLabel} pour « {searchFilter} »
          </div>
          <Button
            className="mt-2"
            priority="secondary"
            onClick={() => onSearchFilterChange("")}
          >
            Réinitialiser le filtre
          </Button>
        </>
      ) : (
        <div className="font-semibold text-xl">{resultCountLabel}</div>
      )}
    </div>
  );
};
