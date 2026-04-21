import Input from "@codegouvfr/react-dsfr/Input";
import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  useEffect,
  useState,
  useMemo,
} from "react";

import {
  AddressOption,
  useAutocompleteAddress,
  useDepartments,
} from "../use-autocomplete-address/useAutocompleteAddress.hook";

export const AutocompleteAddress = ({
  label,
  onOptionSelection,
  className,
  nativeInputProps,
  state,
  stateRelatedMessage,
  value,
  onInputChange,
  displayMode = "street",
  disabled = false,
}: {
  label?: string;
  displayMode?: "street" | "municipality";
  onOptionSelection: (
    selectedOption: AddressOption,
    department?: { id: string; code: string; label: string },
  ) => void;
  className?: string;
  nativeInputProps?:
    | DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
    | undefined;
  state?: "error" | "success" | "info" | "default";
  stateRelatedMessage?: string;
  value?: string;
  disabled?: boolean;
  onInputChange?: (value: string) => void;
}) => {
  const [searchText, setSearchText] = useState(value ?? "");
  const { data: defaultOptions = [], status } = useAutocompleteAddress({
    search: searchText,
  });
  const options = useMemo(() => {
    if (displayMode === "municipality") {
      return defaultOptions.filter((option) => option.type === "municipality");
    }

    return defaultOptions;
  }, [defaultOptions, displayMode]);

  const { departments } = useDepartments();

  const findDepartmentByZip = (zip: string) => {
    const zipWith5Digits = zip.slice(0, 5);
    const zipWith4Digits = zip.slice(0, 4);
    const zipWith3Digits = zip.slice(0, 3);
    const zipWith2Digits = zip.slice(0, 2);

    const departmentWith5Digits = departments?.find(
      (department) => department.code === zipWith5Digits,
    );
    if (departmentWith5Digits) {
      return departmentWith5Digits;
    }

    const departmentWith4Digits = departments?.find(
      (department) => department.code === zipWith4Digits,
    );
    if (departmentWith4Digits) {
      return departmentWith4Digits;
    }

    const departmentWith3Digits = departments?.find(
      (department) => department.code === zipWith3Digits,
    );
    if (departmentWith3Digits) {
      return departmentWith3Digits;
    }

    const departmentWith2Digits = departments?.find(
      (department) => department.code === zipWith2Digits,
    );
    if (departmentWith2Digits) {
      return departmentWith2Digits;
    }

    return undefined;
  };

  const [selectedOption, setSelectedOption] = useState<AddressOption | null>(
    null,
  );

  const [displayOptions, setDisplayOptions] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setSearchText(value);
    }
  }, [value]);

  const updateSearchText = async (newSearchText: string) => {
    setSearchText(newSearchText);
  };

  const handleKeyDownOnOptions = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        handleSubmit();
        break;
      case "Escape":
        setDisplayOptions(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (options.length) {
          const index = options.findIndex(
            (option) => option.id === selectedOption?.id,
          );
          const nextOption = options[index + 1] || options[0];
          setSelectedOption(nextOption);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (options.length) {
          const index = options.findIndex(
            (option) => option.id === selectedOption?.id,
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

  const handleOptionSelection = (newSelectedOption: AddressOption) => {
    const department = findDepartmentByZip(newSelectedOption.zip);

    setSelectedOption(newSelectedOption);
    onOptionSelection?.(newSelectedOption, department);

    if (displayMode === "municipality") {
      setSearchText(`${newSelectedOption.city} (${department?.code})`);
    } else {
      setSearchText(newSelectedOption.label);
    }
  };

  const handleSubmit = () => {
    if (!selectedOption) {
      return;
    }

    handleOptionSelection(selectedOption);
    setDisplayOptions(false);
  };

  return (
    <div data-testid="autocomplete" className={`relative ${className}`}>
      <Input
        className="mb-0"
        nativeInputProps={{
          ...nativeInputProps,
          onKeyDown: handleKeyDownOnOptions,
          onChange: (event) => {
            updateSearchText(event.target.value);
            onInputChange?.(event.target.value);
            setSelectedOption(null);
            setDisplayOptions(true);
          },
          value: searchText,
          onBlur: (event) => {
            nativeInputProps?.onBlur?.(event);
            setTimeout(() => setDisplayOptions(false), 200);
          },
          onFocus: () => setDisplayOptions(true),
          onClick: () => setDisplayOptions(true),
          autoComplete: "new-password",
        }}
        disabled={disabled}
        state={state}
        stateRelatedMessage={stateRelatedMessage}
        label={label ?? "Adresse"}
        data-testid="autocomplete-input"
        iconId="fr-icon-map-pin-2-fill"
      />
      {status === "success" && displayOptions && options.length > 0 && (
        <div
          data-testid="autocomplete-options"
          className="absolute z-10 max-h-[500px] list-none overflow-y-auto top-[75px] whitespace-normal w-full bg-white border-[1px] border-gray-300 px-4 py-2 shadow-[0px_2px_6px_0px_rgba(0,0,18,0.16)]"
        >
          {options.map((option) => {
            const isSelected = selectedOption?.id === option.id;
            let label = option.label;
            if (option.type === "municipality") {
              label = `${option.label} (${option.zip})`;
            }
            return (
              <div
                key={option.label}
                onClick={() => handleOptionSelection(option)}
                className={`whitespace-normal cursor-pointer select-none py-2  ${
                  isSelected ? "bg-dsfrGray-contrast" : ""
                }`}
                onMouseOver={() => setSelectedOption(option)}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}

      {status === "error" && (
        <div
          data-testid="autocomplete-options"
          className="absolute z-10 max-h-[500px] list-none overflow-y-auto top-[75px] whitespace-normal w-full bg-white border-[1px] border-gray-300 px-4 py-2 shadow-[0px_2px_6px_0px_rgba(0,0,18,0.16)]"
        >
          <div
            key="empty-label"
            className="whitespace-normal cursor-default select-none py"
          >
            Une erreur est survenue lors de la recherche
          </div>
        </div>
      )}
    </div>
  );
};
