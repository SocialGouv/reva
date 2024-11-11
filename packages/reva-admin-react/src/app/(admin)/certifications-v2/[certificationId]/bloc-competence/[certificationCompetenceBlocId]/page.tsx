"use client";
import { useParams } from "next/navigation";
import { useUpdateCompetenceBlocPage } from "./updateCompetenceBloc.hook";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

type CertificationCompetenceBlocForPage = Exclude<
  ReturnType<typeof useUpdateCompetenceBlocPage>["competenceBloc"],
  undefined
>;

export default function UpdateCompetenceBlocPage() {
  const { certificationCompetenceBlocId } = useParams<{
    certificationCompetenceBlocId: string;
  }>();

  const { competenceBloc, getCompetenceBlocQueryStatus } =
    useUpdateCompetenceBlocPage({ certificationCompetenceBlocId });
  return getCompetenceBlocQueryStatus === "success" && competenceBloc ? (
    <PageContent competenceBloc={competenceBloc} />
  ) : null;
}

const PageContent = ({
  competenceBloc,
}: {
  competenceBloc: CertificationCompetenceBlocForPage;
}) => (
  <div data-test="update-certification-page">
    <Breadcrumb
      currentPageLabel={`${competenceBloc.code} - ${competenceBloc.label}`}
      homeLinkProps={{
        href: `/`,
      }}
      segments={[
        {
          label: competenceBloc.certification.label,
          linkProps: {
            href: `/certifications-v2/${competenceBloc.certification.id}`,
          },
        },
      ]}
    />

    <h1>
      {competenceBloc.code} - {competenceBloc.label}
    </h1>
    <FormOptionalFieldsDisclaimer />
    <p className="mb-12">
      Retrouvez toutes les informations récupérées à partir du code RNCP. Si
      vous souhaitez les modifier, il est préférable de contacter directement
      France compétences.
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
  </div>
);
