import { Listbox } from "@headlessui/react";
import { useState } from "react";

interface Option {
  label: string;
  value: string;
}

const ALL_SELECTED = "__ALL__";

export const MultiSelect = ({
  label,
  hint,
  placeholder,
  options,
  onChange,
  initialSelectedValues,
  withSelectAll,
}: {
  label: string;
  hint?: string;
  placeholder?: (numberOfItems: number) => string;
  options: Option[];
  onChange?: (values: string[]) => void;
  initialSelectedValues?: string[];
  withSelectAll?: boolean;
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(
    initialSelectedValues || []
  );

  const [selectAllChecked, setSelectAllChecked] = useState<boolean>(
    Boolean(initialSelectedValues?.length === options.length)
  );

  const handleSelectAll = () => {
    if (selectAllChecked) {
      setSelectedValues([]);
      setSelectAllChecked(false);
    } else {
      setSelectedValues(options.map(({ value }) => value));
      setSelectAllChecked(true);
    }
  };

  const handleChange = (newValues: string[]) => {
    // When "select all" was checked using the keyboard
    if (newValues.includes(ALL_SELECTED)) {
      return handleSelectAll();
    }
    setSelectAllChecked(newValues.length === options.length);
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

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
        <Listbox.Options className="!absolute z-10 max-h-52 md:max-h-72 overflow-auto fr-checkbox-group list-none bg-dsfrGray-contrast w-[calc(100%-5px)] rounded-lg border border-gray-300 p-2">
          {withSelectAll && (
            <Listbox.Option key={ALL_SELECTED} value={ALL_SELECTED}>
              {({ active }) => (
                <li
                  className={`flex p-1 rounded ${
                    active ? "bg-blue-400" : ""
                  } cursor-pointer`}
                  onClick={(evt) => {
                    handleSelectAll();
                    evt.stopPropagation();
                  }}
                >
                  <input type="checkbox" checked={selectAllChecked} readOnly />
                  <label className={`fr-label ${active ? "!text-white" : ""}`}>
                    {selectAllChecked ? "Tout décocher" : "Tout cocher"}
                  </label>
                </li>
              )}
            </Listbox.Option>
          )}

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
