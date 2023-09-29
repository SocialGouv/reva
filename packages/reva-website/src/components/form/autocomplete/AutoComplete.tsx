import { Button } from "@codegouvfr/react-dsfr/Button";
import { Combobox } from "@headlessui/react";
import { useState } from "react";

interface AutocompleteOption {
  label: string;
  value: string;
}
export const Autocomplete = ({
  searchFunction,
  onOptionSelection,
  placeholder,
  emptyState,
}: {
  searchFunction: (searchCriteria: string) => Promise<AutocompleteOption[]>;
  onOptionSelection?: (selectedOption: AutocompleteOption) => void;
  placeholder?: string;
  emptyState?: (searchCriteria: string) => void;
}) => {
  const [options, setOptions] = useState<AutocompleteOption[]>([]);

  const [selectedOption, setSelectedOption] =
    useState<AutocompleteOption | null>(null);
  const [searchCriteria, setSearchCriteria] = useState("");

  const updateSearchCriteria = async (newSearchCriteria: string) => {
    setSearchCriteria(newSearchCriteria);
    const newOptions = await searchFunction(newSearchCriteria);
    setOptions(newOptions);
  };

  const handleOptionSelection = (newSelectedOption: AutocompleteOption) => {
    setSelectedOption(newSelectedOption);
    onOptionSelection?.(newSelectedOption);
  };

  const gotSearchResults = searchCriteria && options.length;

  const gotNoSearchResults = searchCriteria && !options.length;

  return (
    <Combobox value={selectedOption} onChange={handleOptionSelection}>
      <>
        <div className="relative flex rounded-[100px] h-[56px] shadow-[0px_8px_24px_0px_rgba(11,11,248,0.16)]">
          <Combobox.Input
            displayValue={(option: AutocompleteOption) => option?.label}
            onChange={(event) => updateSearchCriteria(event.target.value)}
            placeholder={placeholder}
            className="flex items-center w-full rounded-[100px] rounded-r-none border-2 border-dsfrBlue-franceSun px-6 py-4 outline-none placeholder:italic bg-white"
          />
          {gotSearchResults ? (
            <Combobox.Options className="absolute z-10 max-h-[500px] overflow-auto top-[48px] left-0 bg-white border-[1px] border-gray-300 w-[calc(100%-52px)] py-2 shadow-[0px_2px_6px_0px_rgba(0,0,18,0.16)]">
              {options.map((option) => (
                <Combobox.Option
                  key={option.value}
                  value={option}
                  className="px-2 py-2 list-none hover:!bg-dsfrGray-contrast"
                >
                  {option.label}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          ) : null}
          <Combobox.Button
            as={() => (
              <Button
                priority="primary"
                title="rechercher"
                iconId="fr-icon-search-line"
                className="!max-h-full !rounded-r-[100px] !max-w-[56px] !w-[56px]"
              />
            )}
          />
        </div>
        {gotNoSearchResults && emptyState ? emptyState(searchCriteria) : null}
      </>
    </Combobox>
  );
};
