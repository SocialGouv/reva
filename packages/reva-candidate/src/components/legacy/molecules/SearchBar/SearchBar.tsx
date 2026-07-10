import { useEffect, useState } from "react";

interface SearchBarProps {
  label: string;
  searchFilter: string;
  onSearchFilterChange: (filter: string) => void;
  className?: string;
  debounceMs?: number;
}

export const SearchBar = ({
  label,
  searchFilter: defaultSearchFilter,
  onSearchFilterChange,
  className,
  debounceMs,
}: SearchBarProps) => {
  const [searchFilter, setSearchFilter] = useState(defaultSearchFilter);
  useEffect(() => {
    setSearchFilter(defaultSearchFilter);
  }, [defaultSearchFilter]);

  // Recherche live debouncée (opt-in) : lance la recherche après `debounceMs`
  // sans frappe. Gardé sur la valeur courante pour éviter la boucle et le tir au montage.
  useEffect(() => {
    if (!debounceMs || searchFilter === defaultSearchFilter) {
      return;
    }
    const timer = setTimeout(
      () => onSearchFilterChange(searchFilter),
      debounceMs,
    );
    return () => clearTimeout(timer);
  }, [debounceMs, searchFilter, defaultSearchFilter, onSearchFilterChange]);

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
