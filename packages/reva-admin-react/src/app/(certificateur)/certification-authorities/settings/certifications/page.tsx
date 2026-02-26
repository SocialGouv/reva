"use client";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useSearchParams } from "next/navigation";

import { SearchList } from "@/components/search/search-list/SearchList";

import { NoParcoursCertificationCard } from "./_components/NoParcoursCertificationCard";
import { WithParcoursCertificationCard } from "./_components/WithParcoursCertificationCard";
import { useCertificationsPage } from "./certifications.hooks";

const CertificationAuthorityCertificationsPage = () => {
  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;
  const searchFilter = searchParams.get("search") ?? "";
  const { certificationPage, certificationAuthority } = useCertificationsPage({
    page: currentPage,
    searchFilter: searchFilter ?? undefined,
  });

  if (!certificationAuthority || !certificationPage) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col">
        <Breadcrumb
          segments={[
            {
              label: "Paramètres",
              linkProps: { href: "/certification-authorities/settings/" },
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
          searchResultsPage={certificationPage}
          searchFilter={searchFilter}
        >
          {(certification) => {
            const isAttachedToAnotherStructure =
              certification.certificationAuthorityStructure?.id !==
              certificationAuthority.certificationAuthorityStructures[0].id;
            const hasParcours = certification.parcours.rows.length > 0;

            return hasParcours ? (
              <WithParcoursCertificationCard
                key={certification.id}
                label={certification.label}
                codeRncp={certification.codeRncp}
                visible={certification.visible}
                isAttachedToAnotherStructure={isAttachedToAnotherStructure}
                detailsHref={`/certifications/${certification.id}`}
                parcoursSettingsHref={`/certification-authorities/settings/certifications/${certification.id}/parcours`}
              />
            ) : (
              <NoParcoursCertificationCard
                key={certification.id}
                label={certification.label}
                codeRncp={certification.codeRncp}
                visible={certification.visible}
                isAttachedToAnotherStructure={isAttachedToAnotherStructure}
                detailsHref={`/certifications/${certification.id}`}
              />
            );
          }}
        </SearchList>
      </div>
    </div>
  );
};

export default CertificationAuthorityCertificationsPage;
