"use client";

import Badge from "@codegouvfr/react-dsfr/Badge";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { MultiSelectList } from "@/components/multi-select-list/MultiSelectList";
import { graphqlErrorToast } from "@/components/toast/toast";

import { useUpdateLocalAccountCertificationsPage } from "./updateLocalAccountCertificationsPage.hook";

export default function InterventionAreaPage() {
  const router = useRouter();
  const { certificationAuthorityId, certificationAuthorityLocalAccountId } =
    useParams<{
      certificationAuthorityId: string;
      certificationAuthorityLocalAccountId: string;
    }>();
  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;
  const onlyShowAddedItems = searchParams.get("onlyShowAddedItems") === "true";
  const searchFilter = searchParams.get("searchFilter") ?? "";
  const {
    certificationAuthorityLocalAccount,
    isLoading,
    certificationsAndParcoursPage,
    certificationsFromLocalAccount,
    updateCertificationAuthorityLocalAccountCertifications,
  } = useUpdateLocalAccountCertificationsPage({
    certificationAuthorityLocalAccountId,
    page: currentPage,
    certificationsSearchFilter: searchFilter,
    onlyShowAddedCertifications: onlyShowAddedItems,
  });

  if (isLoading || !certificationsAndParcoursPage) {
    return null;
  }

  const handleEmptyStateShowAllItemsButtonClick = ({
    currentQueryParams,
  }: {
    currentQueryParams: URLSearchParams;
  }) => {
    currentQueryParams.delete("page");
    currentQueryParams.delete("onlyShowAddedItems");
    currentQueryParams.delete("searchFilter");
    router.push(
      `/certification-authorities/${certificationAuthorityId}/settings/local-accounts/${certificationAuthorityLocalAccountId}/certifications?${currentQueryParams.toString()}`,
    );
  };

  const handleCertificationSelectionChange = async ({
    itemId,
    selected,
  }: {
    itemId: string;
    selected: boolean;
  }) => {
    try {
      await updateCertificationAuthorityLocalAccountCertifications.mutateAsync(
        selected
          ? [
              ...(certificationsFromLocalAccount?.map((c) => c.id) || []),
              itemId,
            ]
          : certificationsFromLocalAccount
              ?.filter((c) => c.id !== itemId)
              .map((c) => c.id) || [],
      );
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      data-testid="update-certification-authority-local-account-certifications-page"
    >
      <Breadcrumb
        segments={[
          {
            label: "Paramètres",
            linkProps: {
              href: `/certification-authorities/${certificationAuthorityId}/settings/`,
            },
          },
          {
            label: `${certificationAuthorityLocalAccount?.account.firstname} ${certificationAuthorityLocalAccount?.account.lastname}`,
            linkProps: {
              href: `/certification-authorities/${certificationAuthorityId}/settings/local-accounts/${certificationAuthorityLocalAccountId}`,
            },
          },
        ]}
        currentPageLabel="Certifications gérées"
      />
      <h1>Certifications gérées</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="mb-12">
        Cochez les certifications proposées par ce compte local. Vous pouvez
        choisir une ou plusieurs certifications. Vous pourrez ajuster cette
        sélection en tout temps.
      </p>
      <MultiSelectList
        pageItems={certificationsAndParcoursPage?.rows
          .map((cap) => cap.certification)
          .map((c) => ({
            id: c.id,
            title: c.label,
            detail: `RNCP ${c.codeRncp}`,
            selected: certificationsFromLocalAccount.some(
              (localCertification) => localCertification.id === c.id,
            ),
            detailsPageUrl: `/certification-details/${c.id}`,
            desc: certificationAuthorityLocalAccount?.certificationAuthority.certificationAuthorityStructures.some(
              (structure) =>
                structure.id === c.certificationAuthorityStructure?.id,
            )
              ? ""
              : "Certification rattachée à une autre structure",
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
          totalItems: certificationsAndParcoursPage?.info.totalRows || 0,
          totalPages: certificationsAndParcoursPage?.info.totalPages || 1,
        }}
        onSelectionChange={handleCertificationSelectionChange}
        onEmptyStateShowAllItemsButtonClick={
          handleEmptyStateShowAllItemsButtonClick
        }
      />
    </div>
  );
}
