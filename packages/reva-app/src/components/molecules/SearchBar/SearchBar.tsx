import classNames from "classnames";
import { SyntheticEvent, useRef } from "react";

interface SearchBarProps {
  label: string;
  className: string;
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
      className={`fr-search-bar ${props.className}`}
      role="search"
      onSubmit={handleSubmit}
    >
      <input
        className="fr-input"
        placeholder="Rechercher un diplôme"
        type="search"
        ref={searchTextRef}
      />
      <button
        className="btn btn-default form-submit js-form-submit submit-button fr-btn"
        title="Rechercher"
        type="submit"
      >
        Rechercher
      </button>
    </form>
  );
};
