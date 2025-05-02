"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useParams } from "next/navigation";
import { useUpdateLocalAccountPage } from "./updateLocalAccountPage.hook";
import LocalAccountGeneralInformationSummaryCard from "@/components/certification-authority/local-account/summary-cards/general-information-card/LocalAccountGeneralInformationSummaryCard";
import InterventionAreaSummaryCard from "@/components/certification-authority/summary-cards/intervention-area-summary-card/InterventionAreaSummaryCard";

export default function UpdateLocalAccountPage() {
  const { certificationAuthorityLocalAccountId } = useParams<{
    certificationAuthorityLocalAccountId: string;
  }>();

  const { certificationAuthorityLocalAccount } = useUpdateLocalAccountPage({
    certificationAuthorityLocalAccountId: certificationAuthorityLocalAccountId,
  });

  const localAccountLabel = `${certificationAuthorityLocalAccount?.account.firstname} ${certificationAuthorityLocalAccount?.account.lastname}`;

  const regionsAndDepartments: {
    id: string;
    label: string;
    departments: { id: string; label: string; code: string }[];
  }[] = [];
  certificationAuthorityLocalAccount?.departments.forEach((department) => {
    if (department.region) {
      let region = regionsAndDepartments.find(
        (r) => r.id === department.region?.id,
      );
      if (!region) {
        region = {
          id: department.region.id,
          label: department.region.label,
          departments: [],
        };
        regionsAndDepartments.push(region);
      }
      region.departments.push(department);
    }
  });

  return (
    <div
      className="flex flex-col"
      data-test="update-certification-authority-local-account-page"
    >
      <Breadcrumb
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/certification-authorities/settings/" },
          },
        ]}
        currentPageLabel={localAccountLabel}
      />
      <h1>{localAccountLabel}</h1>
      <p className="mb-12">
        Retrouvez l’ensemble des informations liées à ce compte local.
      </p>
      <div className="w-full flex flex-col gap-8">
        <LocalAccountGeneralInformationSummaryCard
          contactFullName={certificationAuthorityLocalAccount?.contactFullName}
          contactEmail={certificationAuthorityLocalAccount?.contactEmail}
          updateGeneralInformationPageUrl={`/certification-authorities/settings/local-accounts/${certificationAuthorityLocalAccountId}/general-information`}
        />
        <InterventionAreaSummaryCard
          regions={regionsAndDepartments}
          updateButtonHref={`/certification-authorities/settings/local-accounts/${certificationAuthorityLocalAccountId}/intervention-area`}
        />
      </div>
      <Button
        className="mt-12"
        priority="secondary"
        linkProps={{
          href: "/certification-authorities/settings/",
        }}
      >
        Retour
      </Button>
    </div>
  );
}
