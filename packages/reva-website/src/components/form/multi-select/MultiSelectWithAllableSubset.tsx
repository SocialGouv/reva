import { Listbox } from "@headlessui/react";
import { useCallback, useState } from "react";

interface Option {
  label: string;
  value: string;
  subref: string;
}

const ALL_SELECTED = "__ALL__";

export const MultiSelectWithAllableSubset = ({
  label,
  hint,
  placeholder,
  options,
  onChange,
  initialSelectedValues,
  subsetLabel,
  subsetRefList,
  state,
  stateRelatedMessage,
}: {
  label: string;
  hint?: string;
  placeholder?: (numberOfItems: number) => string;
  options: Option[];
  onChange?: (values: string[]) => void;
  initialSelectedValues?: string[];
  subsetLabel: string;
  subsetRefList: string[];
  state?: "error" | "default";
  stateRelatedMessage?: string;
}) => {
  const subsetValues = options
    .filter(({ subref }) => subsetRefList.includes(subref))
    .map(({ value }) => value);

  const [selectedValues, setSelectedValues] = useState<string[]>(
    initialSelectedValues || []
  );

  const [selectAllChecked, setSelectAllChecked] = useState<boolean>(
    !Boolean(initialSelectedValues) ||
      subsetValues.every((value) =>
        (initialSelectedValues as string[]).includes(value)
      )
  );

  const handleChange = useCallback(
    (changedValues: string[]) => {
      const removeSubset = (curValues: string[]) =>
        curValues.filter((value) => !subsetValues.includes(value));
      const appendSubset = (curValues: string[]) =>
        Array.from(new Set([...curValues, ...subsetValues]));
      let newValues: string[] = changedValues;
      if (changedValues.includes(ALL_SELECTED) && !selectAllChecked) {
        // "all" was just checked
        newValues = appendSubset(changedValues);
        setSelectAllChecked(true);
      } else if (!changedValues.includes(ALL_SELECTED) && selectAllChecked) {
        // "all" was just unchecked
        newValues = removeSubset(changedValues);
        setSelectAllChecked(false);
      } else {
        setSelectAllChecked(
          subsetValues.every((value) => newValues.includes(value))
        );
      }
      setSelectedValues(newValues);
      onChange?.(newValues);
    },
    [onChange, selectAllChecked, subsetValues]
  );

  return (
    <div
      className={`w-full relative  fr-select-group ${
        state === "error" ? "fr-select-group--error" : ""
      }`}
    >
      <label className="fr-label">
        {label}
        <span className="fr-hint-text">{hint}</span>
      </label>
      <Listbox value={selectedValues} onChange={handleChange} multiple>
        <Listbox.Button className="fr-select min-h-10 mt-2 text-left hover:!bg-dsfrGray-contrast">
          {placeholder?.(selectedValues.length)}
        </Listbox.Button>
        <Listbox.Options className="!absolute z-10 max-h-52 overflow-auto fr-checkbox-group list-none bg-dsfrGray-contrast w-[calc(100%-5px)] rounded-lg border border-gray-300 p-2">
          <Listbox.Option key={ALL_SELECTED} value={ALL_SELECTED}>
            {({ active }) => (
              <li
                className={`flex p-1 rounded ${
                  active ? "bg-blue-600" : ""
                } cursor-pointer`}
              >
                <input type="checkbox" checked={selectAllChecked} readOnly />
                <label className={`fr-label ${active ? "!text-white" : ""}`}>
                  {selectAllChecked
                    ? `Décocher ${subsetLabel}`
                    : `Cocher ${subsetLabel}`}
                </label>
              </li>
            )}
          </Listbox.Option>

          {options.map((option) => (
            <Listbox.Option key={option.value} value={option.value}>
              {({ active }) => (
                <li
                  className={`flex p-1 rounded ${
                    active ? "bg-blue-600" : ""
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
      {stateRelatedMessage && (
        <p className="fr-error-text">{stateRelatedMessage}</p>
      )}
    </div>
  );
};
