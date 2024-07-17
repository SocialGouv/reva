"use client";
import { SearchBar } from "@/components/legacy/molecules/SearchBar/SearchBar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CertificationSearchBar({
  searchFilter,
}: {
  searchFilter: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <>
      <SearchBar
        label="Rechercher un diplôme"
        className="mb-8"
        searchFilter={searchFilter}
        onSearchFilterChange={(filter) => {
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
          router.push(path, {
            scroll: false,
          });
        }}
      />
    </>
  );
}
