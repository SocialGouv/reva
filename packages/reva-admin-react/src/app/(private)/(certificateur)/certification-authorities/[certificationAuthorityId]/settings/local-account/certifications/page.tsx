"use client";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { useParams, useSearchParams } from "next/navigation";

import { SearchList } from "@/components/search/search-list/SearchList";

import { GenericCertificationCard } from "./_components/GenericCertificationCard";
import { useCertificationsLocalAccountPage } from "./certificationsLocalAccountPage.hook";

export default function CertificationsPage() {
  const { certificationAuthorityId } = useParams<{
    certificationAuthorityId: string;
  }>();
  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;
  const searchFilter = searchParams.get("search") ?? "";
  const { certificationAuthorityLocalAccount, certificationsPage } =
    useCertificationsLocalAccountPage({
      page: currentPage,
      searchFilter: searchFilter ?? undefined,
    });

  if (!certificationAuthorityLocalAccount || !certificationsPage) {
    return null;
  }

  return (
    <div
      className="flex flex-col h-full"
      data-testid="certifications-local-account-page"
    >
      <Breadcrumb
        segments={[
          {
            label: "Paramètres",
            linkProps: {
              href: `/certification-authorities/${certificationAuthorityId}/settings/local-account`,
            },
          },
        ]}
        currentPageLabel="Certifications gérées"
      />
      <h1>Certifications gérées</h1>
      <p className="mb-12">
        Toutes les certifications sélectionnées pour ce compte local. Pour toute
        modification, rapprochez vous de votre gestionnaire de candidatures.
      </p>
      <SearchList
        searchResultsPage={certificationsPage}
        searchFilter={searchFilter}
      >
        {(certification) => {
          const isAttachedToAnotherStructure =
            certification.certificationAuthorityStructure?.id !==
            certificationAuthorityLocalAccount.certificationAuthority
              .certificationAuthorityStructures[0].id;

          return (
            <GenericCertificationCard
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
  );
}
