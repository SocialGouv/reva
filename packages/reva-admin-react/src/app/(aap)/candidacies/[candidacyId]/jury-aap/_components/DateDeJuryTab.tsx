import Alert from "@codegouvfr/react-dsfr/Alert";

import { DateDeJuryCard } from "./DateDeJuryCard";
import { HistoryDateDeJuryView } from "./HistoryDateDeJuryView";
import { useJuryAAP } from "./jury-aap.hook";

export const DateDeJuryTab = () => {
  const { candidacy } = useJuryAAP();

  if (!candidacy) {
    return null;
  }

  const { jury, historyJury } = candidacy;

  if (!jury || !jury.dateOfSession) {
    return (
      <div className="flex flex-col gap-8">
        <HistoryDateDeJuryView
          historyJury={historyJury.map((jury) => ({
            id: jury.id,
            dateOfSession: jury.dateOfSession,
            timeSpecified: jury.timeSpecified,
            addressOfSession: jury.addressOfSession,
            informationOfSession: jury.informationOfSession,
          }))}
        />

        <Alert
          description={
            <div className="ml-2 mt-3 mb-4">
              <h6>En attente de la date de jury</h6>
              <dd>
                Dès qu’il l’aura définie, le certificateur vous communiquera la
                date de passage devant le jury de votre candidat.
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
    <>
      <h3>Date de passage devant le jury </h3>
      <div className="flex flex-col gap-8">
        <HistoryDateDeJuryView
          historyJury={historyJury.map((jury) => ({
            id: jury.id,
            dateOfSession: jury.dateOfSession,
            timeSpecified: jury.timeSpecified,
            addressOfSession: jury.addressOfSession,
            informationOfSession: jury.informationOfSession,
          }))}
        />

        {!jury.result && (
          <div>
            <p className="m-0">Une date de jury a été attribuée au candidat.</p>
            <p className="m-0">
              Le candidat doit respecter les précisions apportées dans sa
              convocation.
            </p>
          </div>
        )}

        <DateDeJuryCard
          jury={{
            id: jury.id,
            dateOfSession: jury.dateOfSession,
            timeSpecified: jury.timeSpecified,
            addressOfSession: jury.addressOfSession,
            informationOfSession: jury.informationOfSession,
          }}
        />
      </div>
    </>
  );
};
