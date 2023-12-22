"use client";

import { useRouter } from "next/navigation";

import { errorToast, successToast } from "@/components/toast/toast";

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
          const errorMessage =
            (error as any)?.response?.errors?.[0]?.message ||
            '"Une erreur est survenue"';

          errorToast(errorMessage);
        }
      }}
      buttonValidateText="Valider"
    />
  );
};

export default AddLocalAccountPage;
