import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useEffect, useState } from "react";

export const SearchFilterBar = ({
  className,
  lifted = false,
  title,
  searchFilter: defaultSearchFilter,
  onSearchFilterChange,
  resultCount,
  placeholder = "Rechercher",
}: {
  className: string;
  lifted?: boolean;
  title?: string;
  searchFilter: string;
  onSearchFilterChange: (filter: string) => void;
  resultCount: number;
  placeholder?: string;
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
