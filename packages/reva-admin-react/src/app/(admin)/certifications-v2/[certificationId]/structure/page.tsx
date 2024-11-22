"use client";
import { useParams } from "next/navigation";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useUpdateCertificationStructurePage } from "./updateCertificationStructure.hook";

type CertificationForPage = Exclude<
  ReturnType<typeof useUpdateCertificationStructurePage>["certification"],
  undefined
>;

export default function UpdateCertificationStructurePage() {
  const { certificationId } = useParams<{
    certificationId: string;
  }>();

  const {
    certification,
    getCertificationStructureAndGestionnairesQueryStatus,
  } = useUpdateCertificationStructurePage({ certificationId });

  return getCertificationStructureAndGestionnairesQueryStatus === "success" &&
    certification ? (
    <PageContent certification={certification} />
  ) : null;
}

const PageContent = ({
  certification,
}: {
  certification: CertificationForPage;
}) => (
  <div data-test="update-certification-structure-page">
    <Breadcrumb
      currentPageLabel="Structure certificatrice et gestionnaires"
      homeLinkProps={{
        href: `/`,
      }}
      segments={[
        {
          label: certification.label,
          linkProps: {
            href: `/certifications-v2/${certification.id}`,
          },
        },
      ]}
    />

    <h1>Structure certificatrice et gestionnaires</h1>
    <FormOptionalFieldsDisclaimer />
    <p className="mb-12 text-xl">
      Pour terminer l’ajout de cette certification, vous devez la relier à une
      structure certificatrice et (à minima) à un gestionnaire des candidatures.
      Il est également possible de la relier au gestionnaire des candidatures
      d’une autre structure.
    </p>
  </div>
);
