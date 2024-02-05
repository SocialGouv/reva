import { Pagination } from "@/components/pagination/Pagination";
import { SearchFilterBar } from "@/components/search-filter-bar/SearchFilterBar";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode, useMemo } from "react";

export const SearchList = ({
  title,
  searchResultsTotal,
  searchFilter,
  children,
  currentPage,
  totalPages,
  updateSearchFilter,
}: {
  title: string;
  searchResultsTotal: number;
  searchFilter: string;
  currentPage: number;
  totalPages: number;
  updateSearchFilter: (searchFilter: string) => void;
  children?: ReactNode;
}) => {
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
        {`${title} (${searchResultsTotal})`}
      </h4>

      <SearchFilterBar
        className="mb-6"
        searchFilter={searchFilter}
        resultCount={searchResultsTotal}
        onSearchFilterChange={updateSearchFilter}
      />
      <ul className="flex flex-col gap-5">{children}</ul>

      <br />
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        baseHref={pathname}
        className="mx-auto"
        baseParams={searchParamsWithoutPage}
      />
    </div>
  );
};
