import { Listbox } from "@headlessui/react";
import { useCallback, useEffect, useReducer } from "react";
import { difference } from "lodash";

interface Option {
  label: string;
  value: string;
  subref: string;
}

const ALL_SELECTED = "__ALL__",
  NONE_SELECTED = "__NONE__";

interface SelectState {
  selectedValues: string[];
  allSubsetSelected: boolean;
  subsetValues: string[];
}

type SelectAction =
  | {
      type: "CHECK_ALL_SUBSET" | "UNCHECK_ALL_SUBSET";
    }
  | {
      type: "OTHER";
      values: string[];
    };

const selectionReducer = (
  state: SelectState,
  action: SelectAction
): SelectState => {
  switch (action.type) {
    case "CHECK_ALL_SUBSET":
      return {
        ...state,
        selectedValues: Array.from(
          new Set([...state.selectedValues, ...state.subsetValues])
        ),
        allSubsetSelected: true,
      };
    case "UNCHECK_ALL_SUBSET":
      return {
        ...state,
        selectedValues: state.selectedValues.filter(
          (val) => !state.subsetValues.includes(val)
        ),
        allSubsetSelected: false,
      };
    case "OTHER":
      return {
        ...state,
        selectedValues: action.values,
        allSubsetSelected: state.subsetValues.every((value) =>
          action.values.includes(value)
        ),
      };
    default:
      throw `Unexpected action type`;
  }
};

export const MultiSelectWithAllableSubset = ({
  label,
  hint,
  placeholder,
  options,
  onChange,
  initialSelectedValues,
  subsetLabel,
  subsetRefList,
  status,
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
  status?: "error" | "default";
  stateRelatedMessage?: string;
}) => {
  const subsetValues = options
    .filter(({ subref }) => subsetRefList.includes(subref))
    .map(({ value }) => value);

  const [state, dispatch] = useReducer(selectionReducer, {
    selectedValues: initialSelectedValues || [],
    subsetValues,
    allSubsetSelected:
      !Boolean(initialSelectedValues) ||
      subsetValues.every((value) =>
        (initialSelectedValues as string[]).includes(value)
      ),
  });

  useEffect(() => {
    if (onChange) {
      onChange(state.selectedValues);
    }
  });

  const handleChange = useCallback(
    (changedValues: string[]) => {
      const checked = difference(changedValues, state.selectedValues);
      if (checked.length > 1) {
        throw "unexpected Select changes";
      }
      if (checked[0] === ALL_SELECTED) {
        return dispatch({ type: "CHECK_ALL_SUBSET" });
      }
      if (checked[0] === NONE_SELECTED) {
        return dispatch({ type: "UNCHECK_ALL_SUBSET" });
      }
      dispatch({
        type: "OTHER",
        values: changedValues,
      });
    },
    [state.selectedValues]
  );

  return (
    <div
      className={`w-full relative  fr-select-group ${
        status === "error" ? "fr-select-group--error" : ""
      }`}
    >
      <label className="fr-label">
        {label}
        <span className="fr-hint-text">{hint}</span>
      </label>
      <Listbox value={state.selectedValues} onChange={handleChange} multiple>
        <Listbox.Button className="fr-select min-h-10 mt-2 text-left hover:!bg-dsfrGray-contrast">
          {placeholder?.(state.selectedValues.length)}
        </Listbox.Button>
        <Listbox.Options className="!absolute z-10 max-h-52 overflow-auto fr-checkbox-group list-none bg-dsfrGray-contrast w-[calc(100%-5px)] rounded-lg border border-gray-300 p-2">
          <Listbox.Option
            key={ALL_SELECTED}
            value={state.allSubsetSelected ? NONE_SELECTED : ALL_SELECTED}
          >
            {({ active }) => (
              <li
                className={`flex p-1 rounded ${
                  active ? "bg-blue-600" : ""
                } cursor-pointer`}
              >
                <input
                  type="checkbox"
                  checked={state.allSubsetSelected}
                  readOnly
                />
                <label className={`fr-label ${active ? "!text-white" : ""}`}>
                  {state.allSubsetSelected
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
                    checked={state.selectedValues.includes(option.value)}
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
