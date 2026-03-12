"use client";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useParams, useSearchParams } from "next/navigation";

import { SearchList } from "@/components/search/search-list/SearchList";

import { NoParcoursCertificationCard } from "./_components/NoParcoursCertificationCard";
import { WithParcoursCertificationCard } from "./_components/WithParcoursCertificationCard";
import { useCertificationsPage } from "./certifications.hooks";

const CertificationAuthorityCertificationsPage = () => {
  const { certificationAuthorityId } = useParams<{
    certificationAuthorityId: string;
  }>();
  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;
  const searchFilter = searchParams.get("search") ?? "";
  const { certificationAndParcoursPage, certificationAuthority } =
    useCertificationsPage({
      page: currentPage,
      searchFilter: searchFilter ?? undefined,
    });

  if (!certificationAuthority || !certificationAndParcoursPage) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col">
        <Breadcrumb
          segments={[
            {
              label: "Paramètres",
              linkProps: {
                href: `/certification-authorities/${certificationAuthorityId}/settings/`,
              },
            },
          ]}
          currentPageLabel="Certifications gérées"
        />
        <h1>Certifications gérées</h1>
        <p className="text-xl">
          Voici toutes les certifications sélectionnées pour ce compte
          gestionnaire de candidatures. Pour toutes modifications, rapprochez
          vous de l’administration de France VAE.
        </p>
        <SearchList
          searchResultsPage={certificationAndParcoursPage}
          searchFilter={searchFilter}
        >
          {(certificationAndParcours) => {
            const certification = certificationAndParcours.certification;
            const isAttachedToAnotherStructure =
              certification.certificationAuthorityStructure?.id !==
              certificationAuthority.certificationAuthorityStructures[0].id;
            const certificationHasParcours =
              certification.parcours.info.totalRows > 0;

            const parcoursSelectedForCertificationCount =
              certificationAndParcours.parcours.length;

            return certificationHasParcours ? (
              <WithParcoursCertificationCard
                key={certification.id}
                id={certification.id}
                label={certification.label}
                codeRncp={certification.codeRncp}
                visible={certification.visible}
                isAttachedToAnotherStructure={isAttachedToAnotherStructure}
                parcoursSelectedForCertificationCount={
                  parcoursSelectedForCertificationCount
                }
                detailsHref={`/certification-details/${certification.id}`}
                parcoursSettingsHref={`/certification-authorities/${certificationAuthorityId}/settings/certifications/${certification.id}/parcours`}
              />
            ) : (
              <NoParcoursCertificationCard
                key={certification.id}
                id={certification.id}
                label={certification.label}
                codeRncp={certification.codeRncp}
                visible={certification.visible}
                isAttachedToAnotherStructure={isAttachedToAnotherStructure}
                detailsHref={`/certification-details/${certification.id}`}
              />
            );
          }}
        </SearchList>
      </div>
    </div>
  );
};

export default CertificationAuthorityCertificationsPage;
