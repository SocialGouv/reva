"use client";

import Badge from "@codegouvfr/react-dsfr/Badge";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useSearchParams } from "next/navigation";

import { MultiSelectListReadonlyLink } from "@/components/multi-select-list/MultiSelectListReadonlyLink";

import { useCertificationsPage } from "./certifications.hooks";

const CertificationAuthorityCertificationsPage = () => {
  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;
  const searchFilter = searchParams.get("searchFilter");
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
        <MultiSelectListReadonlyLink
          pageItems={certificationPage?.rows?.map((c) => ({
            id: c.id,
            detail: `RNCP ${c.codeRncp}`,
            title: c.label,
            detailsPageUrl: `/certifications/${c.id}`,
            desc: !certificationAuthority.certificationAuthorityStructures.some(
              (s) => s.id === c.certificationAuthorityStructure?.id,
            )
              ? "Certification rattachée à une autre structure"
              : "",
            start: c.visible !== undefined && (
              <>
                {c.visible ? (
                  <Badge className="mb-2" noIcon severity="success">
                    Visible
                  </Badge>
                ) : (
                  <Badge className="mb-2" noIcon severity="error">
                    Invisible
                  </Badge>
                )}
              </>
            ),
          }))}
          paginationInfo={{
            totalItems: certificationPage?.info.totalRows || 0,
            totalPages: certificationPage?.info.totalPages || 1,
          }}
          itemTypeLabelForSearchResultsCount="certification(s)"
          searchBarLabel="Rechercher par code RNCP, intitulé de certification etc..."
          emptyStateTitle="Aucune certification trouvée"
        />
      </div>
    </div>
  );
};

export default CertificationAuthorityCertificationsPage;
