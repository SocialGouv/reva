import { Button } from "@codegouvfr/react-dsfr/Button";
import Card, { CardProps } from "@codegouvfr/react-dsfr/Card";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  onlyShowAddedItemsSwitchLabel?: string;
  searchBarLabel?: string;
};

export const MultiSelectList = ({
  className = "",
  pageItems,
  selectedItemsIds,
  onSelectionChange,
  currentPage,
  totalPages,
  onlyShowAddedItemsSwitchLabel = "Afficher uniquement les éléments ajoutés",
  searchBarLabel = "Rechercher",
}: MultiSelectListProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

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
            baseHref={pathname}
            baseParams={Object.fromEntries(searchParams.entries())}
          />
        </div>
      </div>
    </div>
  );
};
