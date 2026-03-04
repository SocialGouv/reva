"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useParams, useSearchParams } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { MultiSelectList } from "@/components/multi-select-list/MultiSelectList";

import { useParcoursCertificationPage } from "./parcoursCertification.hooks";

export default function ParcoursPage() {
  const { certificationId } = useParams<{ certificationId: string }>();

  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;

  const { certification, getCertificationAndParcoursStatus } =
    useParcoursCertificationPage({
      certificationId,
      page: currentPage,
    });

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
      <MultiSelectList
        pageItems={certification.parcours.rows.map((parcours) => ({
          id: parcours.id,
          title: parcours.label,
          desc: parcours.nomEtablissement,
          selected: false,
        }))}
        paginationInfo={{
          totalItems: certification.parcours.info.totalRows,
          totalPages: certification.parcours.info.totalPages,
        }}
      />
    </div>
  );
}
