import { Select } from "@codegouvfr/react-dsfr/Select";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import { CandidacySortByFilter } from "@/graphql/generated/graphql";

export const SortByBar = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const sortByFilter: CandidacySortByFilter =
    (searchParams.get("sortBy") as CandidacySortByFilter) ||
    "DATE_CREATION_DESC";

  const filterBy = (sortByFilter: CandidacySortByFilter): void => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete("sortBy");

    const path = `${pathname}?${currentParams.toString()}&sortBy=${sortByFilter}`;
    router.push(path);
  };

  return (
    <div className="flex flex-1 justify-end">
      <Select
        label=""
        nativeSelectProps={{
          onChange: (event) =>
            filterBy(event.target.value as CandidacySortByFilter),
          value: sortByFilter,
        }}
      >
        <option value="" disabled hidden>
          Trier par
        </option>
        <option value="DATE_CREATION_DESC">
          Date de création décroissante
        </option>
        <option value="DATE_CREATION_ASC">Date de création croissante</option>
        <option value="DATE_ENVOI_DESC">Date d'envoi décroissante</option>
        <option value="DATE_ENVOI_ASC">Date d'envoi croissante</option>
      </Select>
    </div>
  );
};
