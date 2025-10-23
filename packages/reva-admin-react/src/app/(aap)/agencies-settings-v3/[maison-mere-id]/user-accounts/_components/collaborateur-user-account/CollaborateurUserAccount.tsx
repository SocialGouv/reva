"use client";

import { useMemo } from "react";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

import { useUpdateUserAccountPage } from "./collaborateurUserAccount.hook";
import { UserAccountForm } from "./UserAccountForm";

const CollaborateurUserAccount = () => {
  const { userAccount, collaborateurOrganismsInfoStatus } =
    useUpdateUserAccountPage();

  //TODO: gérer le cas où l'utilisateur a plusieurs organismes lorsque les interfaces seront prêtes
  //Pour l'instant le compte à au plus un organisme
  const organism = userAccount?.organisms?.[0];

  const defaultValues = useMemo(
    () => ({
      email: userAccount?.email || "",
      firstname: userAccount?.firstname || "",
      lastname: userAccount?.lastname || "",
      organismId: organism?.id,
      modalitesAccompagnement:
        organism?.modaliteAccompagnement === "A_DISTANCE"
          ? ("REMOTE" as const)
          : ("ONSITE" as const),
    }),
    [
      userAccount?.email,
      userAccount?.firstname,
      userAccount?.lastname,
      organism?.id,
      organism?.modaliteAccompagnement,
    ],
  );

  if (
    collaborateurOrganismsInfoStatus !== "success" ||
    !userAccount ||
    !organism
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
          id: organism.id,
          label: `${organism.label} 
        ${`( ${organism.nomPublic || "Nom commercial non renseignés"} )`}`,
        }}
      />
    </div>
  );
};

export default CollaborateurUserAccount;
