import Input from "@codegouvfr/react-dsfr/Input";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export interface AutocompleteOption {
  label: string;
  value: string;
}
export const AutocompleteDsfr = ({
  searchFunction,
  onOptionSelection,
  placeholder,
  onSubmit,
  defaultLabel,
}: {
  searchFunction: (searchText: string) => Promise<AutocompleteOption[]>;
  onOptionSelection: (selectedOption: AutocompleteOption) => void;
  placeholder?: string;
  onSubmit?: (selectedOption: AutocompleteOption) => void;
  defaultLabel?: string;
}) => {
  const [options, setOptions] = useState<AutocompleteOption[]>([]);

  const [selectedOption, setSelectedOption] =
    useState<AutocompleteOption | null>(null);

  const [status, setStatus] = useState<
    "IDLE" | "SEARCHING" | "GOT_RESULTS" | "GOT_NO_RESULT"
  >("IDLE");
  const [displayOptions, setDisplayOptions] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 500);

  const updateSearchText = async (newSearchText: string) => {
    setSearchText(newSearchText);
  };

  const handleKeyDownOnOptions = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
        if (!searchText) return;
        e.preventDefault();
        handleSubmit(searchText);
        break;
      case "Escape":
        setDisplayOptions(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (options.length) {
          const index = options.findIndex(
            (option) => option.value === selectedOption?.value
          );
          const nextOption = options[index + 1] || options[0];
          setSelectedOption(nextOption);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (options.length) {
          const index = options.findIndex(
            (option) => option.value === selectedOption?.value
          );
          const nextOption = options[index - 1] || options[options.length - 1];
          setSelectedOption(nextOption);
        }
        break;
      case "Tab":
        setDisplayOptions(false);
        break;
    }
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
        setSelectedOption(newOptions[0] || null);
        setStatus(newOptions.length ? "GOT_RESULTS" : "GOT_NO_RESULT");
      } else {
        setOptions([]);
        setStatus("IDLE");
      }
    };
    updateOptions();
  }, [debouncedSearchText, searchFunction]);

  const handleSubmit = (searchText: string) => {
    const selectedCertification = selectedOption ?? {
      label: searchText,
      value: searchText,
    };
    setOptions([]);
    setSelectedOption(null);
    onSubmit?.(selectedCertification);
  };

  return (
    <>
      <span>
        {defaultLabel ??
          "Indiquez ci-dessous la certification ou le diplôme souhaité :"}
      </span>
      <div data-testid="autocomplete" className="relative">
        <Input
          nativeInputProps={{
            onKeyDown: handleKeyDownOnOptions,
            onChange: (event) => updateSearchText(event.target.value),
            placeholder,
            value: searchText,
            onBlur: () => {
              setTimeout(() => setDisplayOptions(false), 200);
            },
            onFocus: () => setDisplayOptions(true),
            onClick: () => setDisplayOptions(true),
          }}
          label=""
          hideLabel
          data-testid="autocomplete-input"
          iconId="fr-icon-award-fill"
        />
        {status === "GOT_RESULTS" && displayOptions ? (
          <div
            data-testid="autocomplete-options"
            className="absolute z-10 max-h-[500px] list-none overflow-y-auto top-[42px] whitespace-normal w-full bg-white border-[1px] border-gray-300 px-4 py-2 shadow-[0px_2px_6px_0px_rgba(0,0,18,0.16)]"
          >
            {options.map((option) => {
              const isSelected = selectedOption?.value === option.value;
              return (
                <div
                  key={option.value}
                  onClick={() => handleOptionSelection(option)}
                  className={`whitespace-normal cursor-pointer select-none py-2 ${
                    isSelected ? "bg-dsfrGray-contrast" : ""
                  }`}
                  onMouseOver={() => setSelectedOption(option)}
                >
                  {option.label}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
};
