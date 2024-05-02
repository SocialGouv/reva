import { SyntheticEvent } from "react";

interface SearchBarProps {
  label: string;
  value: string;
  setValue: (e: any) => void;
  onSubmit: () => void;
  className?: string;
}

export const SearchBar = ({
  label,
  value,
  setValue,
  onSubmit,
  className,
}: SearchBarProps) => {
  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      className={`fr-search-bar fr-search-bar--lg ${className || ""}`}
      role="search"
      onSubmit={handleSubmit}
    >
      <input
        className="fr-input"
        placeholder={label}
        type="search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
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
