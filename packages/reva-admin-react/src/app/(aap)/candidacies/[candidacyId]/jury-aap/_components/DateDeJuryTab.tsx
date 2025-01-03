import { format } from "date-fns";
import { useJuryAAP } from "./jury-aap.hook";
import Alert from "@codegouvfr/react-dsfr/Alert";

export const DateDeJuryTab = () => {
  const { candidacy } = useJuryAAP();
  const jury = candidacy?.jury;

  if (!jury || !jury.dateOfSession) {
    return (
      <Alert
        description={
          <div className="ml-2 mt-3 mb-4">
            <h6>En attente de la date de jury</h6>
            <dd>
              Le certificateur vous communiquera la date du jury de votre
              candidat.
            </dd>
          </div>
        }
        severity="info"
        small
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="m-0">Une date de jury a été attribuée au candidat.</p>
        <p className="m-0">
          Le candidat doit respecter les précisions apportées dans sa
          convocation.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-y-8 gap-x-28">
        <div>
          <dt className="font-bold">Date :</dt>
          <dd>
            {!!jury?.dateOfSession &&
              format(jury?.dateOfSession, "dd MMMM yyyy")}
          </dd>
        </div>
        <div>
          <dt className="font-bold">Heure de convocation :</dt>
          <dd>
            {!!jury?.timeSpecified
              ? format(jury?.dateOfSession, "HH:mm")
              : "Non renseigné"}
          </dd>
        </div>
        <div>
          <dt className="font-bold">Lieu :</dt>
          <dd>{jury?.addressOfSession || "Non renseigné"}</dd>
        </div>
      </div>
      <p>
        <dt className="font-bold">
          Information complémentaire liée à la session :
        </dt>
        <dd>{jury?.informationOfSession || "Non renseigné"}</dd>
      </p>
    </div>
  );
};
