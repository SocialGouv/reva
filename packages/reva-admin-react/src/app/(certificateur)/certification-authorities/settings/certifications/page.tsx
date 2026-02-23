"use client";

import Badge from "@codegouvfr/react-dsfr/Badge";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import Card from "@codegouvfr/react-dsfr/Card";
import { useSearchParams } from "next/navigation";

import { SearchList } from "@/components/search/search-list/SearchList";

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
            return (
              <Card
                key={certification.id}
                title={certification.label}
                detail={`RNCP ${certification.codeRncp}`}
                desc={
                  !certificationAuthority.certificationAuthorityStructures.some(
                    (s) =>
                      s.id ===
                      certification.certificationAuthorityStructure?.id,
                  )
                    ? "Certification rattachée à une autre structure"
                    : ""
                }
                start={
                  certification.visible !== undefined && (
                    <>
                      {certification.visible ? (
                        <Badge className="mb-2" noIcon severity="success">
                          Visible
                        </Badge>
                      ) : (
                        <Badge className="mb-2" noIcon severity="error">
                          Invisible
                        </Badge>
                      )}
                    </>
                  )
                }
                enlargeLink
                linkProps={{ href: `/certifications/${certification.id}` }}
              />
            );
          }}
        </SearchList>
      </div>
    </div>
  );
};

export default CertificationAuthorityCertificationsPage;
