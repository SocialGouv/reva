"use client";
import { useAgencyManagerPage } from "./agencyManagerPage.hook";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";

const AgencyManagerPage = () => {
  const { account, organismQueryStatus, refetchOrganism } =
    useAgencyManagerPage();

  return (
    <div className="flex flex-col pb-12">
      <h1>Information du responsable d'agence</h1>

      {organismQueryStatus === "error" && (
        <Alert
          className="mb-6"
          severity="error"
          title="Une erreur est survenue pendant la récupération de l'agence."
        />
      )}

      {organismQueryStatus === "success" && (
        <form>
          <fieldset className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              disabled
              nativeInputProps={{ value: account?.firstname || "" }}
            />
            <Input
              label="Nom"
              disabled
              nativeInputProps={{ value: account?.lastname || "" }}
            />
            <Input
              className="col-span-2"
              label="Email"
              disabled
              nativeInputProps={{ value: account?.email || "" }}
            />
          </fieldset>
        </form>
      )}
    </div>
  );
};

export default AgencyManagerPage;
