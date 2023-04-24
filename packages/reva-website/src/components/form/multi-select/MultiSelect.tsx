import classNames from "classnames";
import { useMultipleSelection, useSelect } from "downshift";

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
  onChange?: (values: Option[]) => void;
  initialSelectedValues?: Option[];
}) => {
  const { getDropdownProps, selectedItems, setSelectedItems } =
    useMultipleSelection({ initialSelectedItems: initialSelectedValues });

  const { isOpen, getToggleButtonProps, getMenuProps, getItemProps } =
    useSelect({
      selectedItem: null,
      items: options,
      stateReducer: (_, actionAndChanges) => {
        const { changes, type } = actionAndChanges;
        switch (type) {
          case useSelect.stateChangeTypes.ToggleButtonKeyDownEnter:
          case useSelect.stateChangeTypes.ToggleButtonKeyDownSpaceButton:
          case useSelect.stateChangeTypes.ItemClick:
            return {
              ...changes,
              isOpen: true,
            };
        }
        return changes;
      },
      onStateChange: ({ type, selectedItem: newSelectedItem }) => {
        switch (type) {
          case useSelect.stateChangeTypes.ToggleButtonKeyDownEnter:
          case useSelect.stateChangeTypes.ToggleButtonKeyDownSpaceButton:
          case useSelect.stateChangeTypes.ItemClick:
          case useSelect.stateChangeTypes.ToggleButtonBlur:
            if (newSelectedItem) {
              const isItemAlreadySelected = selectedItems
                .map((s) => s.value)
                .includes(newSelectedItem.value);
              const newSelectedItems = isItemAlreadySelected
                ? selectedItems.filter((s) => s.value !== newSelectedItem.value)
                : [...selectedItems, newSelectedItem];

              setSelectedItems(newSelectedItems);
              onChange?.(newSelectedItems);
            }
            break;
          default:
            break;
        }
      },
    });
  return (
    <div className="w-full relative  fr-select-group">
      <label className="fr-label">
        {label}
        <span className="fr-hint-text">{hint}</span>
      </label>
      <div
        className="fr-select cursor-pointer"
        {...getToggleButtonProps(
          getDropdownProps({ preventKeyAction: isOpen })
        )}
      >
        {placeholder?.(selectedItems.length)}
      </div>
      <ul
        className={`!absolute bg-dsfrGray-contrast w-[calc(100%-5px)] rounded-lg border border-gray-300  ml-[-5px] mt-[-30px] max-h-80 overflow-scroll p-0 fr-checkbox-group ${
          !(isOpen && options.length) && "hidden"
        }`}
        {...getMenuProps()}
      >
        {isOpen &&
          options.map((item, index) => (
            <li
              className={classNames("py-2 px-3 flex gap-2 cursor-pointer")}
              key={`${item.value}${index}`}
              {...getItemProps({ item, index })}
            >
              <div>
                <input
                  type="checkbox"
                  checked={selectedItems
                    .map((i) => i.value)
                    .includes(item.value)}
                  readOnly
                />
                <label className="fr-label">{item.label}</label>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};
