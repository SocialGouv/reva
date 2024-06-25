import {
  ApolloClient,
  ApolloContextValue,
  getApolloContext,
} from "@apollo/client";
import Button from "@codegouvfr/react-dsfr/Button";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Download from "@codegouvfr/react-dsfr/Download";
import { FancyUpload } from "components/atoms/FancyUpload/FancyUpload";
import { Page } from "components/organisms/Page";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import { useContext, useState } from "react";
import { submitSwornStatement } from "services/candidacyServices";

export const FeasibilityDematSubmission = () => {
  const { state, mainService } = useMainMachineContext();
  const { candidacyId, organism } = state.context;

  const [swornStatementFile, setSwornStatementFile] = useState<
    File | undefined
  >();

  const { client } = useContext(
    getApolloContext() as React.Context<ApolloContextValue>,
  );

  const onSubmit = async () => {
    if (candidacyId && swornStatementFile) {
      try {
        await submitSwornStatement(client as ApolloClient<object>)({
          candidacyId: candidacyId,
          swornStatement: swornStatementFile,
        });
      } catch (error) {
        console.error(error);
      }

      mainService.send("BACK");
    }
  };

  return (
    <Page title="Dossier de faisabilité">
      <h1 className="mt-6">Dossier de faisabilité</h1>

      <form
        className="flex flex-col gap-12"
        onSubmit={(e) => {
          e.preventDefault();

          onSubmit();
        }}
      >
        <div className="flex flex-row gap-6">
          <div className="flex flex-col gap-8 min-h-[200px]">
            <h5 className="mb-0">Validation du dossier de faisabilité</h5>

            <p className="mb-0">
              Pour valider votre dossier, vous devez télécharger ce modèle
              d’attestation, le compléter, le signer et le joindre.
            </p>

            <Download
              className="mb-0"
              details="PDF – 61,88 Ko"
              label="Attestation_sur_l_honneur_modèle"
              linkProps={{
                title: "Attestation_sur_l_honneur_modèle",
                href: "",
              }}
            />
          </div>

          <CallOut
            className="min-h-[200px] flex justify-end flex-col-reverse gap-2"
            title="Besoin d’aide ? Contactez votre accompagnateur, il saura vous guider."
          >
            <>
              <span>{organism?.label}</span>
              <br />
              <span>{organism?.contactAdministrativeEmail}</span>
              <br />
              <span>{organism?.contactAdministrativePhone}</span>
            </>
          </CallOut>
        </div>

        <FancyUpload
          title="Joindre l’attestation sur l’honneur complétée et signée"
          hint="Format supporté : PDF uniquement avec un poids maximum de 20 Mo"
          nativeInputProps={{
            onChange: (e) => {
              setSwornStatementFile(e.target.files?.[0]);
            },
          }}
        />

        <div className="flex flex-row items-center justify-between">
          <Button
            type="button"
            data-test="back"
            priority="secondary"
            nativeButtonProps={{
              onClick: () => mainService.send("BACK"),
            }}
          >
            Retour
          </Button>

          <Button
            type="submit"
            data-test="submit"
            disabled={!swornStatementFile}
          >
            Envoyer
          </Button>
        </div>
      </form>
    </Page>
  );
};
