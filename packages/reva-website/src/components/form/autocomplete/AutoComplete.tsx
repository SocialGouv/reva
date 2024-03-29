import { Button } from "@codegouvfr/react-dsfr/Button";
import { Combobox } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export interface AutocompleteOption {
  label: string;
  value: string;
}
export const Autocomplete = ({
  searchFunction,
  onOptionSelection,
  placeholder,
  onSubmit,
  defaultLabel,
}: {
  searchFunction: (searchText: string) => Promise<AutocompleteOption[]>;
  onOptionSelection?: (selectedOption: AutocompleteOption) => void;
  placeholder?: string;
  onSubmit?: (searchText: string) => void;
  defaultLabel?: string;
}) => {
  const [options, setOptions] = useState<AutocompleteOption[]>([]);

  const [selectedOption, setSelectedOption] =
    useState<AutocompleteOption | null>(null);

  const [status, setStatus] = useState<
    "IDLE" | "SEARCHING" | "GOT_RESULTS" | "GOT_NO_RESULT"
  >("IDLE");

  const [searchText, setSearchText] = useState("");

  const [debouncedSearchText] = useDebounce(searchText, 500);

  const updateSearchText = async (newSearchText: string) => {
    setSearchText(newSearchText);
  };

  const handleOptionSelection = (newSelectedOption: AutocompleteOption) => {
    setSelectedOption(newSelectedOption);
    onOptionSelection?.(newSelectedOption);
    setSearchText("");
  };

  //search and update autocomplete options based on debounced search text
  useEffect(() => {
    const updateOptions = async () => {
      setStatus("SEARCHING");
      if (debouncedSearchText) {
        const newOptions = await searchFunction(debouncedSearchText);
        setOptions(newOptions);
        setStatus(newOptions.length ? "GOT_RESULTS" : "GOT_NO_RESULT");
      } else {
        setOptions([]);
        setStatus("IDLE");
      }
    };
    updateOptions();
  }, [debouncedSearchText, searchFunction]);

  const handleSubmit = (searchText: string) => {
    setOptions([]);
    setSelectedOption(null);
    onSubmit?.(searchText);
  };

  return (
    <Combobox value={selectedOption} onChange={handleOptionSelection}>
      <>
        <div
          data-testid="autocomplete"
          className="relative flex rounded-[100px] h-[56px] border-dsfrBlue-franceSun border-2 shadow-[0px_8px_24px_0px_rgba(11,11,248,0.16)]"
        >
          <Combobox.Input
            displayValue={(item: AutocompleteOption) =>
              item ? "" : defaultLabel || ""
            }
            data-testid="autocomplete-input"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit(searchText)}
            onChange={(event) => updateSearchText(event.target.value)}
            placeholder={placeholder}
            className="flex items-center w-full rounded-[100px] rounded-r-none border-2 border-dsfrBlue-franceSun px-6 py-4 outline-none placeholder:italic bg-white"
          />
          {status === "GOT_RESULTS" ? (
            <Combobox.Options
              data-testid="autocomplete-options"
              className="absolute z-10 max-h-[500px] overflow-auto top-[48px] left-0 bg-white border-[1px] border-gray-300 w-[calc(100%-52px)] px-4 py-2 shadow-[0px_2px_6px_0px_rgba(0,0,18,0.16)]"
            >
              {options.map((option) => (
                <Combobox.Option
                  key={option.value}
                  value={option}
                  className={({ active }) =>
                    `px-2 py-2 list-none  ${
                      active ? "bg-dsfrGray-contrast" : "transparent"
                    }`
                  }
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
                nativeButtonProps={{
                  onClick: () => handleSubmit(searchText),
                }}
              />
            )}
          />
        </div>
      </>
    </Combobox>
  );
};
