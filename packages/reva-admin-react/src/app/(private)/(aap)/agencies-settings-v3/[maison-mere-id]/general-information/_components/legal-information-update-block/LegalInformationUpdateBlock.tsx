import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";

import { GrayCard } from "@/components/card/gray-card/GrayCard";

import { StatutValidationInformationsJuridiquesMaisonMereAap } from "@/graphql/generated/graphql";

interface Decision {
  id: string;
  aapComment: string;
  decisionTakenAt: Date;
}

export const LegalInformationUpdateBlock = ({
  statutValidationInformationsJuridiquesMaisonMereAAP,
  decisions,
  onUpdateButtonClick,
}: {
  statutValidationInformationsJuridiquesMaisonMereAAP: StatutValidationInformationsJuridiquesMaisonMereAap;
  decisions: Decision[];
  onUpdateButtonClick(): void;
}) => {
  return (
    <div className="flex flex-col gap-8 my-4">
      <div className="flex flex-col border p-6">
        <h2>Mise à jour du compte</h2>
        {statutValidationInformationsJuridiquesMaisonMereAAP === "A_JOUR" && (
          <UpToDateStatusBlock />
        )}
        {statutValidationInformationsJuridiquesMaisonMereAAP ===
          "EN_ATTENTE_DE_VERIFICATION" && <ValidationPendingStatusBlock />}

        {statutValidationInformationsJuridiquesMaisonMereAAP ===
          "A_METTRE_A_JOUR" && (
          <NeedUpdateStatusBlock
            onUpdateButtonClick={onUpdateButtonClick}
            decisions={decisions}
          />
        )}
      </div>
    </div>
  );
};

const UpToDateStatusBlock = () => (
  <Badge severity="success">Compte à jour</Badge>
);

const ValidationPendingStatusBlock = () => (
  <>
    <Badge severity="info">En attente de vérification</Badge>
    <br />
    <p>
      Vos documents et informations ont bien été envoyés. Vous recevrez un
      courriel de la part de France VAE, dès que ces informations auront été
      traitées.
    </p>
  </>
);

const NeedUpdateStatusBlock = ({
  onUpdateButtonClick,
  decisions,
}: {
  onUpdateButtonClick(): void;
  decisions: Decision[];
}) => {
  return (
    <>
      {!!decisions.length && (
        <div className="flex flex-col mb-10 gap-6">
          {decisions.map((d) => (
            <GrayCard key={d.id}>
              <dt className="font-bold text-xl">Retour des pièces jointes :</dt>
              <dd>Retournées le {format(d.decisionTakenAt, "dd/MM/yyyy")}</dd>
              <br />
              <dt className="font-bold text-xl">Commentaire :</dt>
              <dd>{d.aapComment}</dd>
            </GrayCard>
          ))}
        </div>
      )}
      <Badge severity="warning" className="mb-8">
        À mettre à jour
      </Badge>
      <br />
      <p>
        Pour nous assurer de la conformité des inscriptions, nous vérifions les
        documents administratifs et légaux de chaque organisme d'accompagnement.
      </p>
      <p>Voici les documents en version numérique que vous devez préparer :</p>
      <br />
      <p>
        <strong>Documents requis pour tous les organismes :</strong>
      </p>
      <ul>
        <li>
          Attestation URSSAF (qui affiche le code de sécurité) - Exemples :
          attestation de vigilance, attestation fiscale.
        </li>
        <li>
          Une copie du justificatif d’identité du dirigeant faisant apparaître
          son nom et prénom, ainsi que la mention suivante : «J’atteste avoir
          fourni le présent justificatif d’identité.» Il devra également dater
          et signer le justificatif.
        </li>
      </ul>
      <br />
      <p>
        <strong>
          Si l'administrateur du compte France VAE et le dirigeant sont
          différents, ajoutez également :
        </strong>
      </p>
      <ul>
        <li>
          Une lettre de délégation signée et datée par le dirigeant et le
          délégataire
        </li>
        <li>
          Une copie du justificatif d'identité de la personne ayant reçu
          délégation.
        </li>
      </ul>
      <p>Assurez-vous d'avoir ces documents en version numérique.</p>
      <Button type="button" className="ml-auto" onClick={onUpdateButtonClick}>
        Mettre à jour
      </Button>
    </>
  );
};
