import { Button } from "@codegouvfr/react-dsfr/Button";
import Card, { CardProps } from "@codegouvfr/react-dsfr/Card";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Pagination } from "../pagination/Pagination";

import { MultiSelectListEmptyState } from "./MultiSelectListEmptyState";

type MultiSelectItemProps = Pick<
  CardProps,
  "title" | "detail" | "desc" | "start" | "end"
> & {
  id: string;
  selected: boolean;
  detailsPageUrl?: string;
};

type MultiSelectListProps = {
  className?: string;
  pageItems: MultiSelectItemProps[];
  onSelectionChange?: (args: { itemId: string; selected: boolean }) => void;
  paginationInfo: {
    totalItems: number;
    totalPages: number;
  };
  itemTypeLabelForSearchResultsCount?: string;
  onlyShowAddedItemsSwitchLabel?: string;
  searchBarLabel?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateShowAllItemsButtonLabel?: string;
  additionalElementsInFilterSidebar?: React.ReactNode;
};

export const MultiSelectList = ({
  className = "",
  pageItems,
  onSelectionChange,
  paginationInfo: { totalItems, totalPages },
  itemTypeLabelForSearchResultsCount = "élément(s)",
  onlyShowAddedItemsSwitchLabel = "Afficher uniquement les éléments ajoutés",
  searchBarLabel = "Rechercher",
  emptyStateTitle,
  emptyStateDescription,
  emptyStateShowAllItemsButtonLabel,
  additionalElementsInFilterSidebar,
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
        <div className="flex flex-col gap-4 mb-auto">
          <ToggleSwitch
            inputTitle={onlyShowAddedItemsSwitchLabel}
            label={onlyShowAddedItemsSwitchLabel}
            labelPosition="left"
            onChange={(checked) => handleOnlyShowAddedItemsChange(checked)}
            checked={onlyShowAddedItems}
            className="fr-toggle--border-bottom"
          />
          {additionalElementsInFilterSidebar}
        </div>
        <div className="flex flex-col w-full gap-4 ">
          {pageItems.length > 0 ? (
            <>
              <span className="text-xs text-dsfr-light-text-mention-grey">{`Résultat : ${pageItems.length} sur ${totalItems} ${itemTypeLabelForSearchResultsCount}`}</span>
              {pageItems.map((item) => {
                const {
                  detailsPageUrl,
                  id: itemId,
                  selected,
                  ...cardProps
                } = item;
                return (
                  <Card
                    data-testid={`multi-select-list-item-${itemId}`}
                    key={itemId}
                    size="small"
                    {...cardProps}
                    endDetail={
                      selected ? (
                        <span className="flex gap-4">
                          <AlreadyAddedItemButton />
                          {detailsPageUrl && (
                            <ViewDetailsButton
                              detailsPageUrl={detailsPageUrl}
                            />
                          )}
                          <RemoveItemButton
                            onClick={() =>
                              onSelectionChange?.({
                                itemId,
                                selected: false,
                              })
                            }
                          />
                        </span>
                      ) : (
                        <span className="flex gap-4">
                          <AddItemButton
                            onClick={() =>
                              onSelectionChange?.({
                                itemId,
                                selected: true,
                              })
                            }
                          />
                          {item.detailsPageUrl && (
                            <ViewDetailsButton
                              detailsPageUrl={item.detailsPageUrl}
                            />
                          )}
                        </span>
                      )
                    }
                  />
                );
              })}
            </>
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

const ViewDetailsButton = ({ detailsPageUrl }: { detailsPageUrl: string }) => {
  return (
    <Button priority="secondary" linkProps={{ href: detailsPageUrl }}>
      Voir la fiche
    </Button>
  );
};

const AddItemButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button priority="primary" onClick={onClick}>
      Ajouter
    </Button>
  );
};

const AlreadyAddedItemButton = () => {
  return (
    <Button disabled iconId="fr-icon-check-line">
      Ajoutée
    </Button>
  );
};

const RemoveItemButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button priority="tertiary no outline" onClick={onClick}>
      Retirer
    </Button>
  );
};
