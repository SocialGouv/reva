import { Button } from "@codegouvfr/react-dsfr/Button";
import { ReactNode } from "react";

export const SearchResultsHeader = ({
  defaultSearchFilter,
  onSearchFilterChange,
  resultCount,
  addButton,
  className,
}: {
  defaultSearchFilter: string;
  onSearchFilterChange: (filter: string) => void;
  resultCount: number;
  addButton: ReactNode;
  className?: string;
}) => {
  const resultCountLabel = `${resultCount} résultat${
    resultCount > 1 ? "s" : ""
  }`;
  return (
    <div
      className={`flex justify-between items-end ${className ?? ""} [&_select]:overflow-hidden [&_select]:text-ellipsis [&_select]:whitespace-nowrap`}
    >
      {defaultSearchFilter ? (
        <div>
          <Button priority="secondary" onClick={() => onSearchFilterChange("")}>
            Réinitialiser la recherche
          </Button>

          <div className="text-xs text-neutral-500 mt-2">
            {resultCountLabel} pour « {defaultSearchFilter} »
          </div>
        </div>
      ) : (
        <div className="text-xs text-neutral-500">{resultCountLabel}</div>
      )}
      {addButton && addButton}
    </div>
  );
};
