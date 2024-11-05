"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useUpdateUserAccountPage } from "./agencyUserAccount.hook";
import { UserAccountForm } from "./UserAccountForm";
import { useMemo } from "react";

const AgencyUserAccount = () => {
  const { userAccount, agenciesInfoStatus } = useUpdateUserAccountPage();

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
    agenciesInfoStatus !== "success" ||
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
        agency={{
          id: userAccount.organism.id,
          label: `${userAccount.organism.label} 
        ${`( ${
          userAccount.organism.informationsCommerciales?.nom ||
          "Nom commercial non renseignés"
        } )`}`,
        }}
      />
    </div>
  );
};

export default AgencyUserAccount;
