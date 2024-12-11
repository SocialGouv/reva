"use client";
import { useParams } from "next/navigation";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useUpdatePrerequisitesPage } from "./updatePrerequisites.hook";

type CertificationForPage = Exclude<
  ReturnType<typeof useUpdatePrerequisitesPage>["certification"],
  undefined
>;

export default function UpdatePrerequisitesPage() {
  const { certificationId } = useParams<{
    certificationId: string;
  }>();

  const { certification, getCertificationQueryStatus } =
    useUpdatePrerequisitesPage({
      certificationId,
    });

  return getCertificationQueryStatus === "success" && certification ? (
    <PageContent certification={certification} />
  ) : null;
}

const PageContent = ({
  certification,
}: {
  certification: CertificationForPage;
}) => (
  <div data-test="update-certification-prerequisites-page">
    <Breadcrumb
      currentPageLabel={`${certification.codeRncp} - ${certification.label}`}
      homeLinkProps={{
        href: `/`,
      }}
      segments={[
        {
          label: "Prérequis Obligatoires",
          linkProps: {
            href: `/responsable-certifications/certifications/${certification.id}/prerequisites`,
          },
        },
      ]}
    />

    <h1>Prérequis obligatoires</h1>
    <FormOptionalFieldsDisclaimer />
    <p className="mb-12 text-xl">
      Si l’obtention de la certification est conditionnée par la détention de
      prérequis, vous les retrouverez ici. Relisez les informations récupérées
      depuis France compétences et, si nécessaire, procédez à des corrections
      (ordre des prérequis, fautes de frappe...).
    </p>
  </div>
);
