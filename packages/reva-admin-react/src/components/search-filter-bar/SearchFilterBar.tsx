import { Button } from "@codegouvfr/react-dsfr/Button";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { ReactNode, useEffect, useState } from "react";

const SearchResultsHeader = ({
  defaultSearchFilter,
  onSearchFilterChange,
  resultCount,
  addButton,
}: {
  defaultSearchFilter: string;
  onSearchFilterChange: (filter: string) => void;
  resultCount: number;
  addButton: ReactNode;
}) => {
  const resultCountLabel = `${resultCount} résultat${
    resultCount > 1 ? "s" : ""
  }`;
  return (
    <div className="flex justify-between">
      {defaultSearchFilter ? (
        <div>
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
        </div>
      ) : (
        <div className="text-xs text-neutral-500">{resultCountLabel}</div>
      )}
      {addButton && addButton}
    </div>
  );
};

export const SearchFilterBar = ({
  className,
  lifted = false,
  title,
  searchFilter: defaultSearchFilter,
  onSearchFilterChange,
  resultCount,
  placeholder = "Rechercher",
  addButton,
}: {
  className: string;
  lifted?: boolean;
  title?: string;
  searchFilter: string;
  onSearchFilterChange: (filter: string) => void;
  resultCount: number;
  placeholder?: string;
  addButton?: ReactNode;
}) => {
  const [searchFilter, setSearchFilter] = useState(defaultSearchFilter);
  useEffect(() => {
    setSearchFilter(defaultSearchFilter);
  }, [defaultSearchFilter]);

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        className={`${lifted ? "lg:p-8 lg:shadow-lifted lg:border-b-4 lg:border-[#CFCFCF] mb-12" : "mb-6"}`}
      >
        {title && <h2>{title}</h2>}
        <SearchBar
          big={lifted}
          onButtonClick={onSearchFilterChange}
          allowEmptySearch
          label={placeholder}
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
      </div>
      <SearchResultsHeader
        defaultSearchFilter={defaultSearchFilter}
        onSearchFilterChange={onSearchFilterChange}
        resultCount={resultCount}
        addButton={addButton}
      />
    </div>
  );
};
