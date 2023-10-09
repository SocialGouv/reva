import { CertificateCard } from "@/components/candidate-registration/certificate-card/CertificateCard";
import { FullHeightBlueLayout } from "@/components/layout/full-height-blue-layout/FullHeightBlueLayout";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { Certification } from "@/graphql/generated/graphql";
import Alert from "@codegouvfr/react-dsfr/Alert";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Notice from "@codegouvfr/react-dsfr/Notice";
import Select from "@codegouvfr/react-dsfr/Select";
import request from "graphql-request";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type CandidateTypology =
  | "SALARIE_PRIVE"
  | "SALARIE_PUBLIC"
  | "DEMANDEUR_EMPLOI"
  | "BENEVOLE_OU_AIDANT_FAMILIAL"
  | "AUTRE";

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
              <CertificateCard
                label={certification.label}
                rncpCode={certification.codeRncp}
                certificateType={certification.typeDiplome.label}
              />
              <h2 className="text-dsfrBlue-franceSun text-2xl font-bold mt-4 mb-2">
                Quel candidat êtes vous ?
              </h2>
              <div className="flex flex-col gap-2 lg:flex-row lg:gap-6">
                <Select
                  data-testid="candidate-typology-select"
                  className="basis-1/2"
                  label="Votre statut"
                  nativeSelectProps={{
                    value: candidateTypology,
                    onChange: (e) =>
                      setCandidateTypology(e.target.value as CandidateTypology),
                  }}
                >
                  <option value={undefined} disabled selected></option>
                  <option value="SALARIE_PRIVE">
                    Je suis salarié du secteur privé
                  </option>
                  <option value="SALARIE_PUBLIC">
                    Je suis salarié du secteur public
                  </option>
                  <option value="DEMANDEUR_EMPLOI">
                    Je suis demandeur d'emploi
                  </option>
                  <option value="BENEVOLE_OU_AIDANT_FAMILIAL">
                    Je suis bénévole / aidant familial
                  </option>
                  <option value="AUTRE">Autre</option>
                </Select>
                {invalidTypology && (
                  <Notice
                    data-testid="candidate-typology-error-panel"
                    className="basis-1/2"
                    title="Le parcours VAE sur vae.gouv.fr n'est pas encore disponible dans votre situation. Dirigez-vous vers vae.centre-inffo.fr"
                  />
                )}
              </div>
              {invalidTypology && (
                <div
                  data-testid="candidate-typology-would-you-like-to-know-more-panel"
                  className="flex flex-col rounded-2xl border-2 border-dsfrBlue-openBlueFrance p-8 "
                >
                  {" "}
                  <h3 className="text-dsfrGray-titleGrey text-2xl font-bold">
                    <span
                      className="fr-icon-info-line mr-6"
                      aria-hidden="true"
                    />
                    En savoir plus
                  </h3>
                  <CallOut className="!mb-0">
                    <p>
                      Du fait de son déploiement progressif, tous les diplômes
                      ne sont pas encore couverts par France VAE.
                    </p>
                    <br />
                    <p>
                      Si vous ne trouvez pas votre diplôme dans la liste, nous
                      vous invitons à vous rapprocher d’un{" "}
                      <a
                        href="https://vae.centre-inffo.fr/?page=carte-prc"
                        title="point relais conseil - nouvelle fenêtre"
                      >
                        point relais conseil
                      </a>
                      , d’un{" "}
                      <a
                        href="https://mon-cep.org/#trouver"
                        title="conseiller en évolution professionnelle - nouvelle fenêtre"
                      >
                        conseiller en évolution professionnelle
                      </a>
                      , une{" "}
                      <a
                        href="https://www.transitionspro.fr/"
                        title="association de transition professionnelle (AT Pro) - nouvelle fenêtre"
                      >
                        association de transition professionnelle (AT Pro)
                      </a>
                      .
                    </p>
                  </CallOut>
                </div>
              )}
            </div>
          )}
        </div>
      </FullHeightBlueLayout>
    </MainLayout>
  );
};

export default OrientationCandidatPage;
