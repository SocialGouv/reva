import { Listbox } from "@headlessui/react";
import { useCallback, useState } from "react";

interface Option {
  label: string;
  value: string;
}

export const MultiSelect = ({
  label,
  hint,
  placeholder,
  options,
  onChange,
  initialSelectedValues,
}: {
  label: string;
  hint?: string;
  placeholder?: (numberOfItems: number) => string;
  options: Option[];
  onChange?: (values: string[]) => void;
  initialSelectedValues?: string[];
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(
    initialSelectedValues || []
  );

  const handleChange = useCallback(
    (newValues: string[]) => {
      setSelectedValues(newValues);
      onChange?.(newValues);
    },
    [onChange]
  );

  return (
    <div className="w-full relative  fr-select-group">
      <label className="fr-label">
        {label}
        <span className="fr-hint-text">{hint}</span>
      </label>
      <Listbox value={selectedValues} onChange={handleChange} multiple>
        <Listbox.Button className="fr-select min-h-10 mt-2 text-left hover:!bg-dsfrGray-contrast">
          {placeholder?.(selectedValues.length)}
        </Listbox.Button>
        <Listbox.Options className="!absolute z-10 max-h-52 md:max-h-72 overflow-scroll fr-checkbox-group list-none bg-dsfrGray-contrast w-[calc(100%-5px)] rounded-lg border border-gray-300 p-2">
          {options.map((option) => (
            <Listbox.Option key={option.value} value={option.value}>
              {({ active }) => (
                <li
                  className={`flex p-1 rounded ${
                    active ? "bg-blue-400" : ""
                  } cursor-pointer`}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    readOnly
                  />
                  <label className={`fr-label ${active ? "!text-white" : ""}`}>
                    {option.label}
                  </label>
                </li>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
};
