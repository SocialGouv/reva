"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useParams } from "next/navigation";
import { useUpdateUserAccountPage } from "./updateUserAccount.hook";
import { UserAccountForm } from "../_components/UserAccountForm";

const UpdateUserAccountPage = () => {
  const { userAccountId } = useParams<{ userAccountId: string }>();
  const { userAccount, headAgency, nonHeadAgencies } = useUpdateUserAccountPage(
    { userAccountId },
  );

  const handleFormSubmit = async () => {};

  return (
    <div className="w-full flex flex-col">
      <h1 className="mb-12">
        {userAccount?.firstname} {userAccount?.lastname}
      </h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Le collaborateur ajouté recevra un mail afin de créer son compte. Il
        pourra compléter et modifier les informations qui seront affichées aux
        candidats depuis son compte.
      </p>
      <UserAccountForm
        onSubmit={handleFormSubmit}
        defaultValues={{
          email: userAccount?.email || "",
          firstname: userAccount?.firstname || "",
          lastname: userAccount?.lastname || "",
          organismId: userAccount?.organism?.id,
          modalitesAccompagnement: userAccount?.organism?.isHeadAgency
            ? "REMOTE"
            : "ONSITE",
        }}
        emailFieldDisabled
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

export default UpdateUserAccountPage;
