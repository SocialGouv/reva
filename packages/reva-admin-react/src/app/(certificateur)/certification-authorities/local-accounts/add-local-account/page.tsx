"use client";

import { useRouter } from "next/navigation";

import { successToast, graphqlErrorToast } from "@/components/toast/toast";

import { useCertificationAuthorityQueries } from "../certificationAuthorityQueries";
import { FormLocalAccount } from "../components/form-local-account";

const AddLocalAccountPage = () => {
  const router = useRouter();

  const {
    useCreateCertificationAuthorityMutation,
    refetchCertifictionAuthority,
  } = useCertificationAuthorityQueries();
  const { mutateAsync: createCertificationAuthorityMutation } =
    useCreateCertificationAuthorityMutation;

  return (
    <FormLocalAccount
      onSubmit={async (data) => {
        try {
          await createCertificationAuthorityMutation(data);
          await refetchCertifictionAuthority();

          successToast("Le compte local a bien été créé");

          router.push("/certification-authorities/local-accounts");
        } catch (error) {
          graphqlErrorToast(error);
        }
      }}
      buttonValidateText="Valider"
    />
  );
};

export default AddLocalAccountPage;
