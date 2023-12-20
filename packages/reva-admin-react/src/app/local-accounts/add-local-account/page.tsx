"use client";

import { useCertificationAuthorityQueries } from "../certificationAuthorityQueries";
import { FormLocalAccount } from "../components/form-local-account";

const AddLocalAccountPage = () => {
  const { useCreateCertificationAuthorityMutation } =
    useCertificationAuthorityQueries();
  const { mutateAsync: createCertificationAuthorityMutation } =
    useCreateCertificationAuthorityMutation;

  return (
    <FormLocalAccount
      onSubmitFormMutation={async (data) => {
        console.log(data);

        await createCertificationAuthorityMutation(data);
      }}
      buttonValidateText="Valider"
      toastSuccessText="Le compte local a bien été créé"
    />
  );
};

export default AddLocalAccountPage;
