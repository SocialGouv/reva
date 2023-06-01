import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { SyntheticEvent } from "react";

interface SearchBarProps {
  label: string;
  className: string;
  nativeInputProps: {
    defaultValue: string;
    onChange: (e: any) => void;
  };
}
export const SearchBar = (props: SearchBarProps) => {
  const handleClickSearch = (e: SyntheticEvent) => {
    return props.nativeInputProps.onChange({
      ...e,
      target: document.getElementById("searchbarreplacement"),
    });
  };
  return (
    <div className="fr-search-bar fr-search-bar--lg" role="search">
      <Input
        label="Rechercher un diplôme"
        hideLabel
        nativeInputProps={{
          type: "search",
          placeholder: "Rechercher un diplôme",
          id: "searchbarreplacement",
        }}
      />
      <Button
        onClick={(e) => handleClickSearch(e)}
        iconId="fr-icon-search-line"
        priority="tertiary no outline"
        title="Lancer la recherche"
      />
    </div>
  );
};
