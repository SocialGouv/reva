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
    <div className={`flex justify-between items-center ${className ?? ""}`}>
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
