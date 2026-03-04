"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useParams } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

import { useParcoursCertificationPage } from "./parcoursCertification.hooks";

export default function ParcoursPage() {
  const { certificationId } = useParams<{ certificationId: string }>();

  const { certification, getCertificationAndParcoursStatus } =
    useParcoursCertificationPage({ certificationId });

  if (getCertificationAndParcoursStatus === "pending" || !certification) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <Breadcrumb
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/certification-authorities/settings/" },
          },
          {
            label: "Certifications gérées",
            linkProps: {
              href: "/certification-authorities/settings/certifications",
            },
          },
        ]}
        currentPageLabel={certification.label}
      />
      <h1>Certifications gérées</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="mb-12">
        Cochez les certifications proposées par ce compte local. Vous pouvez
        choisir une ou plusieurs certifications. Vous pourrez ajuster cette
        sélection en tout temps.
      </p>
    </div>
  );
}
