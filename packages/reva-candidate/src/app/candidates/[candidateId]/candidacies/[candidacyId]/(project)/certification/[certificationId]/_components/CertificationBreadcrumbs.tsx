"use client";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";

import { useCandidacyForCertification } from "./certification.hooks";

export default function CertificationBreadcrumbs({
  currentlyShownCertification,
}: {
  currentlyShownCertification: {
    id: string;
    label: string;
  };
}) {
  const { certification } = useCandidacyForCertification();
  if (!certification) {
    return null;
  }

  if (currentlyShownCertification.id !== certification.id) {
    return (
      <Breadcrumb
        currentPageLabel={currentlyShownCertification.label}
        className="mb-4"
        segments={[
          {
            label: "Ma candidature",
            linkProps: {
              href: "../../",
            },
          },
          {
            label: "Diplôme visé",
            linkProps: {
              href: `../../certification/${certification.id}`,
            },
          },
          {
            label: "Choisir un diplôme",
            linkProps: {
              href: `../../search-certification`,
            },
          },
        ]}
      />
    );
  }

  return (
    <Breadcrumb
      currentPageLabel="Diplôme visé"
      className="mb-4"
      segments={[
        {
          label: "Ma candidature",
          linkProps: {
            href: "../../",
          },
        },
      ]}
    />
  );
}
