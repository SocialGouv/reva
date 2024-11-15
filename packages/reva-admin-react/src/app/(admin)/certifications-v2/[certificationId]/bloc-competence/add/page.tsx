"use client";
import { useParams, useRouter } from "next/navigation";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import {
  CompetenceBlocForm,
  CompetenceBlocFormData,
} from "../_components/CompetenceBlocForm";
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
      router.push(`/certifications-v2/${certificationId}`);
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
  <div data-test="add-certification-competence-bloc-page">
    <Breadcrumb
      currentPageLabel="Ajouter un bloc de compétences"
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

    <h1>Ajouter un bloc de compétences</h1>
    <FormOptionalFieldsDisclaimer />
    <p className="mb-12 text-xl">
      Ajoutez un bloc de compétences si vous constater une erreur dans la
      récupération des informations de France Compétence. Vous pourrez supprimer
      ce bloc si vous constatez que vous vous êtes trompé.
    </p>
    <CompetenceBlocForm
      className="mt-6"
      backUrl={`/certifications-v2/${certification.id}`}
      onSubmit={onSubmit}
    />
  </div>
);
