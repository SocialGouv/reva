import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useEffect, useState } from "react";

export const SearchFilterBar = ({
  searchFilter: defaultSearchFilter,
  onSearchFilterChange,
  resultCount,
  className,
  placeholder = "Rechercher",
  big = false,
}: {
  searchFilter: string;
  onSearchFilterChange: (filter: string) => void;
  resultCount: number;
  className?: string;
  placeholder?: string;
  big?: boolean;
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
        big={big}
        renderInput={({ className, id, type }) => (
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
            }}
          />
        )}
      />
      {defaultSearchFilter ? (
        <>
          <div className="font-semibold text-xl">
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
        <div className="font-semibold text-xl">{resultCountLabel}</div>
      )}
    </div>
  );
};
