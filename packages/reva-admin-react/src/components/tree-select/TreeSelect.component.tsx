import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { useState } from "react";

import { TreeSelectItem } from "./TreeSelect.types";
import {
  checkIfAllItemsSelected,
  getFilteredItems,
} from "./TreeSelect.helpers";

interface Props {
  title: string;
  label: string;
  items: TreeSelectItem[];
  onClickSelectAll: (checked: boolean) => void;
  onClickItem: (item: TreeSelectItem) => void;
}

export const TreeSelect = (props: Props): JSX.Element => {
  const { title, label, items, onClickSelectAll, onClickItem } = props;

  const isAllSelected = checkIfAllItemsSelected(items);

  const [search, onSearchChange] = useState("");

  const filteredItems = getFilteredItems(search, items);

  const renderItems = (items: TreeSelectItem[]): JSX.Element => {
    return (
      <>
        {items.map((item) => {
          const availableChildren = item.children && item.children.length > 0;

          return (
            <div
              key={item.id}
              className={
                availableChildren ? "relative fix-accordion" : "fix-accordion"
              }
            >
              <Checkbox
                className={
                  availableChildren
                    ? "absolute z-10 top-0.5 pt-2.5 bg-white w-[calc(100%-36px)] mb-0"
                    : "top-0.5 pt-2.5 bg-white w-full mb-0"
                }
                key={item.id}
                options={[
                  {
                    label: (
                      <span className="text-xs sm:text-base">{item.label}</span>
                    ),
                    nativeInputProps: {
                      checked: item.selected,
                      onChange: () => {
                        onClickItem(item);
                      },
                    },
                  },
                ]}
              />
              {item.children && item.children.length > 0 && (
                <Accordion label="">{renderItems(item.children)}</Accordion>
              )}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-2">
      <h4>{title}</h4>
      <SearchBar
        renderInput={({ className, id, placeholder, type }) => (
          <input
            className={className}
            id={id}
            placeholder={placeholder}
            type={type}
            value={search}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
          />
        )}
      />
      <div>
        <ToggleSwitch
          inputTitle={label}
          label={label}
          labelPosition="left"
          showCheckedHint={false}
          checked={isAllSelected}
          onChange={onClickSelectAll}
        />
      </div>
      <div className="max-h-[500px] overflow-y-scroll overflow-x-hidden">
        {renderItems(filteredItems)}
      </div>
    </div>
  );
};