import { FancyPreview } from "@/components/fancy-preview/FancyPreview";
import { FeasibilityDecisionHistory } from "@/components/feasibility-decision-history";
import {
  FeasibilityDecision,
  FeasibilityHistory,
} from "@/graphql/generated/graphql";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Notice from "@codegouvfr/react-dsfr/Notice";

interface Props {
  decision: FeasibilityDecision;
  decisionComment?: string | null;
  decisionSentAt?: number | null;
  feasibilityFileSentAt?: number | null;
  feasibilityHistory?: FeasibilityHistory[];
  decisionFile?: {
    __typename?: "File";
    name: string;
    url: string;
    previewUrl?: string | null;
  } | null;
}

export default function FeasibilityDecisionDisplay({
  decision,
  decisionComment,
  decisionSentAt,
  feasibilityFileSentAt,
  decisionFile,
  feasibilityHistory = [],
}: Props) {
  return (
    <>
      {decision == "REJECTED" && (
        <>
          <Alert
            className="mb-8"
            severity="error"
            title={`Dossier déclaré non recevable le ${new Date(decisionSentAt!).toLocaleDateString("fr-FR")}`}
            description={
              <>
                <p>
                  Voici le motif transmis par votre certificateur : {'"'}
                  {decisionComment}
                  {'"'}
                </p>
                <p>
                  Si vous souhaitez en savoir plus, contactez votre
                  certificateur avant de renvoyer votre dossier mis à jour.
                </p>
              </>
            }
          />

          {feasibilityHistory.length > 0 && (
            <FeasibilityDecisionHistory history={feasibilityHistory} />
          )}
        </>
      )}
      {decision == "INCOMPLETE" && (
        <>
          <Alert
            className="mb-8"
            severity="warning"
            title={`Dossier déclaré incomplet le ${new Date(decisionSentAt!).toLocaleDateString("fr-FR")}`}
            description={
              <>
                <p>
                  Voici le motif transmis par votre certificateur : {'"'}
                  {decisionComment}
                  {'"'}
                </p>
                <p>
                  Si vous souhaitez en savoir plus, contactez votre
                  certificateur avant de renvoyer votre dossier mis à jour.
                </p>
              </>
            }
          />
          {feasibilityHistory.length > 0 && (
            <FeasibilityDecisionHistory history={feasibilityHistory} />
          )}
        </>
      )}
      {decision == "PENDING" && (
        <Alert
          className="mb-8"
          severity="info"
          title={`Dossier envoyé le ${new Date(feasibilityFileSentAt!).toLocaleDateString("fr-FR")}`}
          description={
            <>
              <p>
                Votre dossier a bien été envoyé au certificateur concerné. En
                attendant la réponse de votre certificateur sur votre
                recevabilité (dans un délai de 2 mois), vos pièces
                justificatives restent consultables.
              </p>
            </>
          }
        />
      )}
      {decision == "ADMISSIBLE" && (
        <>
          <Alert
            className="mb-8"
            severity="success"
            title={`Dossier déclaré recevable le ${new Date(decisionSentAt!).toLocaleDateString("fr-FR")}`}
            description={
              <>
                <p>
                  Félicitations, votre dossier a été accepté par votre
                  certificateur. Vous pouvez commencer la prochaine étape : le
                  dossier de validation !
                </p>
              </>
            }
          />
          {decisionFile && (
            <div className="mb-8 p-6">
              <h2>
                <span className="fr-icon-attachment-fill fr-icon--lg mr-2" />
                Pièces jointes
              </h2>

              <div className="mb-6">
                {/* Use array in anticipation for future US that will let certification authorities upload multiple files */}
                {[decisionFile].map((file) => (
                  <FancyPreview
                    defaultDisplay={false}
                    name={file.name}
                    title={file?.name}
                    src={file.previewUrl!}
                    key={file?.name}
                  />
                ))}
              </div>
              <Notice
                className="bg-transparent -ml-6"
                title="Le certificateur peut ajouter des pièces jointes (courrier de recevabilité, trame du dossier de validation…) pour vous aider à continuer votre parcours. N'hésitez pas à les consulter !"
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
