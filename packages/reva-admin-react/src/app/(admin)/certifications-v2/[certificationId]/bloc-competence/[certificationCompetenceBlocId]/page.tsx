"use client";
import { useParams } from "next/navigation";
import { useUpdateCompetenceBlocPage } from "./updateCompetenceBloc.hook";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

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
    <h1>
      {competenceBloc.code} - {competenceBloc.label}
    </h1>
    <FormOptionalFieldsDisclaimer />
    <p className="mb-12">
      Retrouvez toutes les informations récupérées à partir du code RNCP. Si
      vous souhaitez les modifier, il est préférable de contacter directement
      France compétences.
    </p>
  </div>
);
