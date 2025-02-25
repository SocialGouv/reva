import {
  CandidateRegistrationFormLegacy,
  CandidateRegistrationFormSchema,
} from "@/components/candidate-registration/candidate-registration-form-legacy/CandidateRegistrationFormLegacy";
import { CandidateRegistrationForm } from "@/components/candidate-registration/candidate-registration-form/CandidateRegistrationForm";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { CertificateAutocompleteDsfr } from "@/components/candidate-registration/certificate-autocomplete-dsfr/CertificateAutocompleteDsfr";
import { CertificateCard } from "@/components/candidate-registration/certificate-card/CertificateCard";
import { WouldYouLikeToKnowMorePanel } from "@/components/candidate-registration/would-you-like-to-know-more-panel/WouldYouLikeToKnowMorePanel";
import { CandidateBackground } from "@/components/layout/full-height-blue-layout/CandidateBackground";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { Certification } from "@/graphql/generated/graphql";
import { isUUID } from "@/utils";
import Notice from "@codegouvfr/react-dsfr/Notice";
import request from "graphql-request";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const getCertificationQuery = graphql(`
  query getCertification($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      typeDiplome
      isAapAvailable
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
  const { isFeatureActive, status: featureFlippingStatus } =
    useFeatureflipping();

  const [certification, setCertification] = useState<Pick<
    Certification,
    "id" | "label" | "codeRncp" | "typeDiplome" | "isAapAvailable"
  > | null>(null);

  const defaultAutocompleteLabel = certification
    ? undefined
    : (searchText as string | undefined);

  const handleFormSubmit = async (
    form: CandidateRegistrationFormSchema & {
      typeAccompagnement: "AUTONOME" | "ACCOMPAGNE";
    },
  ) => {
    await request(GRAPHQL_API_URL, askForRegistrationMutation, {
      candidate: {
        ...form,
        certificationId: certificationId as string,
      },
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

  if (featureFlippingStatus !== "INITIALIZED") {
    return null;
  }

  return (
    <MainLayout>
      <Head>
        <title>Orientation candidat - France VAE</title>
      </Head>
      <CandidateBackground>
        {isFeatureActive("CANDIDATE_REGISTRATION_V2") ? (
          <CandidateRegistrationForm
            certification={
              // When the legacy version will be removed, we'll be able to remove the undefined check and set a proper loading screen.
              // For the moment, the legacy version need the undefined case to display the "no certification found" message,
              // which won't be the case anymore with this new version
              certification || {
                id: "",
                label: "",
                codeRncp: "",
                isAapAvailable: false,
              }
            }
            onSubmit={handleFormSubmit}
          />
        ) : (
          <div className="flex flex-col px-4 pt-10 pb-8">
            <h1 className="text-4xl font-bold mb-0">Démarrez votre parcours</h1>
            <p className="text-dsfrGray-mentionGrey mb-8">
              Tous les champs sont obligatoires
            </p>
            <p className="mb-12">
              Recherchez le diplôme que vous aimeriez obtenir en réalisant un
              parcours VAE. Vous avez la possibilité de réaliser ce diplôme avec
              un accompagnateur ou seul, en toute autonomie.
            </p>
            <div className="flex flex-col ml-0 gap-12">
              <fieldset className="mb-4 max-w-lg">
                <CertificateAutocompleteDsfr
                  defaultLabel={defaultAutocompleteLabel}
                  onSubmit={({ label, value }) => {
                    const certificationId = isUUID(value) ? value : null;
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
                <div className="flex flex-col gap-12">
                  <div className="flex flex-col md:flex-row gap-4">
                    <CertificateCard
                      className="basis-1/2 flex-grow"
                      label={certification.label}
                      rncpCode={certification.codeRncp}
                      certificateType={certification.typeDiplome || ""}
                    />
                    <Notice
                      className="basis-1/2"
                      title={
                        <span>
                          <p className="mb-4">
                            Ce diplôme peut être financé par votre{" "}
                            <Link
                              href="https://www.moncompteformation.gouv.fr/espace-prive/html/#/"
                              target="_blank"
                            >
                              Compte Personnel de Formation
                            </Link>{" "}
                            (CPF). Vous pouvez dès à présent consulter vos
                            droits sur la plateforme Mon Compte Formation.
                          </p>
                          <p>
                            Article utile :{" "}
                            <Link
                              href="https://vae.gouv.fr/savoir-plus/articles/financer-son-accompagnement-vae/"
                              target="_blank"
                            >
                              Comment financer un parcours VAE ?
                            </Link>
                          </p>
                        </span>
                      }
                    />
                  </div>

                  <CandidateRegistrationFormLegacy
                    typeAccompagnement={
                      !certification.isAapAvailable ? "AUTONOME" : undefined
                    }
                    onSubmit={handleFormSubmit}
                  />
                </div>
              )}
              {!certification && <WouldYouLikeToKnowMorePanel />}
            </div>
          </div>
        )}
      </CandidateBackground>
    </MainLayout>
  );
};

export default OrientationCandidatPage;
