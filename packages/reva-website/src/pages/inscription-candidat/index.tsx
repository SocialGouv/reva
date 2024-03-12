import { push } from "@/components/analytics/matomo-tracker/matomoTracker";
import {
  CandidateRegistrationForm,
  CandidateRegistrationFormSchema,
} from "@/components/candidate-registration/candidate-registration-form/CandidateRegistrationForm";
import {
  CandidateTypology,
  CandidateTypologySelect,
} from "@/components/candidate-registration/candidate-typology-select/CandidateTypologySelect";
import { CertificateAutocompleteDsfr } from "@/components/candidate-registration/certificate-autocomplete-dsfr/CertificateAutocompleteDsfr";
import { CertificateCard } from "@/components/candidate-registration/certificate-card/CertificateCard";
import { WouldYouLikeToKnowMorePanel } from "@/components/candidate-registration/would-you-like-to-know-more-panel/WouldYouLikeToKnowMorePanel";
import { FullHeightBlueLayout } from "@/components/layout/full-height-blue-layout/FullHeightBlueLayout";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { Certification } from "@/graphql/generated/graphql";
import { isUUID } from "@/utils";
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
  const { certificationId, searchText } = router.query;

  const [candidateTypology, setCandidateTypology] = useState<
    CandidateTypology | undefined
  >();

  const [certification, setCertification] = useState<Pick<
    Certification,
    "id" | "label" | "codeRncp" | "typeDiplome"
  > | null>(null);

  const defaultAutocompleteLabel = certification
    ? undefined
    : (searchText as string | undefined);

  const handleFormSubmit = async (form: CandidateRegistrationFormSchema) => {
    await request(GRAPHQL_API_URL, askForRegistrationMutation, {
      candidate: { ...form, certificationId: certificationId as string },
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
      } else {
        setCertification(null);
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
          <div className="flex flex-col ml-0 lg:ml-32 gap-4 max-w-7xl">
            <fieldset className="mb-4">
              <CertificateAutocompleteDsfr
                defaultLabel={defaultAutocompleteLabel}
                onSubmit={({ label, value }) => {
                  const certificationId = isUUID(value) ? value : null;
                  push(["trackEvent", "website-diplome", "recherche", label]);
                  router.push({
                    pathname: "/inscription-candidat",
                    query: { certificationId, searchText: label },
                  });
                }}
                onOptionSelection={(o) =>
                  router.push({
                    pathname: "/inscription-candidat",
                    query: { certificationId: o.value },
                  })
                }
              />
            </fieldset>
            {certification && (
              <>
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
                      title={`Le parcours VAE sur vae.gouv.fr n'est pas encore disponible dans votre situation. Nous vous invitons à vous rapprocher d’un point relais conseil, d’un conseiller en évolution professionnelle, une association de transition professionnelle (AT Pro).`}
                    />
                  )}
                </div>
              </>
            )}
            {!certification && (
              <p className="text-lg font-bold">
                Le diplôme que vous recherchez n’est pas encore couvert par
                France VAE.
              </p>
            )}

            {!certification && <WouldYouLikeToKnowMorePanel />}
            {validTypology && (
              <>
                <h2 className="text-dsfrBlue-franceSun text-2xl font-bold mt-8 mb-2">
                  Créez votre compte
                </h2>
                <CandidateRegistrationForm onSubmit={handleFormSubmit} />
              </>
            )}
          </div>
        </div>
      </FullHeightBlueLayout>
    </MainLayout>
  );
};

export default OrientationCandidatPage;
