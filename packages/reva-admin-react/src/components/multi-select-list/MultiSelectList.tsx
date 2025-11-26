import { Button } from "@codegouvfr/react-dsfr/Button";
import Card, { CardProps } from "@codegouvfr/react-dsfr/Card";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Pagination } from "../pagination/Pagination";

import { MultiSelectListEmptyState } from "./MultiSelectListEmptyState";

type MultiSelectItemProps = Pick<
  CardProps,
  "title" | "desc" | "start" | "end"
> & {
  id: string;
  selected: boolean;
};

type MultiSelectListProps = {
  className?: string;
  pageItems: MultiSelectItemProps[];
  onSelectionChange?: (args: { itemId: string; selected: boolean }) => void;
  totalPages: number;
  onlyShowAddedItemsSwitchLabel?: string;
  searchBarLabel?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateShowAllItemsButtonLabel?: string;
};

export const MultiSelectList = ({
  className = "",
  pageItems,
  onSelectionChange,
  totalPages,
  onlyShowAddedItemsSwitchLabel = "Afficher uniquement les éléments ajoutés",
  searchBarLabel = "Rechercher",
  emptyStateTitle,
  emptyStateDescription,
  emptyStateShowAllItemsButtonLabel,
}: MultiSelectListProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = searchParams.get("page")
    ? Number(searchParams.get("page"))
    : 1;
  const onlyShowAddedItems = searchParams.get("onlyShowAddedItems") === "true";
  const searchFilter = searchParams.get("searchFilter");

  const handleOnlyShowAddedItemsChange = (checked: boolean) => {
    const queryParams = new URLSearchParams(searchParams);
    queryParams.set("onlyShowAddedItems", checked ? "true" : "false");
    queryParams.set("page", "1");
    router.push(`${pathname}?${queryParams.toString()}`);
  };

  const handleSearchFilterChange = (filter: string) => {
    const queryParams = new URLSearchParams(searchParams);
    queryParams.set("searchFilter", filter);
    queryParams.set("page", "1");
    router.push(`${pathname}?${queryParams.toString()}`);
  };

  const resetAllFilters = () => {
    const queryParams = new URLSearchParams(searchParams);
    queryParams.delete("searchFilter");
    queryParams.delete("onlyShowAddedItems");
    queryParams.set("page", "1");
    router.push(`${pathname}?${queryParams.toString()}`);
  };

  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      <SearchBar
        label={searchBarLabel}
        defaultValue={searchFilter ?? ""}
        onButtonClick={handleSearchFilterChange}
        allowEmptySearch
      />
      <div className="flex flex-col md:flex-row gap-6">
        <ToggleSwitch
          className="mb-auto"
          inputTitle={onlyShowAddedItemsSwitchLabel}
          label={onlyShowAddedItemsSwitchLabel}
          labelPosition="left"
          onChange={(checked) => handleOnlyShowAddedItemsChange(checked)}
          checked={onlyShowAddedItems}
        />
        <div className="flex flex-col w-full gap-4 ">
          {pageItems.length > 0 ? (
            pageItems.map((item) => (
              <Card
                data-testid={`multi-select-list-item-${item.id}`}
                key={item.id}
                size="small"
                {...item}
                endDetail={
                  item.selected ? (
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
            ))
          ) : (
            <MultiSelectListEmptyState
              onShowAllItemsButtonClick={resetAllFilters}
              title={emptyStateTitle}
              description={emptyStateDescription}
              showAllItemsButtonLabel={emptyStateShowAllItemsButtonLabel}
            />
          )}
          <Pagination
            className="mx-auto"
            totalPages={totalPages}
            currentPage={currentPage}
            baseHref={pathname}
            baseParams={Object.fromEntries(searchParams.entries())}
          />
        </div>
      </div>
    </div>
  );
};
