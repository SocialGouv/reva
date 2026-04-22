import { Select } from "@codegouvfr/react-dsfr/Select";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import { CandidacySortByFilter } from "@/graphql/generated/graphql";

export const SortByBar = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const sortByFilter: CandidacySortByFilter =
    (searchParams.get("sortBy") as CandidacySortByFilter) ||
    "DOSSIER_DE_FAISABILITE_ENVOYE_DESC";

  const filterBy = (sortByFilter: CandidacySortByFilter): void => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete("sortBy");
    currentParams.set("page", "1");

    const path = `${pathname}?${currentParams.toString()}&sortBy=${sortByFilter}&page=1`;
    router.push(path);
  };

  return (
    <div className="flex flex-1 justify-end">
      <Select
        label=""
        className="max-w-[282px] overflow-hidden text-ellipsis whitespace-nowrap"
        nativeSelectProps={{
          onChange: (event) =>
            filterBy(event.target.value as CandidacySortByFilter),
          value: sortByFilter,
        }}
      >
        <option value="" disabled hidden>
          Trier par
        </option>
        <option value="DOSSIER_DE_FAISABILITE_ENVOYE_DESC">
          Dossier de faisabilité du plus récent au plus ancien
        </option>
        <option value="DOSSIER_DE_FAISABILITE_ENVOYE_ASC">
          Dossier de faisabilité du plus ancien au plus récent
        </option>
        <option value="DOSSIER_DE_VALIDATION_ENVOYE_DESC">
          Dossier de validation du plus récent au plus ancien
        </option>
        <option value="DOSSIER_DE_VALIDATION_ENVOYE_ASC">
          Dossier de validation du plus ancien au plus récent
        </option>
        <option value="JURY_PROGRAMME_DESC">
          Jury programmé du plus proche au plus lointain
        </option>
        <option value="JURY_PROGRAMME_ASC">
          Jury programmé du plus lointain au plus proche
        </option>
      </Select>
    </div>
  );
};
