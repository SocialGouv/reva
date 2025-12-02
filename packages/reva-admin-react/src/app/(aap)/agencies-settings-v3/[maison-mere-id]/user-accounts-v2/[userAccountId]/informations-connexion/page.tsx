"use client";
import { useParams, useRouter } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import {
  UserAccountForm,
  UserAccountFormData,
} from "@/components/settings/user-account-form/UserAccountForm";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { SettingsBreadcrumb } from "../../_components/SettingsBreadcrumb";

import { useUpdateUserAccountPage } from "./updateUserAccount.hook";

const InformationsConnexionPage = () => {
  const {
    "maison-mere-id": maisonMereAAPId,
    userAccountId,
  }: { "maison-mere-id": string; userAccountId: string } = useParams<{
    "maison-mere-id": string;
    userAccountId: string;
  }>();
  const router = useRouter();

  const { userAccount, updateUserAccount } = useUpdateUserAccountPage({
    maisonMereAAPId,
    userAccountId,
  });
  const backUrl = `/agencies-settings-v3/${maisonMereAAPId}/user-accounts-v2/${userAccountId}`;
  const handleFormSubmit = async (data: UserAccountFormData) => {
    try {
      await updateUserAccount.mutateAsync({
        accountEmail: data.email,
        accountFirstname: data.firstname,
        accountLastname: data.lastname,
      });
      successToast("Modification enregistrées");
      router.push(backUrl);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  if (!userAccount) {
    return null;
  }
  return (
    <div className="w-full flex flex-col">
      <SettingsBreadcrumb
        currentPageLabel="Informations de connexion"
        maisonMereAAPId={maisonMereAAPId}
        segmentsAfterBaseSegments={[
          {
            label: userAccount.lastname + " " + userAccount.firstname,
            linkProps: {
              href: `/agencies-settings-v3/${maisonMereAAPId}/user-accounts-v2/${userAccountId}`,
            },
          },
        ]}
      />

      <h1>Informations de connexion</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">
        Voici les informations liées à votre compte collaborateur. Si vous
        souhaitez les modifier, adressez-vous directement à l’administrateur de
        la structure.
      </p>
      <UserAccountForm
        defaultValues={{
          firstname: userAccount.firstname || "",
          lastname: userAccount.lastname || "",
          email: userAccount.email,
        }}
        onSubmit={handleFormSubmit}
        backUrl={backUrl}
      />
    </div>
  );
};

export default InformationsConnexionPage;
