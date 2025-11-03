"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";

import { useAuth } from "@/components/auth/auth";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

import { useGestionnaireMaisonMereAAPUserAccount } from "./gestionnaireMaisonMereAAPUserAccount.hook";

export const GestionnaireMaisonMereAAPUserAccount = ({
  maisonMereAAPId,
  userAccountId,
}: {
  maisonMereAAPId: string;
  userAccountId: string;
}) => {
  const { isAdmin } = useAuth();

  const backUrl = isAdmin
    ? `/maison-mere-aap/${maisonMereAAPId}`
    : `/agencies-settings-v3`;

  const { userAccount } = useGestionnaireMaisonMereAAPUserAccount({
    maisonMereAAPId,
    userAccountId,
  });
  return (
    <div className="w-full flex flex-col">
      <h1 className="mb-12">
        {userAccount?.firstname} {userAccount?.lastname}
      </h1>
      <FormOptionalFieldsDisclaimer />
      <Button priority="secondary" linkProps={{ href: backUrl }}>
        Retour aux collaborateurs
      </Button>
    </div>
  );
};
