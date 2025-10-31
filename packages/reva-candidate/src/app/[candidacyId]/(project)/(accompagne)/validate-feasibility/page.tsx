"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Download from "@codegouvfr/react-dsfr/Download";
import { GraphQLError } from "graphql";
import { deburr } from "lodash";
import { redirect, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useAnonymousFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { FancyUpload } from "@/components/legacy/atoms/FancyUpload/FancyUpload";
import { PdfLink } from "@/components/legacy/organisms/DffSummary/components/PdfLink";
import { DffSummary } from "@/components/legacy/organisms/DffSummary/DffSummary";
import { graphqlErrorToast } from "@/components/toast/toast";
import { REST_API_URL } from "@/config/config";
import { PageLayout } from "@/layouts/page.layout";

import { useValidateFeasibility } from "./validate-feasibility.hooks";

export default function ValidateFeasibility() {
  const router = useRouter();

  const { isFeatureActive } = useAnonymousFeatureFlipping();

  const isUseGeneratedDffFileFromFileServerActive = isFeatureActive(
    "USE_GENERATED_DFF_FILE_FROM_FILE_SERVER",
  );

  const {
    createOrUpdateSwornStatement,
    dffCandidateConfirmation,
    candidacy,
    dematerializedFeasibilityFile,
    candidate,
  } = useValidateFeasibility();

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

  const candidateName = deburr(
    `${candidate?.givenName ? candidate?.givenName : candidate?.lastname}_${candidate?.firstname}`,
  ).toLowerCase();

  if (!candidacy) {
    return null;
  }

  if (!dematerializedFeasibilityFile) {
    redirect("../");
  }

  const getPdfUrl = () => {
    return `${REST_API_URL}/candidacy/${candidacy.id}/feasibility/file-demat/${dematerializedFeasibilityFile.id}`;
  };

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
      router.push("../");
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <PageLayout title="Dossier de faisabilité" displayBackToHome>
      <div className="flex justify-between mb-4 mt-6">
        <h1 className="mb-0">Dossier de faisabilité </h1>

        {isUseGeneratedDffFileFromFileServerActive ? (
          <>
            {dematerializedFeasibilityFile.dffFile ? (
              <PdfLink
                url={dematerializedFeasibilityFile.dffFile.url}
                fileName={`dossier_de_faisabilite_${candidateName}.pdf`}
              />
            ) : null}
          </>
        ) : (
          <PdfLink
            url={getPdfUrl()}
            isBlobUrl
            fileName={`dossier_de_faisabilite_${candidateName}.pdf`}
          />
        )}
      </div>

      <DffSummary
        candidacy={candidacy}
        candidateDecisionComment={candidateDecisionComment}
        setCandidateDecisionComment={setCandidateDecisionComment}
      />

      <form
        className="flex flex-col gap-12"
        onSubmit={(e) => {
          e.preventDefault();

          onSubmit();
        }}
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
            data-testid="back"
            priority="secondary"
            nativeButtonProps={{
              onClick: () => {
                router.push("../");
              },
            }}
          >
            Retour
          </Button>

          <Button
            type="submit"
            data-testid="submit"
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
