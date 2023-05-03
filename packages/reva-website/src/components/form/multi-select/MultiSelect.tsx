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

  // const handleChange = useCallback(
  //   (newValues: string[]) => {
  //     if(! withSelectAll) {
  //       setSelectedValues(newValues);
  //       onChange?.(newValues);
  //     }
  //   },
  //   [onChange]
  // );

  const toggleSelectAll = () => {
    console.log("toggleSelectAll");
  }

  const handleChange = (newValues: string[]) => {
    if (withSelectAll) {
      
      const isSelectAllChecked = newValues.includes("all");
      console.log(`isSelectAllChecked: ${isSelectAllChecked}, newValues.length: ${newValues.length}`);
      
      // Select all has been unchecked
      if(selectAllChecked && !isSelectAllChecked) {
        console.log("Select all has been unchecked");
        const noValues: string[] = [];
        setSelectedValues(noValues);
        setSelectAllChecked(false);
        onChange?.(noValues);
        // return;
      }
      // Select all has been checked
      if(isSelectAllChecked) {
        console.log("Select all has been checked")
        const allValues = options.map(({ value }) => value);
        setSelectedValues(allValues);
        setSelectAllChecked(true);
        onChange?.(allValues);
      }
      // Regular case
      else {
        console.log("Regular case")
        const filteredValues = newValues.filter((val) => val !== "all");
        setSelectedValues(filteredValues);
        // setSelectAllChecked(isSelectAllChecked);
        onChange?.(filteredValues);
      }
    }
    else {
      setSelectedValues(newValues);
      onChange?.(newValues);
    }
  };
  // const unSelectAll = () => setSelectedValues([]);
  // const selectAll = useCallback(
  //   () => {
  //     setSelectedValues(options.map(({ value }) => value));
  //     // onChange?.(newValues);
  //   },
  //   []
  //   // [onChange]
  // );
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
            <Listbox.Option key="all" value="all">
              {({ active }) => (
                <SelectOneOption
                  active={active}
                  label="Tout cocher"
                  checked={selectAllChecked}
                  onChange={toggleSelectAll}
                />
              )}
            </Listbox.Option>
          )}
          {options.map((option) => (
            <Listbox.Option key={option.value} value={option.value}>
              {({ active }) => (
                <SelectOneOption
                  active={active}
                  label={option.label}
                  checked={selectedValues.includes(option.value)}
                />
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
};

interface SelectAllProps {
  checked: boolean;
  mode: "select" | "unselect";
  onChange?: (checked: boolean) => void;
  selectAll: () => void;
  unSelectAll: () => void;
}

const SelectAllOption = ({
  checked,
  mode,
  selectAll,
  unSelectAll,
}: SelectAllProps) => (
  <Listbox.Option key="all" value="all">
    <li className="flex p-1 rounded bg-blue-400 cursor-pointer">
      <input type="checkbox" checked={checked} readOnly />
      <label className="fr-label !text-white">
        {mode === "select" && "Cocher tout"}
        {mode === "unselect" && "Décocher tout"}
      </label>
    </li>
  </Listbox.Option>
);

interface SelectOneOptionProps {
  active: boolean;
  label: string;
  checked: boolean;
  onChange?: () => void;
}

const SelectOneOption = ({ active, label, checked, onChange }: SelectOneOptionProps) => (
  <li
    className={`flex p-1 rounded ${active ? "bg-blue-400" : ""} cursor-pointer`}
  >
    <input type="checkbox" checked={checked} readOnly />
    <label className={`fr-label ${active ? "!text-white" : ""}`}>{label}</label>
  </li>
);
