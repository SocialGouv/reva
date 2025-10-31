"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";

import { AddCertificationAuthorityLocalAccountPageContent } from "@/components/certification-authority/local-account/add-local-account-page-content/AddCertificationAuthorityLocalAccountPageContent";

export default function AddLocalAccountPage() {
  return (
    <div
      className="flex flex-col"
      data-testid="add-certification-authority-local-account-page"
    >
      <Breadcrumb
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/certification-authorities/settings/" },
          },
        ]}
        currentPageLabel="Nouveau compte local"
      />
      <h1>Nouveau compte local</h1>
      <p className="mb-12">
        Retrouvez l’ensemble des informations liées à ce compte local.
      </p>
      <AddCertificationAuthorityLocalAccountPageContent generalInformationPageUrl="/certification-authorities/settings/local-accounts/add-local-account/general-information" />
      <Button
        className="mt-12"
        priority="secondary"
        linkProps={{
          href: "/certification-authorities/settings/",
        }}
      >
        Annuler
      </Button>
    </div>
  );
}
