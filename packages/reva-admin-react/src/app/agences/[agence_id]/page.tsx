"use client";

import { useParams } from "next/navigation";
import { useAgencesQueries } from "../agencesQueries";
import AgenceFormContainer from "../components/AgenceFormContainer";

const AgencePage = () => {
  const { useUpdateOrganismByMaisonMereAAP } = useAgencesQueries();
  const { agence_id }: { agence_id: string } = useParams();
  const { mutateAsync: updateOrganismWithMaisonMereAAPMutation } =
    useUpdateOrganismByMaisonMereAAP;

  return (
    <AgenceFormContainer
      onSubmitFormMutation={async (data) => {
        await updateOrganismWithMaisonMereAAPMutation({
          organismData: data,
          organismId: agence_id,
        });
      }}
      buttonValidateText="Valider les modifications"
    />
  );
};

export default AgencePage;
