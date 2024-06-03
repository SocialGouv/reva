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
import { CandidateBackground } from "@/components/layout/full-height-blue-layout/CandidateBackground";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { Certification } from "@/graphql/generated/graphql";
import { isUUID } from "@/utils";
import Alert from "@codegouvfr/react-dsfr/Alert";
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
          ).getCertification,
        );
      } else {
        setCertification(null);
      }
    };
    updateCertification();
  }, [certificationId]);

  const invalidTypology =
    candidateTypology === "SALARIE_PUBLIC" || candidateTypology === "AUTRE";

  const validTypology = false;

  return (
    <MainLayout>
      <Head>
        <title>Orientation candidat - France VAE</title>
      </Head>
      <CandidateBackground>
        <div className="flex flex-col px-4 pt-10 pb-8">
          <h1 className="text-4xl font-bold mb-0">Démarrez votre parcours</h1>
          <p className="text-dsfrGray-mentionGrey mb-8">
            Tous les champs sont obligatoires
          </p>
          <div className="flex flex-col ml-0 gap-4">
            <fieldset className="mb-4 max-w-lg">
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
                <h2 className="text-2xl font-bold mt-4 mb-0">
                  Quel candidat êtes vous ?
                </h2>
                <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                  <span className="max-w-lg basis-1/2">
                    <CandidateTypologySelect
                      candidateTypology={candidateTypology}
                      onChange={setCandidateTypology}
                    />
                  </span>
                  {invalidTypology && (
                    <Notice
                      data-testid="candidate-typology-error-panel"
                      className="basis-1/2"
                      title={
                        <span>
                          Le parcours VAE sur vae.gouv.fr n'est pas encore
                          disponible dans votre situation. Nous vous invitons à
                          vous rapprocher d’un{" "}
                          <a
                            href="https://airtable.com/appQT21E7Sy70YfSB/shrgvhoKYW1EsXUu5/tblQgchiTKInxOqqr"
                            target="_blank"
                          >
                            point relais conseil
                          </a>
                          , d’un{" "}
                          <a
                            href="https://mon-cep.org/#trouver"
                            target="_blank"
                          >
                            conseiller en évolution professionnelle
                          </a>
                          , une{" "}
                          <a
                            href="https://www.transitionspro.fr/"
                            target="_blank"
                          >
                            association de transition professionnelle (AT Pro).
                          </a>
                        </span>
                      }
                    />
                  )}
                  {candidateTypology && !invalidTypology && (
                    <Alert
                      severity="warning"
                      data-testid="candidate-typology-error-panel"
                      className="basis-1/2"
                      title={
                        <div className="flex flex-col items-start gap-2 font-normal">
                          <h2 className="font-bold text-xl">
                            Maintenance en cours
                          </h2>
                          <p>
                            En raison d'une maintenance en cours sur notre site,
                            le dépôt de nouvelles candidatures est
                            temporairement indisponible. Nous vous remercions de
                            votre patience et nous excusons pour tout
                            désagrément.
                          </p>
                        </div>
                      }
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
                <h2 className="text-2xl font-bold mt-8 mb-0">
                  Créez votre compte
                </h2>
                <CandidateRegistrationForm onSubmit={handleFormSubmit} />
              </>
            )}
          </div>
        </div>
      </CandidateBackground>
    </MainLayout>
  );
};

export default OrientationCandidatPage;
