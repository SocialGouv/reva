"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useParams } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { UserAccountForm } from "@/components/settings/user-account-form/UserAccountForm";

import { useCollaborateurInformationsConnexion } from "./collaborateurInformationsConnexion.hooks";

const InformationsConnexionPage = () => {
  const { collaborateurUserAccountId }: { collaborateurUserAccountId: string } =
    useParams<{
      collaborateurUserAccountId: string;
    }>();

  const { userAccount } = useCollaborateurInformationsConnexion({
    collaborateurUserAccountId,
  });
  const backUrl = `/agencies-settings-v3/collaborateurs/${collaborateurUserAccountId}`;

  if (!userAccount) {
    return null;
  }
  return (
    <div className="w-full flex flex-col">
      <Breadcrumb
        currentPageLabel="Informations de connexion"
        segments={[
          {
            label: "Paramètres",
            linkProps: {
              href: `/agencies-settings-v3/collaborateurs/${collaborateurUserAccountId}`,
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
        disabled
        backUrl={backUrl}
      />
    </div>
  );
};

export default InformationsConnexionPage;
