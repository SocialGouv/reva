import {
  ApolloClient,
  ApolloContextValue,
  getApolloContext,
} from "@apollo/client";
import Button from "@codegouvfr/react-dsfr/Button";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Download from "@codegouvfr/react-dsfr/Download";
import { FancyUpload } from "components/atoms/FancyUpload/FancyUpload";
import { DffSummary } from "components/organisms/DffSummary/DffSummary";
import { Page } from "components/organisms/Page";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import { useContext, useMemo, useState } from "react";
import { createOrUpdateSwornStatement } from "services/candidacyServices";

export const FeasibilityDematSubmission = () => {
  const { state, mainService } = useMainMachineContext();
  const { candidacyId, organism, feasibilityDemat, candidacy } = state.context;

  const [swornStatementFile, setSwornStatementFile] = useState<
    File | undefined
  >();

  const { client } = useContext(
    getApolloContext() as React.Context<ApolloContextValue>,
  );

  const onSubmit = async () => {
    if (candidacyId && swornStatementFile) {
      try {
        await createOrUpdateSwornStatement(client as ApolloClient<object>)({
          candidacyId: candidacyId,
          swornStatement: swornStatementFile,
        });
      } catch (error) {
        console.error(error);
      }

      mainService.send("BACK");
    }
  };

  const remoteSwornStatementFile = useMemo(
    () =>
      feasibilityDemat?.swornStatementFile?.previewUrl
        ? {
            name: feasibilityDemat.swornStatementFile.name,
            url: feasibilityDemat.swornStatementFile.previewUrl,
            mimeType: feasibilityDemat.swornStatementFile.mimeType,
          }
        : undefined,
    [feasibilityDemat?.swornStatementFile],
  );

  if (!feasibilityDemat || !candidacy) {
    return null;
  }

  return (
    <Page title="Dossier de faisabilité">
      <h1 className="mt-6">Dossier de faisabilité</h1>

      <DffSummary
        dematerializedFeasibilityFile={feasibilityDemat}
        candidacy={candidacy}
      />

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
                href: "https://www.notion.so/fabnummas/Attestation-sur-l-honneur-du-candidat-pour-transmission-DF-parcours-sans-yousign-92e08c5625f54c269e969e6c5a00319f?pvs=4",
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
          defaultFile={remoteSwornStatementFile}
          nativeInputProps={{
            onChange: (e) => {
              setSwornStatementFile(e.target.files?.[0]);
            },
            accept: ".pdf, .jpg, .jpeg, .png",
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
