"use client";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { redirect } from "next/navigation";

export const CertificationsSearchBar = ({
  commanditaireId,
  cohorteVaeCollectiveId,
  page,
}: {
  commanditaireId: string;
  cohorteVaeCollectiveId: string;
  page: number;
}) => {
  const handleSearchButtonClick = (searchText: string) =>
    redirect(
      `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/certifications?searchText=${searchText}&page=${page}`,
    );

  return (
    <div className="flex items-start">
      <SearchBar
        className="w-full"
        big
        label="Rechercher"
        clearInputOnSearch
        allowEmptySearch
        onButtonClick={handleSearchButtonClick}
      />
    </div>
  );
};
