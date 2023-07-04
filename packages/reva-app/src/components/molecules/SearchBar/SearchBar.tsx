import { SyntheticEvent, useRef } from "react";

interface SearchBarProps {
  label: string;
  className?: string;
  nativeInputProps: {
    defaultValue: string;
    onChange: (e: any) => void;
  };
}
export const SearchBar = (props: SearchBarProps) => {
  const searchTextRef = useRef(null);
  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    props.nativeInputProps.onChange({
      ...e,
      target: searchTextRef.current,
    });
  };
  return (
    <form
      className={`fr-search-bar ${props.className || ""}`}
      role="search"
      onSubmit={handleSubmit}
    >
      <input
        className="fr-input"
        placeholder={props.label}
        type="search"
        defaultValue={props.nativeInputProps.defaultValue}
        ref={searchTextRef}
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
