import { Listbox } from "@headlessui/react";

const ALL_SELECTED = "__ALL__",
  NONE_SELECTED = "__NONE__";

export interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  hint?: string;
  placeholder?: (numberOfItems: number) => string;
  options: Option[];
  selectedOptions: Option[];
  ignoredOptionsOnSelectAll?: Option[];
  onChange: (values: Option[]) => void;
  selectAllLabel?: string;
  unSelectAllLabel?: string;
  withSelectAll?: boolean;
  state?: "error" | "default";
  stateRelatedMessage?: string;
}

export const MultiSelect = (props: Props) => {
  const {
    label,
    hint,
    placeholder,
    options,
    selectedOptions,
    ignoredOptionsOnSelectAll = [],
    onChange,
    selectAllLabel = "Tout cocher",
    unSelectAllLabel = "Tout décocher",
    withSelectAll,
    state,
    stateRelatedMessage,
  } = props;

  const handleChange = (values: (Option | string)[]) => {
    if (values.indexOf(ALL_SELECTED) != -1) {
      const ignoredOptions = ignoredOptionsOnSelectAll.filter(
        (option) =>
          selectedOptions.findIndex((o) => o.value == option.value) == -1
      );

      const allOptions = options.filter(
        (option) =>
          ignoredOptions.findIndex((o) => o.value == option.value) == -1
      );

      onChange(allOptions);
    } else if (values.indexOf(NONE_SELECTED) != -1) {
      onChange([]);
    } else {
      onChange(values as Option[]);
    }
  };

  const allOptionsSelected =
    selectedOptions.length >= options.length - ignoredOptionsOnSelectAll.length;

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
      <Listbox value={selectedOptions} onChange={handleChange} multiple>
        <Listbox.Button className="fr-select min-h-10 mt-2 text-left hover:!bg-dsfrGray-contrast">
          {placeholder?.(selectedOptions.length)}
        </Listbox.Button>
        <Listbox.Options className="!absolute z-10 max-h-52 overflow-auto fr-checkbox-group list-none bg-dsfrGray-contrast w-[calc(100%-5px)] rounded-lg border border-gray-300 p-2">
          {withSelectAll && (
            <Listbox.Option
              key={ALL_SELECTED}
              value={allOptionsSelected ? NONE_SELECTED : ALL_SELECTED}
            >
              {({ active }) => (
                <div
                  className={`flex p-1 rounded ${
                    active ? "bg-blue-600" : ""
                  } cursor-pointer`}
                >
                  <input
                    type="checkbox"
                    checked={allOptionsSelected}
                    readOnly
                  />
                  <label className={`fr-label ${active ? "!text-white" : ""}`}>
                    {allOptionsSelected ? unSelectAllLabel : selectAllLabel}
                  </label>
                </div>
              )}
            </Listbox.Option>
          )}

          {options.map((option) => (
            <Listbox.Option key={option.value} value={option}>
              {({ active }) => (
                <div
                  className={`flex p-1 rounded ${
                    active ? "bg-blue-600" : ""
                  } cursor-pointer`}
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedOptions.findIndex(
                        (o) => o.value == option.value
                      ) != -1
                    }
                    readOnly
                  />
                  <label className={`fr-label ${active ? "!text-white" : ""}`}>
                    {option.label}
                  </label>
                </div>
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
