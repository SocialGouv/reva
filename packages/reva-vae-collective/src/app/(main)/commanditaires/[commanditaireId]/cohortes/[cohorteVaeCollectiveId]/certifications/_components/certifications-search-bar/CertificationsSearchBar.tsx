"use client";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { redirect } from "next/navigation";

export const CertificationsSearchBar = ({
  commanditaireId,
  cohorteVaeCollectiveId,
}: {
  commanditaireId: string;
  cohorteVaeCollectiveId: string;
}) => {
  const handleSearchButtonClick = (searchText: string) =>
    redirect(
      `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/certifications?searchText=${searchText}&page=1`,
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
