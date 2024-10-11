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
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { CandidateBackground } from "@/components/layout/full-height-blue-layout/CandidateBackground";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { Certification } from "@/graphql/generated/graphql";
import { isUUID } from "@/utils";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
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

  const { isFeatureActive, status: featureFlippingServiceStatus } =
    useFeatureflipping();

  const candidacyCreationDisabled = isFeatureActive(
    "CANDIDACY_CREATION_DISABLED",
  );

  const affichageTypesFinancementCandidatureFeatureActive = isFeatureActive(
    "AFFICHAGE_TYPES_FINANCEMENT_CANDIDATURE",
  );
  const [candidateTypology, setCandidateTypology] = useState<
    CandidateTypology | undefined
  >();

  const [certification, setCertification] = useState<Pick<
    Certification,
    "id" | "label" | "codeRncp" | "typeDiplome"
  > | null>(null);

  const [typeAccompagnement, setTypeAccompagnement] = useState<
    "ACCOMPAGNE" | "AUTONOME" | null
  >(null);

  const defaultAutocompleteLabel = certification
    ? undefined
    : (searchText as string | undefined);

  const handleFormSubmit = async (form: CandidateRegistrationFormSchema) => {
    const actualTypeAccomagnement = isFeatureActive(
      "TYPE_ACCOMPAGNEMENT_CANDIDAT",
    )
      ? typeAccompagnement
      : "AUTONOME";
    await request(GRAPHQL_API_URL, askForRegistrationMutation, {
      candidate: {
        ...form,
        typeAccompagnement: actualTypeAccomagnement as
          | "AUTONOME"
          | "ACCOMPAGNE",
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

  const UNSUPPORTED_TYPOLOGIES =
    affichageTypesFinancementCandidatureFeatureActive
      ? ["SALARIE_PUBLIC"]
      : [
          "SALARIE_PUBLIC",
          "RETRAITE",
          "AIDANTS_FAMILIAUX_AGRICOLES",
          "TRAVAILLEUR_NON_SALARIE",
          "TITULAIRE_MANDAT_ELECTIF",
          "AUTRE",
        ];

  const invalidTypology =
    candidateTypology !== undefined &&
    UNSUPPORTED_TYPOLOGIES.includes(candidateTypology);

  const validTypology = candidateTypology && !invalidTypology;

  if (featureFlippingServiceStatus === "LOADING") {
    return null;
  }

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
          {isFeatureActive("TYPE_ACCOMPAGNEMENT_CANDIDAT") && (
            <p className="mb-12">
              Recherchez le diplôme que vous aimeriez obtenir en réalisant un
              parcours VAE. Vous avez la possibilité de réaliser ce diplôme avec
              un accompagnateur ou seul, en toute autonomie.
            </p>
          )}
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
              <>
                <div className="flex flex-col md:flex-row gap-4">
                  <CertificateCard
                    className="basis-1/2 flex-grow"
                    label={certification.label}
                    rncpCode={certification.codeRncp}
                    certificateType={certification.typeDiplome.label}
                  />
                  {affichageTypesFinancementCandidatureFeatureActive && (
                    <Notice
                      className="basis-1/2"
                      title={
                        <span>
                          <p className="mb-4">
                            Ce diplôme peut être financé par votre Compte
                            Personnel de Formation (
                            <Link
                              href="https://www.moncompteformation.gouv.fr/espace-prive/html/#/"
                              target="_blank"
                            >
                              CPF
                            </Link>
                            ).
                          </p>
                          <p className="mb-4">
                            Vous pouvez dès à présent consulter vos droits sur
                            la plateforme{" "}
                            <Link
                              href="https://www.moncompteformation.gouv.fr/espace-prive/html/#/droits"
                              target="_blank"
                            >
                              Mon Compte Formation
                            </Link>
                          </p>
                          <p></p>
                        </span>
                      }
                    />
                  )}
                </div>
                {isFeatureActive("TYPE_ACCOMPAGNEMENT_CANDIDAT") && (
                  <div>
                    <h2>Modalités de parcours</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <RadioButtons
                        className="inline"
                        legend="Que souhaitez-vous faire pour ce parcours ? "
                        options={[
                          {
                            label:
                              "Je souhaite réaliser ma VAE avec un accompagnateur",
                            nativeInputProps: {
                              value: "ACCOMPAGNE",
                              onChange: () =>
                                setTypeAccompagnement("ACCOMPAGNE"),
                            },
                          },
                          {
                            label: "Je souhaite réaliser ma VAE en autonomie",
                            nativeInputProps: {
                              value: "AUTONOME",
                              onChange: () => setTypeAccompagnement("AUTONOME"),
                            },
                          },
                        ]}
                      />
                      <CallOut
                        title="À quoi sert un accompagnateur ?"
                        classes={{ title: "pb-2" }}
                      >
                        C’est un expert de la VAE qui vous aide à chaque grande
                        étape de votre parcours : rédaction du dossier de
                        faisabilité, communication avec le certificateur,
                        préparation au passage devant le jury, etc.
                        <br />
                        <br />
                        <strong>Bon à savoir :</strong> ces accompagnements
                        peuvent être en partie financés par votre{" "}
                        <Link
                          href="https://www.moncompteformation.gouv.fr/espace-public/consulter-mes-droits-formation"
                          target="_blank"
                        >
                          Compte Personnel de Formation
                        </Link>
                        . En revanche, si vous faites ce parcours en autonomie,
                        les frais de jury seront à votre charge.
                      </CallOut>
                    </div>
                  </div>
                )}
                <div className="flex flex-col">
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
                            Votre situation ne vous permet pas de réaliser un
                            parcours VAE sur{" "}
                            <a href="https://vae.gouv.fr/" target="_blank">
                              vae.gouv.fr
                            </a>
                            . Pour savoir si d’autres options existent, vous
                            pouvez contacter dès à présent un{" "}
                            <a
                              href="https://vae.gouv.fr/savoir-plus/articles/liste-prc/"
                              target="_blank"
                            >
                              point relais conseil
                            </a>{" "}
                            ou un{" "}
                            <a
                              href="https://mon-cep.org/#trouver"
                              target="_blank"
                            >
                              conseiller en évolution professionnelle
                            </a>
                            .
                          </span>
                        }
                      />
                    )}
                    {validTypology && candidacyCreationDisabled && (
                      <Alert
                        severity="warning"
                        data-testid="candidate-typology-error-panel"
                        className="basis-1/2"
                        title={
                          <p className="font-normal">
                            Le dépôt de nouvelles candidatures est
                            temporairement indisponible. Nous vous remercions de
                            votre patience et nous excusons pour tout
                            désagrément.
                          </p>
                        }
                      />
                    )}
                  </div>
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
            {validTypology && !candidacyCreationDisabled && (
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
