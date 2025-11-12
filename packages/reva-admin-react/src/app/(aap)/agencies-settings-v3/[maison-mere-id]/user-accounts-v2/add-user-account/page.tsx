"use client";

import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import {
  UserAccountForm,
  UserAccountFormData,
} from "../_components/gestionnaire-maison-mere-aap-user-account/UserAccountForm";

import { useAddUserAccountPage } from "./addUserAccount.hook";

const AddUserAccountPage = () => {
  const { "maison-mere-id": maisonMereAAPId }: { "maison-mere-id": string } =
    useParams();
  const { isAdmin } = useAuth();
  const { createUserAccount } = useAddUserAccountPage({ maisonMereAAPId });
  const router = useRouter();
  const backUrl = isAdmin
    ? `/maison-mere-aap/${maisonMereAAPId}`
    : `/agencies-settings-v3`;

  const handleFormSubmit = async (data: UserAccountFormData) => {
    try {
      await createUserAccount.mutateAsync({
        accountEmail: data.email,
        accountFirstname: data.firstname,
        accountLastname: data.lastname,
      });
      successToast("Compte créé");
      router.push(backUrl);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };
  return (
    <div className="w-full flex flex-col">
      <h1>Création d’un compte collaborateur</h1>
      <FormOptionalFieldsDisclaimer />
      <UserAccountForm
        onSubmit={handleFormSubmit}
        backUrl={backUrl}
        submitButtonLabel="Créer"
      />
    </div>
  );
};

export default AddUserAccountPage;
