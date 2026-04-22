"use client";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useParams, useRouter } from "next/navigation";

import { GrayCard } from "@/components/card/gray-card/GrayCard";
import {
  CompetenceBlocForm,
  CompetenceBlocFormData,
} from "@/components/certifications/competence-bloc-form/CompetenceBlocForm";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useUpdateCompetenceBlocPage } from "./updateCompetenceBloc.hook";

type CertificationCompetenceBlocForPage = Exclude<
  ReturnType<typeof useUpdateCompetenceBlocPage>["competenceBloc"],
  undefined
>;

export default function UpdateCompetenceBlocPage() {
  const { certificationId, certificationCompetenceBlocId } = useParams<{
    certificationId: string;
    certificationCompetenceBlocId: string;
  }>();

  const router = useRouter();

  const {
    competenceBloc,
    getCompetenceBlocQueryStatus,
    updateCertificationCompetenceBloc,
  } = useUpdateCompetenceBlocPage({ certificationCompetenceBlocId });

  const handleFormSubmit = async (data: CompetenceBlocFormData) => {
    try {
      await updateCertificationCompetenceBloc.mutateAsync(data);
      successToast("Les informations ont été enregistrées");
      router.push(
        `/responsable-certifications/certifications/${certificationId}`,
      );
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return getCompetenceBlocQueryStatus === "success" && competenceBloc ? (
    <PageContent competenceBloc={competenceBloc} onSubmit={handleFormSubmit} />
  ) : null;
}

const PageContent = ({
  competenceBloc,
  onSubmit,
}: {
  competenceBloc: CertificationCompetenceBlocForPage;
  onSubmit(data: CompetenceBlocFormData): Promise<void>;
}) => (
  <div data-testid="certification-registry-manager-update-certification-competence-bloc-page">
    <Breadcrumb
      currentPageLabel={`${competenceBloc.code} - ${competenceBloc.label}`}
      homeLinkProps={{
        href: `/`,
      }}
      segments={[
        {
          label: competenceBloc.certification.label,
          linkProps: {
            href: `/responsable-certifications/certifications/${competenceBloc.certification.id}`,
          },
        },
      ]}
    />

    <h1>
      {competenceBloc.code} - {competenceBloc.label}
    </h1>
    <FormOptionalFieldsDisclaimer />
    <p className="mb-12 text-xl">
      Si vous avez repéré un problème de mise en page ou une faute de frappe,
      vous pouvez procéder aux modifications. Pour des modifications plus
      importantes, adressez-vous directement à France compétences.
    </p>
    <GrayCard as="div" className="gap-6">
      <h2>
        Informations France compétences liées au code RNCP{" "}
        {competenceBloc.certification.codeRncp}
      </h2>
      <dl>
        <dd>Intitulé du bloc de compétences</dd>
        <dt className="font-medium">
          {competenceBloc.code} - {competenceBloc.label}
        </dt>
      </dl>
      <dl>
        <dd>Compétences</dd>
        <dt className="font-medium">{competenceBloc.FCCompetences}</dt>
      </dl>
    </GrayCard>
    <CompetenceBlocForm
      className="mt-6"
      backUrl={`/responsable-certifications/certifications/${competenceBloc.certification.id}`}
      defaultValues={{
        ...competenceBloc,
        competences: competenceBloc.competences.map((c, i) => ({
          ...c,
          index: i,
        })),
      }}
      onSubmit={onSubmit}
    />
  </div>
);
