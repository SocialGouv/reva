import { Button } from "@codegouvfr/react-dsfr/Button";
import Card, { CardProps } from "@codegouvfr/react-dsfr/Card";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";

import { Pagination } from "../pagination/Pagination";

type MultiSelectItemProps = Pick<
  CardProps,
  "title" | "desc" | "start" | "end"
> & {
  id: string;
};

type MultiSelectListProps = {
  className?: string;
  pageItems: MultiSelectItemProps[];
  selectedItemsIds: string[];
  onSelectionChange?: (args: { itemId: string; selected: boolean }) => void;
  currentPage: number;
  totalPages: number;
  basePaginationUrl: string;
  onlyShowAddedItemsSwitchLabel?: string;
  onlyShowAddedItems: boolean;
  onOnlyShowAddedItemsSwitchChange?: (checked: boolean) => void;
};

export const MultiSelectList = ({
  pageItems,
  selectedItemsIds,
  onSelectionChange,
  currentPage,
  totalPages,
  basePaginationUrl,
  className = "",
  onlyShowAddedItemsSwitchLabel = "Afficher uniquement les éléments ajoutés",
  onlyShowAddedItems,
  onOnlyShowAddedItemsSwitchChange,
}: MultiSelectListProps) => (
  <div className={`flex flex-col md:flex-row gap-6 ${className}`}>
    <ToggleSwitch
      className="mb-auto"
      inputTitle={onlyShowAddedItemsSwitchLabel}
      label={onlyShowAddedItemsSwitchLabel}
      labelPosition="left"
      onChange={(checked) => onOnlyShowAddedItemsSwitchChange?.(checked)}
      checked={onlyShowAddedItems}
    />
    <div className="flex flex-col w-full gap-4 ">
      {pageItems.map((item) => (
        <Card
          data-testid={`multi-select-list-item-${item.id}`}
          key={item.id}
          size="small"
          {...item}
          endDetail={
            selectedItemsIds.includes(item.id) ? (
              <Button
                onClick={() =>
                  onSelectionChange?.({
                    itemId: item.id,
                    selected: false,
                  })
                }
              >
                Retirer
              </Button>
            ) : (
              <Button
                onClick={() =>
                  onSelectionChange?.({
                    itemId: item.id,
                    selected: true,
                  })
                }
              >
                Ajouter
              </Button>
            )
          }
        />
      ))}
      <Pagination
        className="mx-auto"
        totalPages={totalPages}
        currentPage={currentPage}
        baseHref={basePaginationUrl}
      />
    </div>
  </div>
);
