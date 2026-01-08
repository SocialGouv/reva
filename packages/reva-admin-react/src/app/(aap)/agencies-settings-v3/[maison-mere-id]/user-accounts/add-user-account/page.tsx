"use client";

import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import {
  UserAccountForm,
  UserAccountFormData,
} from "@/components/settings/user-account-form/UserAccountForm";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

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
      const result = await createUserAccount.mutateAsync({
        accountEmail: data.email,
        accountFirstname: data.firstname,
        accountLastname: data.lastname,
      });
      successToast("Compte créé");
      router.push(`../${result.organism_createAccount?.id}`);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };
  return (
    <div className="w-full flex flex-col">
      <h1>Création d’un compte collaborateur</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="mb-10 text-xl">
        Le collaborateur ajouté recevra un courriel pour finaliser son compte.
      </p>
      <UserAccountForm onSubmit={handleFormSubmit} backUrl={backUrl} />
    </div>
  );
};

export default AddUserAccountPage;
