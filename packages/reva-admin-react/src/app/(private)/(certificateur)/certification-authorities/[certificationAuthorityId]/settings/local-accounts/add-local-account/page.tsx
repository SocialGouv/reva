"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useParams } from "next/navigation";

import { AddCertificationAuthorityLocalAccountPageContent } from "@/components/certification-authority/local-account/add-local-account-page-content/AddCertificationAuthorityLocalAccountPageContent";
import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";
import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";

export default function AddLocalAccountPage() {
  const { certificationAuthorityId } = useParams<{
    certificationAuthorityId: string;
  }>();

  return (
    <div
      className="flex flex-col"
      data-testid="add-certification-authority-local-account-page"
    >
      <SettingsPageHeader
        breadcrumb={
          <SettingsBreadcrumb
            segments={[
              {
                label: "Paramètres",
                linkProps: {
                  href: `/certification-authorities/${certificationAuthorityId}/settings/`,
                },
              },
            ]}
            currentPageLabel="Nouveau compte local"
          />
        }
        title="Nouveau compte local"
        chapo="Retrouvez l’ensemble des informations liées à ce compte local."
      />
      <AddCertificationAuthorityLocalAccountPageContent
        generalInformationPageUrl={`/certification-authorities/${certificationAuthorityId}/settings/local-accounts/add-local-account/general-information`}
      />
      <Button
        className="mt-12"
        priority="secondary"
        linkProps={{
          href: `/certification-authorities/${certificationAuthorityId}/settings/`,
        }}
      >
        Annuler
      </Button>
    </div>
  );
}
