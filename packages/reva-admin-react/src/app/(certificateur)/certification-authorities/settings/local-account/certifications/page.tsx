"use client";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";

import { BackButton } from "@/components/back-button/BackButton";
import { TreeSelect } from "@/components/tree-select/TreeSelect.component";

import { useCertificationsLocalAccountPage } from "./certificationsLocalAccountPage.hook";

export default function CertificationsPage() {
  const { certificationAuthorityLocalAccount } =
    useCertificationsLocalAccountPage();

  const certifications = certificationAuthorityLocalAccount?.certifications;
  return (
    <div
      className="flex flex-col h-full"
      data-test="certifications-local-account-page"
    >
      <Breadcrumb
        segments={[
          {
            label: "Paramètres",
            linkProps: {
              href: "/certification-authorities/settings/local-account",
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
      <div className="mb-12">
        <TreeSelect
          title=""
          label=""
          hideToggleButton
          fullWidth
          fullHeight
          items={
            certifications?.map((certification) => ({
              id: certification.id,
              label: `${certification.codeRncp} - ${certification.label}`,
              selected: true,
            })) || []
          }
          onClickSelectAll={() => {}}
          onClickItem={() => {}}
          readonly
        />
      </div>
      <BackButton href="/certification-authorities/settings/local-account">
        Retour
      </BackButton>
    </div>
  );
}
