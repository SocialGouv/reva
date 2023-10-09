import {
  CandidateRegistrationForm,
  CandidateRegistrationFormSchema,
} from "@/components/candidate-registration/candidate-registration-form/CandidateRegistrationForm";
import {
  CandidateTypology,
  CandidateTypologySelect,
} from "@/components/candidate-registration/candidate-typology-select/CandidateTypologySelect";
import { CertificateAutocomplete } from "@/components/candidate-registration/certificate-autocomplete/CertificateAutocomplete";
import { CertificateCard } from "@/components/candidate-registration/certificate-card/CertificateCard";
import { WouldYouLikeToKnowMorePanel } from "@/components/candidate-registration/would-you-like-to-know-more-panel/WouldYouLikeToKnowMorePanel";
import { FullHeightBlueLayout } from "@/components/layout/full-height-blue-layout/FullHeightBlueLayout";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { Certification } from "@/graphql/generated/graphql";
import Notice from "@codegouvfr/react-dsfr/Notice";
import request from "graphql-request";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const getCertificationQuery = graphql(`
  query getCertification($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      typeDiplome {
        id
        label
      }
    }
  }
`);

const askForRegistrationMutation = graphql(`
  mutation candidate_askForRegistration($candidate: CandidateInput!) {
    candidate_askForRegistration(candidate: $candidate)
  }
`);

const OrientationCandidatPage = () => {
  const router = useRouter();
  const { certificationId } = router.query;

  const [candidateTypology, setCandidateTypology] = useState<
    CandidateTypology | undefined
  >();

  const [certification, setCertification] = useState<Pick<
    Certification,
    "id" | "label" | "codeRncp" | "typeDiplome"
  > | null>(null);

  const handleFormSubmit = async (form: CandidateRegistrationFormSchema) => {
    await request(GRAPHQL_API_URL, askForRegistrationMutation, {
      candidate: form,
    });
    router.push("/inscription-candidat/confirmation");
  };

  useEffect(() => {
    const updateCertification = async () => {
      if (certificationId) {
        setCertification(
          (
            await request(GRAPHQL_API_URL, getCertificationQuery, {
              certificationId: certificationId as string,
            })
          ).getCertification
        );
      }
    };
    updateCertification();
  }, [certificationId]);

  const invalidTypology =
    candidateTypology === "SALARIE_PUBLIC" || candidateTypology === "AUTRE";

  const validTypology = candidateTypology && !invalidTypology;

  return (
    <MainLayout>
      <Head>
        <title>Orientation candidat - France VAE</title>
      </Head>
      <FullHeightBlueLayout>
        <div className="w-full mx-auto flex flex-col">
          <h1 className="text-dsfrBlue-franceSun text-3xl font-bold mb-2">
            Démarrez votre parcours
          </h1>
          <p className="text-dsfrGray-mentionGrey mb-8">
            Tous les champs sont obligatoires
          </p>
          {certification && (
            <div className="flex flex-col ml-0 lg:ml-32 gap-4 max-w-7xl">
              <fieldset className="mb-4">
                <legend className="text-sm mb-2 text-dsfrGray-titleGrey">
                  Recherchez parmi les diplômes disponibles
                </legend>
                <CertificateAutocomplete
                  onOptionSelection={(o) =>
                    router.push(
                      `/inscription-candidat?certificationId=${o.value}`
                    )
                  }
                />
              </fieldset>
              <CertificateCard
                label={certification.label}
                rncpCode={certification.codeRncp}
                certificateType={certification.typeDiplome.label}
              />
              <h2 className="text-dsfrBlue-franceSun text-2xl font-bold mt-4 mb-2">
                Quel candidat êtes vous ?
              </h2>
              <div className="flex flex-col gap-2 lg:flex-row lg:gap-6">
                <CandidateTypologySelect
                  candidateTypology={candidateTypology}
                  onChange={setCandidateTypology}
                />
                {invalidTypology && (
                  <Notice
                    data-testid="candidate-typology-error-panel"
                    className="basis-1/2"
                    title={
                      candidateTypology === "SALARIE_PUBLIC"
                        ? "Le parcours VAE sur vae.gouv.fr n'est pas encore disponible dans votre situation. Dirigez-vous vers vae.centre-inffo.fr"
                        : "Prenez rendez-vous avec un conseiller près de chez vous pour être orienté."
                    }
                  />
                )}
              </div>
              {invalidTypology && <WouldYouLikeToKnowMorePanel />}
              {validTypology && (
                <>
                  <h2 className="text-dsfrBlue-franceSun text-2xl font-bold mt-8 mb-2">
                    Créez votre compte
                  </h2>
                  <CandidateRegistrationForm onSubmit={handleFormSubmit} />
                </>
              )}
            </div>
          )}
        </div>
      </FullHeightBlueLayout>
    </MainLayout>
  );
};

export default OrientationCandidatPage;
