import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useEffect, useState } from "react";

export const SearchFilterBar = ({
  className,
  searchFilter: defaultSearchFilter,
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

  const [searchFilter, setSearchFilter] = useState(defaultSearchFilter);
  useEffect(() => {
    setSearchFilter(defaultSearchFilter);
  }, [defaultSearchFilter]);

  return (
    <div className={`flex flex-col ${className}`}>
      <SearchBar
        className="mb-6"
        onButtonClick={onSearchFilterChange}
        allowEmptySearch
        renderInput={({ className, id, placeholder, type }) => (
          <input
            id={id}
            className={className}
            placeholder={placeholder}
            type={type}
            value={searchFilter}
            onChange={(event) => setSearchFilter(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") {
                return;
              }

              if (event.currentTarget.value !== "") {
                return;
              }

              event.preventDefault();
              event.stopPropagation();

              onSearchFilterChange("");
            }}
          />
        )}
      />
      {defaultSearchFilter ? (
        <>
          <div className="text-xs text-neutral-500">
            {resultCountLabel} pour « {defaultSearchFilter} »
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
        <div className="text-xs text-neutral-500">{resultCountLabel}</div>
      )}
    </div>
  );
};
