"use client";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

import { CertificationsForm } from "@/components/certifications-form/CertificationsForm";

import { useCertificationsPage } from "./certifications.hooks";

const CertificationAuthorityCertificationsPage = () => {
  const { certificationAuthority, certifications } = useCertificationsPage();

  if (!certificationAuthority) {
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
        <CertificationsForm
          handleFormSubmit={() => {}}
          certifications={certifications || []}
          fullWidth
          readonly
          backUrl={`/certification-authorities/settings/`}
        />
      </div>
    </div>
  );
};

export default CertificationAuthorityCertificationsPage;
