import Card, { CardProps } from "@codegouvfr/react-dsfr/Card";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Pagination } from "../pagination/Pagination";

import { MultiSelectListEmptyState } from "./MultiSelectListEmptyState";

type MultiSelectItemProps = Pick<
  CardProps,
  "title" | "detail" | "desc" | "start" | "end"
> & {
  id: string;
  detailsPageUrl: string;
};

type MultiSelectListProps = {
  className?: string;
  pageItems: MultiSelectItemProps[];
  paginationInfo: {
    totalItems: number;
    totalPages: number;
  };
  itemTypeLabelForSearchResultsCount?: string;
  searchBarLabel?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
};

export const MultiSelectListReadonlyLink = ({
  className = "",
  pageItems,
  paginationInfo: { totalItems, totalPages },
  itemTypeLabelForSearchResultsCount = "élément(s)",
  searchBarLabel = "Rechercher",
  emptyStateTitle,
  emptyStateDescription,
}: MultiSelectListProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = searchParams.get("page")
    ? Number(searchParams.get("page"))
    : 1;
  const searchFilter = searchParams.get("searchFilter");

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
        <div className="flex flex-col gap-4 mb-auto"></div>
        <div className="flex flex-col w-full gap-4 ">
          {pageItems.length > 0 ? (
            <>
              <span className="text-xs text-dsfr-light-text-mention-grey">{`Résultat : ${pageItems.length} sur ${totalItems} ${itemTypeLabelForSearchResultsCount}`}</span>
              {pageItems.map((item) => {
                const { detailsPageUrl, id: itemId, ...cardProps } = item;
                return (
                  <Card
                    data-testid={`multi-select-list-item-${itemId}`}
                    key={itemId}
                    size="small"
                    enlargeLink
                    {...cardProps}
                    linkProps={{ href: detailsPageUrl }}
                  />
                );
              })}
            </>
          ) : (
            <MultiSelectListEmptyState
              title={emptyStateTitle}
              description={emptyStateDescription}
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
