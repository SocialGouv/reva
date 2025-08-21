import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useCallback, useMemo } from "react";

import { Pagination } from "@/components/pagination/Pagination";
import { SearchFilterBar } from "@/components/search-filter-bar/SearchFilterBar";
import { SearchResultsHeader } from "@/components/search-results-header/SearchResultsHeader";

type SearchResultsPage<T> = {
  info: { totalRows: number; totalPages: number; currentPage: number };
  rows: T[];
};

export interface SearchListProps<T> {
  title?: string | null;
  hint?: ({ totalRows }: { totalRows: number }) => ReactNode;
  searchBarProps?: {
    lifted?: boolean;
    title?: string;
    placeholder?: string;
  };
  searchFilter: string;
  searchResultsPage: SearchResultsPage<T>;
  children?: (searchResult: T) => ReactNode;
  childrenContainerClassName?: string;
  addButton?: ReactNode;
  FilterBar?: ReactNode;
}

export const SearchList = <T,>({
  title,
  hint,
  searchBarProps,
  searchFilter,
  children,
  searchResultsPage,
  childrenContainerClassName,
  addButton,
  FilterBar,
}: SearchListProps<T>) => {
  const pathname = usePathname();

  const searchParams = useSearchParams();

  const searchParamsWithoutPage = useMemo(() => {
    let params = {};
    searchParams.forEach((value, key) => {
      if (key.toLowerCase() !== "page") {
        params = { ...params, [key]: value };
      }
    });
    return params;
  }, [searchParams]);

  const router = useRouter();

  const onSearchFilterChange = useCallback(
    (filter: string) => {
      const queryParams = new URLSearchParams(searchParams);
      if (filter && queryParams.get("page")) {
        queryParams.set("page", "1");
        queryParams.set("search", filter);
      } else if (filter) {
        queryParams.set("search", filter);
      } else {
        queryParams.delete("search");
      }

      const path = `${pathname}?${queryParams.toString()}`;
      router.push(path);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="flex flex-col">
      {title && (
        <h4 className="text-2xl font-bold mb-6">
          {`${title} (${searchResultsPage.info.totalRows})`}
        </h4>
      )}

      {hint && hint({ totalRows: searchResultsPage.info.totalRows })}

      <SearchFilterBar
        {...searchBarProps}
        searchFilter={searchFilter}
        onSearchFilterChange={onSearchFilterChange}
      />

      {FilterBar && FilterBar}

      <SearchResultsHeader
        className="mb-2 mt-8"
        defaultSearchFilter={searchFilter}
        onSearchFilterChange={onSearchFilterChange}
        resultCount={searchResultsPage.info.totalRows}
        addButton={addButton}
      />

      <ul
        data-test="results"
        className={`flex flex-col gap-5 my-0 pl-0 ${childrenContainerClassName}`}
      >
        {searchResultsPage.rows.map((r) => children?.(r))}
      </ul>

      <br />

      <Pagination
        totalPages={searchResultsPage.info.totalPages}
        currentPage={searchResultsPage.info.currentPage}
        baseHref={pathname}
        className="mx-auto my-12"
        baseParams={searchParamsWithoutPage}
      />
    </div>
  );
};
