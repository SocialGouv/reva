"use client";
import { useParams } from "next/navigation";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useUpdatePrerequisitesPage } from "./updatePrerequisites.hook";
import {
  PrerequisitesForm,
  PrerequisitesFormData,
} from "./(components)/prerequisites-form/PrerequisitesForm";
import { successToast, graphqlErrorToast } from "@/components/toast/toast";
import { useRouter } from "next/navigation";
import { GrayCard } from "@/components/card/gray-card/GrayCard";

type CertificationForPage = Exclude<
  ReturnType<typeof useUpdatePrerequisitesPage>["certification"],
  undefined
>;

export default function UpdatePrerequisitesPage() {
  const { certificationId } = useParams<{
    certificationId: string;
  }>();

  const router = useRouter();
  const {
    certification,
    getCertificationQueryStatus,
    updateCertificationPrerequisites,
  } = useUpdatePrerequisitesPage({
    certificationId,
  });

  const handleFormSubmit = async (data: PrerequisitesFormData) => {
    try {
      const input = {
        prerequisites: data.prerequisites.map((p) => ({
          label: p.label,
          index: p.index,
        })), //remove id added by react-hook-form useFieldArray
      };
      await updateCertificationPrerequisites.mutateAsync(input);
      successToast("La certification a bien été modifiée.");
      router.push(
        `/responsable-certifications/certifications/${certificationId}`,
      );
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return getCertificationQueryStatus === "success" && certification ? (
    <PageContent certification={certification} onSubmit={handleFormSubmit} />
  ) : null;
}

const PageContent = ({
  certification,
  onSubmit,
}: {
  certification: CertificationForPage;
  onSubmit(data: PrerequisitesFormData): Promise<void>;
}) => (
  <div data-test="update-certification-prerequisites-page">
    <Breadcrumb
      currentPageLabel={"Prérequis Obligatoires"}
      homeLinkProps={{
        href: `/`,
      }}
      segments={[
        {
          label: `${certification.codeRncp} - ${certification.label}`,
          linkProps: {
            href: `/responsable-certifications/certifications/${certification.id}`,
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
    <GrayCard as="div" className="mb-8">
      <h2>
        Informations France compétences liées au RNCP {certification.codeRncp}
      </h2>

      <dl>
        <dd>Prérequis à la validation de la certification</dd>
        <dt className="font-medium">
          {certification.fcPrerequisites ||
            "Aucun prérequis renseigné pour cette certification."}
        </dt>
      </dl>
    </GrayCard>
    <PrerequisitesForm
      onSubmit={onSubmit}
      defaultValues={{
        prerequisites: certification.prerequisites,
      }}
      backUrl={`/responsable-certifications/certifications/${certification.id}`}
    />
  </div>
);
