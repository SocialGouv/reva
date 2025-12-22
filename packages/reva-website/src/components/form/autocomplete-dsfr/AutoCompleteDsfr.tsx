import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export interface AutocompleteOption {
  label: string;
  value: string;
  codeRncp?: string;
}
export const AutocompleteDsfr = ({
  searchFunction,
  onOptionSelection,
  placeholder,
  onSubmit,
  defaultLabel,
  emptyLabel,
  big = false,
  defaultValue = "",
}: {
  searchFunction: (searchText: string) => Promise<AutocompleteOption[]>;
  onOptionSelection: (selectedOption: AutocompleteOption) => void;
  placeholder?: string;
  onSubmit?: (selectedOption: AutocompleteOption) => void;
  defaultLabel?: string;
  emptyLabel?: string;
  big?: boolean;
  defaultValue?: string;
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
      case "ArrowDown":
        e.preventDefault();
        if (options.length) {
          const index = options.findIndex(
            (option) => option.value === selectedOption?.value,
          );
          const nextOption = options[index + 1] || options[0];
          setSelectedOption(nextOption);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (options.length) {
          const index = options.findIndex(
            (option) => option.value === selectedOption?.value,
          );
          const nextOption = options[index - 1] || options[options.length - 1];
          setSelectedOption(nextOption);
        }
        break;
    }
  };

  const handleOptionSelection = (newSelectedOption: AutocompleteOption) => {
    setSelectedOption(null);
    onOptionSelection?.(newSelectedOption);
    setSearchText("");
  };

  //search and update autocomplete options based on debounced search text
  useEffect(() => {
    const updateOptions = async () => {
      setStatus("SEARCHING");
      setSelectedOption(null);
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
    const selectedCertification = selectedOption ?? {
      label: searchText,
      value: searchText,
    };

    if (selectedOption) {
      handleOptionSelection(selectedCertification);
      return;
    }

    setOptions([]);
    onSubmit?.(selectedCertification);
  };

  return (
    <>
      <p className="mb-2">
        {defaultLabel ??
          "Indiquez ci-dessous la certification ou le diplôme souhaité :"}
      </p>
      <div data-testid="autocomplete" className="relative">
        <SearchBar
          big={big}
          allowEmptySearch
          className="w-full"
          onButtonClick={() => {
            handleSubmit(searchText);
          }}
          renderInput={({ className, id, type }) => {
            return (
              <>
                <input
                  onKeyDown={handleKeyDownOnOptions}
                  onChange={(event) => updateSearchText(event.target.value)}
                  placeholder={placeholder}
                  value={searchText || defaultValue}
                  onBlur={() => {
                    setDisplayOptions(false);
                    setSelectedOption(null);
                  }}
                  onFocus={() => setDisplayOptions(true)}
                  onClick={() => setDisplayOptions(true)}
                  id={id}
                  type={type}
                  className={className}
                  data-testid="autocomplete-input"
                />
                {status === "GOT_RESULTS" && displayOptions && (
                  <div
                    data-testid="autocomplete-options"
                    onMouseOut={() => setSelectedOption(null)}
                    className="absolute z-10 max-h-[500px] list-none overflow-y-auto top-[50px] whitespace-normal w-full bg-white border-[1px] border-gray-300 px-4 py-2 shadow-[0px_2px_6px_0px_rgba(0,0,18,0.16)]"
                  >
                    {options.map((option) => {
                      const isSelected = selectedOption?.value === option.value;
                      const optionsText = option.label.replace(
                        new RegExp(searchText, "gi"),
                        (match) => `<b>${match}</b>`,
                      );
                      return (
                        <div
                          key={option.value}
                          onMouseDown={() => {
                            handleOptionSelection(option);
                          }}
                          className={`flex whitespace-normal cursor-pointer select-none py-2 ${
                            isSelected ? "bg-dsfrGray-contrast" : ""
                          }`}
                          onMouseOver={() => setSelectedOption(option)}
                        >
                          <span
                            className=" fr-icon--sm fr-icon-file-text-line mr-3 px-1 bg-[#f6f6f6] self-center"
                            aria-hidden="true"
                          />
                          <div>
                            <span
                              dangerouslySetInnerHTML={{ __html: optionsText }}
                            />
                            <br />
                            <span className="text-dsfrGray-mentionGrey text-xs">
                              RNCP {option.codeRncp}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex gap-3 border-t border-t-dsfrGray-contrast mt-1 pt-3 pb-2">
                      <span
                        className=" fr-icon--sm fr-icon-search-line px-1 bg-[#f6f6f6]"
                        aria-hidden="true"
                      />
                      <b>{searchText}</b>{" "}
                      <Link
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="text-dsfrBlue-franceSun"
                        href={{
                          pathname: "/espace-candidat/recherche",
                          query: { searchText },
                        }}
                      >
                        Voir tous les résultats
                        <span className="fr-icon--sm fr-icon-arrow-right-line" />
                      </Link>
                    </div>
                  </div>
                )}

                {status === "GOT_NO_RESULT" && (
                  <div
                    data-testid="autocomplete-options"
                    className="absolute z-10 max-h-[500px] list-none overflow-y-auto top-[50px] whitespace-normal w-full bg-white border-[1px] border-gray-300 px-4 py-2 shadow-[0px_2px_6px_0px_rgba(0,0,18,0.16)]"
                  >
                    <div
                      key="empty-label"
                      className="whitespace-normal cursor-default select-none py"
                    >
                      {emptyLabel}
                    </div>
                  </div>
                )}
              </>
            );
          }}
        />
      </div>
    </>
  );
};
