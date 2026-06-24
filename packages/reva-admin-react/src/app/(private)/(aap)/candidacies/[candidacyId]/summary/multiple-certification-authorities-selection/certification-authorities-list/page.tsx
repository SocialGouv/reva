"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { useParams, useSearchParams } from "next/navigation";

import { SearchList } from "@/components/search/search-list/SearchList";

import { CertificationAuthorityCard } from "./_components/CertificationAuthorityCard";
import { useMultipleCertificationAuthoritiesListPage } from "./multipleCertificationAuthoritiesList.hooks";

const MultipleCertificationAuthoritiesListPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;
  const searchFilter = searchParams.get("search") ?? "";

  const { certificationAuthoritiesPage } =
    useMultipleCertificationAuthoritiesListPage({
      candidacyId,
      currentPage,
      searchFilter,
    });

  return (
    <div className="flex flex-col">
      <h1>Certificateur</h1>
      <p>
        Le certificateur sélectionné devra étudier les dossiers de faisabilité
        et de validation de cette candidature. Vous devez en choisir un parmi
        les certificateurs couvrant la certification sélectionnée.
      </p>

      <SearchList
        searchResultsPage={certificationAuthoritiesPage}
        searchFilter={searchFilter}
      >
        {(certificationAuthority) => (
          <CertificationAuthorityCard
            key={certificationAuthority.id}
            label={certificationAuthority.label}
            contactEmail={certificationAuthority.contactEmail}
            contactPhone={certificationAuthority.contactPhone}
            onClickHref={`/candidacies/${candidacyId}/summary/multiple-certification-authorities-selection/certification-authority-details/${certificationAuthority.id}`}
          />
        )}
      </SearchList>

      <Button
        priority="secondary"
        linkProps={{ href: `/candidacies/${candidacyId}/summary` }}
      >
        Retour
      </Button>
    </div>
  );
};

export default MultipleCertificationAuthoritiesListPage;
