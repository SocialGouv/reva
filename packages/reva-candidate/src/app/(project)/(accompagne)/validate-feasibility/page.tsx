"use client";

import { redirect, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import Button from "@codegouvfr/react-dsfr/Button";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Download from "@codegouvfr/react-dsfr/Download";

import { PageLayout } from "@/layouts/page.layout";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

import { FancyUpload } from "@/components/legacy/atoms/FancyUpload/FancyUpload";
import { DffSummary } from "@/components/legacy/organisms/DffSummary/DffSummary";

import { graphqlErrorToast } from "@/components/toast/toast";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { useQueryClient } from "@tanstack/react-query";

import dynamic from "next/dynamic";
import { useValidateFeasibility } from "./validate-feasibility.hooks";
import { GraphQLError } from "graphql";

// The ButtonConvertHtmlToPdf component uses html2pdf, which relies on the window object and causes issues during server-side rendering (SSR) builds.
// We use dynamic import to ensure the component is only loaded on the client side.
const ButtonConvertHtmlToPdf = dynamic(
  () =>
    import(
      "@/components/button-convert-html-to-pdf/ButtonConvertHtmlToPdf"
    ).then((mod) => mod.ButtonConvertHtmlToPdf),
  { ssr: false },
);

export default function ValidateFeasibility() {
  const router = useRouter();

  const { candidacy, dematerializedFeasibilityFile } = useCandidacy();
  const queryClient = useQueryClient();
  const { createOrUpdateSwornStatement, dffCandidateConfirmation } =
    useValidateFeasibility();

  const { mutateAsync: dffCandidateConfirmationMutation } =
    dffCandidateConfirmation;

  const [swornStatementFile, setSwornStatementFile] = useState<
    File | undefined
  >();
  const [candidateConfirmation, setCandidateConfirmation] = useState(false);
  const [candidateDecisionComment, setCandidateDecisionComment] = useState(
    dematerializedFeasibilityFile?.candidateDecisionComment ?? "",
  );
  const candidateHasConfirmedFeasibility =
    dematerializedFeasibilityFile?.candidateConfirmationAt;

  const { organism } = candidacy;

  const formIsDisabled =
    !candidateConfirmation || !!candidateHasConfirmedFeasibility;

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
      if (swornStatementFile) {
        const response = await createOrUpdateSwornStatement({
          candidacyId: candidacy.id,
          swornStatement: swornStatementFile!,
        });
        if (!response) {
          throw new GraphQLError("Erreur lors de la création de l'attestation");
        }
      }
      await dffCandidateConfirmationMutation({
        candidacyId: candidacy.id,
        dematerializedFeasibilityFileId: dematerializedFeasibilityFile.id,
        input: {
          candidateDecisionComment,
        },
      });
      queryClient.invalidateQueries({
        queryKey: ["candidate"],
      });
      router.push("/");
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <PageLayout title="Dossier de faisabilité" displayBackToHome>
      <div className="flex justify-between mb-4 mt-6">
        <h1 className="mb-0">Dossier de faisabilité </h1>
        <ButtonConvertHtmlToPdf
          label="Télécharger le dossier de faisabilité"
          elementId="dff-to-print"
          filename="dossier_de_faisabilite.pdf"
        />
      </div>

      <DffSummary
        candidateDecisionComment={candidateDecisionComment}
        setCandidateDecisionComment={setCandidateDecisionComment}
      />

      <form
        className="flex flex-col gap-12"
        onSubmit={(e) => {
          e.preventDefault();

          onSubmit();
        }}
        data-html2canvas-ignore="true"
      >
        <div className="flex flex-col gap-3">
          <h2 className="mb-0">Validation du dossier de faisabilité</h2>

          <p className="mb-0 text-xl">
            Pour valider votre dossier, vous devez télécharger ce modèle
            d’attestation, le compléter, le signer et le joindre.
          </p>

          <div className="flex gap-6">
            <div className="flex flex-col gap-8 flex-[1]">
              <Download
                className="mb-0"
                details="PDF - 1455 Ko"
                label="Modèle d'attestation sur l'honneur"
                linkProps={{
                  title: "Attestation_sur_l_honneur_modèle",
                  href: "/files/attestation_sur_l_honneur_modele.pdf",
                  target: "_blank",
                }}
              />

              <p>
                <b>
                  Vous ne pouvez pas télécharger votre attestation ou ne
                  parvenez pas à la remplir ?
                </b>{" "}
                Demandez à votre accompagnateur de le faire pour vous.
              </p>
            </div>

            <CallOut
              className="min-h-[200px] flex justify-end flex-col-reverse gap-2 flex-[1]"
              title="Comment contacter mon accompagnateur ?"
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
            disabled: !!candidateHasConfirmedFeasibility,
          }}
        />

        {!candidateHasConfirmedFeasibility && (
          <Checkbox
            options={[
              {
                label: "J'ai lu et accepte cette version du dossier.",
                nativeInputProps: {
                  onChange: (e) => {
                    setCandidateConfirmation(e.target.checked);
                  },
                  checked: candidateConfirmation,
                  disabled:
                    !dematerializedFeasibilityFile?.isReadyToBeSentToCandidate,
                },
              },
            ]}
          />
        )}

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
            disabled={
              formIsDisabled ||
              !dematerializedFeasibilityFile?.isReadyToBeSentToCandidate
            }
          >
            Envoyer
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}
