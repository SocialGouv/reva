"use client";

import { useAgencesQueries } from "../agencesQueries";
import AgenceFormContainer from "../components/AgenceFormContainer";

const AddAgencePage = () => {
  const { useCreateOrganismByMaisonMereAAP } = useAgencesQueries();
  const { mutateAsync: createAgenceByMaisonMereAAPMutation } =
    useCreateOrganismByMaisonMereAAP;

  return (
    <AgenceFormContainer
      onSubmitFormMutation={async (data) =>
        await createAgenceByMaisonMereAAPMutation(data)
      }
      buttonValidateText="Créer l'agence"
      toastSuccessText="L'agence a bien été créée"
    />
  );
};

export default AddAgencePage;
