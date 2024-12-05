"use client";
import { useParams, useRouter } from "next/navigation";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import {
  CompetenceBlocForm,
  CompetenceBlocFormData,
} from "../../../../../../components/certifications/competence-bloc-form/CompetenceBlocForm";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useAddCompetenceBlocPage } from "./addCompetenceBloc.hook";

type CertificationForPage = Exclude<
  ReturnType<typeof useAddCompetenceBlocPage>["certification"],
  undefined
>;

export default function AddCompetenceBlocPage() {
  const { certificationId } = useParams<{
    certificationId: string;
  }>();

  const router = useRouter();

  const {
    certification,
    getCertificationQueryStatus,
    createCertificationCompetenceBloc,
  } = useAddCompetenceBlocPage({ certificationId });

  const handleFormSubmit = async (data: CompetenceBlocFormData) => {
    try {
      await createCertificationCompetenceBloc.mutateAsync(data);
      successToast("modifications enregistrées");
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
  onSubmit(data: CompetenceBlocFormData): Promise<void>;
  certification: CertificationForPage;
}) => (
  <div data-test="certification-registry-manager-add-certification-competence-bloc-page">
    <Breadcrumb
      currentPageLabel="Ajouter un bloc de compétences"
      homeLinkProps={{
        href: `/`,
      }}
      segments={[
        {
          label: certification.label,
          linkProps: {
            href: `/responsable-certifications/certifications/${certification.id}`,
          },
        },
      ]}
    />

    <h1>Ajouter un bloc de compétences</h1>
    <FormOptionalFieldsDisclaimer />
    <p className="mb-12 text-xl">
      Si vous avez constaté une erreur dans la récupération des informations de
      France compétences, ajoutez le ou les bloc(s) manquant(s) ci-dessous.
      Cette démarche est réversible, vous pouvez supprimer le ou les bloc(s) si
      nécessaire.
    </p>
    <CompetenceBlocForm
      className="mt-6"
      backUrl={`/responsable-certifications/certifications/${certification.id}`}
      onSubmit={onSubmit}
    />
  </div>
);
