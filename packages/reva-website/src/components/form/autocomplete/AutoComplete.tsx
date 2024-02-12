import Input from "@codegouvfr/react-dsfr/Input";
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
  onOptionSelection: (selectedOption: AutocompleteOption) => void;
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
    <div data-testid="autocomplete" className="relative">
      <Input
        nativeInputProps={{
          onKeyDown: (e) => e.key === "Enter" && handleSubmit(searchText),
          onChange: (event) => updateSearchText(event.target.value),
          placeholder,
          value: searchText,
        }}
        label={defaultLabel}
        data-testid="autocomplete-input"
      />
      {status === "GOT_RESULTS" ? (
        <div
          data-testid="autocomplete-options"
          className="absolute z-10 max-h-[500px] list-none overflow-y-auto top-[42px] whitespace-normal w-full bg-white border-[1px] border-gray-300 px-4 py-2 shadow-[0px_2px_6px_0px_rgba(0,0,18,0.16)]"
        >
          {options.map((option) => (
            <li key={option.value}>
              <option
                value={option.value}
                onClick={() => handleOptionSelection(option)}
                className="whitespace-normal py-2 hover:bg-dsfrGray-contrast"
              >
                {option.label}
              </option>
            </li>
          ))}
        </div>
      ) : null}
    </div>
  );
};
