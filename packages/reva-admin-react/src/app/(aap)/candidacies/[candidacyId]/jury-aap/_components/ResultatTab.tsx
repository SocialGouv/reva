import { useRouter } from "next/navigation";

import Alert from "@codegouvfr/react-dsfr/Alert";
import { CallOut } from "@codegouvfr/react-dsfr/CallOut";

import { useJuryAAP } from "./jury-aap.hook";
import { ResultatCard } from "./ResultatCard";
import { HistoryResultatView } from "./HistoryResultatView";

export const ResultatTab = () => {
  const router = useRouter();

  const { candidacy } = useJuryAAP();

  if (!candidacy) {
    return null;
  }

  const { jury, historyJury } = candidacy;

  if (!jury || !jury.result) {
    return (
      <div className="flex flex-col gap-10">
        <HistoryResultatView
          historyJury={historyJury.map((jury) => ({
            id: jury.id,
            dateOfSession: jury.dateOfSession,
            // Only jury with result are in jury history
            result: jury.result!,
            informationOfResult: jury.informationOfResult,
          }))}
        />

        <Alert
          description={
            <div className="pl-2  mt-3 mb-4">
              <h6>En attente du résultat</h6>
              <dd>
                Le certificateur vous communiquera le résultat de votre
                candidat.
              </dd>
            </div>
          }
          severity="info"
          small
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <h2 className="m-0">Résultat à l'issue de l'entretien avec le jury</h2>

      <HistoryResultatView
        historyJury={historyJury.map((jury) => ({
          id: jury.id,
          dateOfSession: jury.dateOfSession,
          // Only jury with result are in jury history
          result: jury.result!,
          informationOfResult: jury.informationOfResult,
        }))}
      />

      <ResultatCard
        jury={{
          id: jury.id,
          dateOfSession: jury.dateOfSession,
          result: jury.result,
          informationOfResult: jury.informationOfResult,
        }}
      />

      {jury.result != "FULL_SUCCESS_OF_FULL_CERTIFICATION" &&
        jury.result != "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION" && (
          <CallOut
            buttonProps={{
              children: "Accéder au dossier de validation",
              onClick: () => {
                router.push(
                  `/candidacies/${candidacy.id}/dossier-de-validation-aap/`,
                );
              },
            }}
            title="Le candidat peut renvoyer un dossier de validation"
          >
            Suite à ce résultat, le candidat peut repasser devant le jury. Il
            devra, en amont, retravailler sur son dossier de validation. Vous
            devrez le renvoyer au certificateur qui pourra lui transmettre une
            nouvelle date de passage devant le jury.
          </CallOut>
        )}
    </div>
  );
};
