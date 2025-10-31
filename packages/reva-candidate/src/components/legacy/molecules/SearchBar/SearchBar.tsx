import { useEffect, useState } from "react";

interface SearchBarProps {
  label: string;
  searchFilter: string;
  onSearchFilterChange: (filter: string) => void;
  className?: string;
}

export const SearchBar = ({
  label,
  searchFilter: defaultSearchFilter,
  onSearchFilterChange,
  className,
}: SearchBarProps) => {
  const [searchFilter, setSearchFilter] = useState(defaultSearchFilter);
  useEffect(() => {
    setSearchFilter(defaultSearchFilter);
  }, [defaultSearchFilter]);

  return (
    <form
      className={`fr-search-bar fr-search-bar--lg ${className || ""}`}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();

        onSearchFilterChange(searchFilter);
      }}
    >
      <input
        className="fr-input"
        placeholder={label}
        data-testid="search-bar-input"
        type="search"
        value={searchFilter}
        onChange={(event) => {
          const { value } = event.currentTarget;

          if (defaultSearchFilter != "" && value == "") {
            onSearchFilterChange("");
          } else {
            setSearchFilter(event.currentTarget.value);
          }
        }}
      />
      <button
        className="fr-btn !bg-dsfrBlue-500"
        title="Rechercher"
        type="submit"
      >
        Rechercher
      </button>
    </form>
  );
};
