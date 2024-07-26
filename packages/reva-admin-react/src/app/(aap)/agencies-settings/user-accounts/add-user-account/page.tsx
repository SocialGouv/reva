"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import {
  UserAccountForm,
  UserAccountFormData,
} from "../_components/UserAccountForm";
import { useAddUserAccountPage } from "./addUserAccount.hook";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useRouter } from "next/navigation";

const AddUserAccountPage = () => {
  const { headAgency, nonHeadAgencies, createUserAccount } =
    useAddUserAccountPage();
  const router = useRouter();

  const handleFormSubmit = async (data: UserAccountFormData) => {
    try {
      await createUserAccount.mutateAsync({
        accountEmail: data.email,
        accountFirstname: data.firstname,
        accountLastname: data.lastname,
        organismId: data.organismId,
      });
      successToast("Modification enregistrées");
      router.push("/agencies-settings/legal-information");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };
  return (
    <div className="w-full flex flex-col">
      <h1 className="mb-12">Ajout d’un compte collaborateur</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Le collaborateur ajouté recevra un mail afin de créer son compte. Il
        pourra compléter et modifier les informations qui seront affichées aux
        candidats depuis son compte.
      </p>
      <UserAccountForm
        onSubmit={handleFormSubmit}
        remoteAgency={{
          id: headAgency?.id,
          label:
            headAgency?.informationsCommerciales?.nom ||
            headAgency?.label ||
            "",
        }}
        onSiteAgencies={nonHeadAgencies.map((a) => ({
          id: a.id,
          label: a.informationsCommerciales?.nom || a.label,
        }))}
      />
    </div>
  );
};

export default AddUserAccountPage;
