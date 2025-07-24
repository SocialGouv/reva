"use client";

import { useMemo } from "react";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

import { useUpdateUserAccountPage } from "./collaborateurUserAccount.hook";
import { UserAccountForm } from "./UserAccountForm";

const CollaborateurUserAccount = () => {
  const { userAccount, collaborateurOrganismsInfoStatus } =
    useUpdateUserAccountPage();

  const defaultValues = useMemo(
    () => ({
      email: userAccount?.email || "",
      firstname: userAccount?.firstname || "",
      lastname: userAccount?.lastname || "",
      organismId: userAccount?.organism?.id,
      modalitesAccompagnement:
        userAccount?.organism?.modaliteAccompagnement === "A_DISTANCE"
          ? ("REMOTE" as const)
          : ("ONSITE" as const),
    }),
    [
      userAccount?.email,
      userAccount?.firstname,
      userAccount?.lastname,
      userAccount?.organism?.id,
      userAccount?.organism?.modaliteAccompagnement,
    ],
  );

  if (
    collaborateurOrganismsInfoStatus !== "success" ||
    !userAccount ||
    !userAccount.organism
  ) {
    return null;
  }

  return (
    <div className="w-full flex flex-col">
      <h1 className="mb-12">
        {userAccount?.firstname} {userAccount?.lastname}
      </h1>
      <FormOptionalFieldsDisclaimer />
      <UserAccountForm
        defaultValues={defaultValues}
        emailFieldDisabled
        organism={{
          id: userAccount.organism.id,
          label: `${userAccount.organism.label} 
        ${`( ${
          userAccount.organism.nomPublic || "Nom commercial non renseignés"
        } )`}`,
        }}
      />
    </div>
  );
};

export default CollaborateurUserAccount;
