"use client";

import { useMemo, useState } from "react";
import { redirect, useRouter } from "next/navigation";

import Button from "@codegouvfr/react-dsfr/Button";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Download from "@codegouvfr/react-dsfr/Download";

import { PageLayout } from "@/layouts/page.layout";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

import { DffSummary } from "@/components/legacy/organisms/DffSummary/DffSummary";
import { FancyUpload } from "@/components/legacy/atoms/FancyUpload/FancyUpload";

import { useValidateFeasibility } from "./validate-feasibility.hooks";

export default function ValidateFeasibility() {
  const router = useRouter();

  const { candidacy, refetch } = useCandidacy();

  const { createOrUpdateSwornStatement } = useValidateFeasibility();

  const [swornStatementFile, setSwornStatementFile] = useState<
    File | undefined
  >();

  const { organism, dematerializedFeasibilityFile } = candidacy;

  const remoteSwornStatementFile = useMemo(
    () =>
      dematerializedFeasibilityFile?.swornStatementFile?.previewUrl
        ? {
            name: dematerializedFeasibilityFile.swornStatementFile.name,
            url: dematerializedFeasibilityFile.swornStatementFile.previewUrl,
            mimeType: dematerializedFeasibilityFile.swornStatementFile.mimeType,
          }
        : undefined,
    [dematerializedFeasibilityFile],
  );

  if (!dematerializedFeasibilityFile) {
    redirect("/");
  }

  const onSubmit = async () => {
    try {
      const response = await createOrUpdateSwornStatement({
        candidacyId: candidacy.id,
        swornStatement: swornStatementFile!,
      });
      if (response) {
        refetch();
        router.push("/");
      }
    } catch (error) {}
  };

  return (
    <PageLayout title="Dossier de faisabilité" displayBackToHome>
      <h2 className="mt-6 mb-4">Dossier de faisabilité </h2>

      <DffSummary />

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
              onClick: () => {
                router.push("/");
              },
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
    </PageLayout>
  );
}
