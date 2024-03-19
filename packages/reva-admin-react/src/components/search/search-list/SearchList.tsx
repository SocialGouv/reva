import { Pagination } from "@/components/pagination/Pagination";
import { SearchFilterBar } from "@/components/search-filter-bar/SearchFilterBar";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode, useMemo } from "react";

type SearchResultsPage<T> = {
  info: { totalRows: number; totalPages: number; currentPage: number };
  rows: T[];
};

export interface SearchListProps<T> {
  title: string;
  searchFilter: string;
  searchResultsPage: SearchResultsPage<T>;
  updateSearchFilter: (searchFilter: string) => void;
  children?: (searchResult: T) => ReactNode;
}

export const SearchList = <T,>({
  title,
  searchFilter,
  children,
  searchResultsPage,
  updateSearchFilter,
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

  return (
    <div className="flex flex-col">
      <h4 className="text-2xl font-bold mb-6">
        {`${title} (${searchResultsPage.info.totalRows})`}
      </h4>

      <SearchFilterBar
        className="mb-6"
        searchFilter={searchFilter}
        resultCount={searchResultsPage.info.totalRows}
        onSearchFilterChange={updateSearchFilter}
      />
      <ul className="flex flex-col gap-5 my-0 pl-0">
        {searchResultsPage.rows.map((r) => children?.(r))}
      </ul>

      <br />
      <Pagination
        totalPages={searchResultsPage.info.totalPages}
        currentPage={searchResultsPage.info.currentPage}
        baseHref={pathname}
        className="mx-auto"
        baseParams={searchParamsWithoutPage}
      />
    </div>
  );
};
