"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { useLegalInformationsPage } from "./legalInformationsPage.hook";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useAuth } from "@/components/auth/auth";

const LegalInformationPage = () => {
  const { maisonMereAAP, legalInformationsStatus } = useLegalInformationsPage();
  const { isGestionnaireMaisonMereAAP } = useAuth();
  const { isFeatureActive } = useFeatureflipping();
  return (
    <div className="flex flex-col w-full">
      <h1>Informations juridiques</h1>

      {legalInformationsStatus === "error" && (
        <Alert
          className="mb-6"
          severity="error"
          title="Une erreur est survenue pendant la récupération des informations juridiques."
        />
      )}
      {legalInformationsStatus == "success" && (
        <>
          {maisonMereAAP && (
            <fieldset className="flex flex-col gap-4 mb-8">
              <h2 className="leading-6 font-bold">
                Informations juridiques de l'établissement
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="SIRET de l'établissement"
                  nativeInputProps={{
                    value: maisonMereAAP.siret,
                  }}
                  disabled
                />

                <Input
                  label="Forme juridique"
                  nativeInputProps={{
                    value: maisonMereAAP.statutJuridique,
                  }}
                  disabled
                />

                <Input
                  label="Raison sociale"
                  nativeInputProps={{
                    value: maisonMereAAP.raisonSociale,
                  }}
                  disabled
                />

                <Input
                  label="Site internet de l'établissement"
                  nativeInputProps={{
                    value: maisonMereAAP.siteWeb ?? "",
                  }}
                  disabled
                />
              </div>
            </fieldset>
          )}

          <fieldset className="flex flex-col gap-4 mb-8">
            <h2 className="leading-6 font-bold">Adresse de l'établissement</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                className="col-span-2"
                label="Numéro et nom de rue"
                nativeInputProps={{
                  value: maisonMereAAP?.adresse ?? "",
                }}
                disabled
              />
              <Input
                label="Code postal"
                nativeInputProps={{
                  value: maisonMereAAP?.codePostal ?? "",
                }}
                disabled
              />
              <Input
                label="Ville"
                nativeInputProps={{
                  value: maisonMereAAP?.ville ?? "",
                }}
                disabled
              />
            </div>
          </fieldset>
          {isFeatureActive("LEGAL_INFORMATION_VALIDATION") &&
            isGestionnaireMaisonMereAAP && (
              <div className="flex flex-col border p-6">
                <h2>Mise à jour du compte</h2>
                <Badge severity="warning" className="mb-6">
                  À mettre à jour
                </Badge>
                <p>
                  Pour s'assurer de la conformité des inscriptions, nous
                  vérifions les documents administratifs et légaux de chaque
                  organisme d'accompagnement.
                </p>
                <p>
                  Voici les documents en version numérique que vous devez
                  préparer :
                </p>
                <br />
                <p>
                  <strong>Documents requis pour tous les organismes :</strong>
                </p>
                <ul>
                  <li>
                    Attestation URSSAF (qui affiche le code de vérification) -
                    Exemples : attestation de vigilance, attestation fiscale.
                  </li>
                  <li>
                    Une copie du justificatif d'identité du dirigeant "certifiée
                    conforme à l'original” signée par lui-même
                  </li>
                </ul>
                <br />
                <p>
                  <strong>
                    Si l'administrateur du compte France VAE et le dirigeant
                    sont différents, ajoutez également :
                  </strong>
                </p>
                <ul>
                  <li>
                    Une lettre de délégation signée par le dirigeant et le
                    délégataire
                  </li>
                  <li>
                    Une copie du justificatif d'identité de la personne ayant
                    reçu délégation.
                  </li>
                </ul>
                <p>Assurez-vous d'avoir ces documents en version numérique.</p>
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default LegalInformationPage;
