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
    currentParams.set("page", "1");
    currentParams.set("sortBy", sortByFilter);

    const path = `${pathname}?${currentParams.toString()}`;
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
        <option value="DATE_CREATION_DESC">
          Date de création décroissante
        </option>
        <option value="DATE_CREATION_ASC">Date de création croissante</option>
        <option value="DATE_ENVOI_DESC">Date d'envoi décroissante</option>
        <option value="DATE_ENVOI_ASC">Date d'envoi croissante</option>
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
