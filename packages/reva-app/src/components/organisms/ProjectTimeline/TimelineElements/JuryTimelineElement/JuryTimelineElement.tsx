import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { AuthenticatedLink } from "components/atoms/AuthenticatedLink/AuthenticatedLink";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import { format, isBefore } from "date-fns";
import { JuryResult } from "interface";

export const JuryTimelineElement = () => {
  const { state } = useMainMachineContext();

  const { jury, dossierDeValidation } = state.context;

  let text = `Votre jury sera programmé prochainement. Vous recevrez une convocation officielle du certificateur par courrier ou par e-mail.`;

  if (jury?.dateOfSession) {
    text = `Votre passage devant le jury est programmé le ${format(
      jury.dateOfSession,
      "dd MMMM yyyy",
    )}${
      jury?.timeSpecified ? ` à ${format(jury.dateOfSession, "HH:mm")}` : ""
    }. Veuillez vous présenter au lieu et à la date indiqués sur la convocation officielle que vous avez reçue.`;
  }

  const icon = !jury ? "fr-icon-time-fill" : "fr-icon-information-fill";

  const juryOutOfDate = jury ? isBefore(jury.dateOfSession, new Date()) : false;

  if (jury && juryOutOfDate) {
    text =
      "Vous recevrez la décision du jury par e-mail sous 15 jours environ. Certains certificateurs envoient en plus un courrier accompagné d'un parchemin. Votre accompagnateur sera lui aussi informé de la décision du certificateur.";
  }

  if (jury?.result) {
    text = "";
  }

  const color =
    jury && !jury.result && !juryOutOfDate
      ? "text-dsfrBlue-400"
      : "text-dsfrGray-500";

  return (
    <TimelineElement
      title="Jury"
      classNameChildren="pb-0"
      status={
        jury?.result ? "readonly" : dossierDeValidation ? "active" : "disabled"
      }
    >
      {() =>
        dossierDeValidation && (
          <>
            <div className={`flex ${color}`}>
              <span className={`fr-icon ${icon} mr-2 self-center`} />
              {text && <p className="text-sm italic mb-0">{text}</p>}
              {jury?.result && (
                <>
                  {juryResultNotice[jury.result] === "error" ? (
                    <CustomErrorBadge label={juryResultLabels[jury.result]} />
                  ) : (
                    <Badge severity={juryResultNotice[jury.result]}>
                      {juryResultLabels[jury.result]}
                    </Badge>
                  )}
                </>
              )}
            </div>
            {!jury?.result && jury?.convocationFile && !juryOutOfDate && (
              <div className="mt-4">
                <FileLink
                  text={jury.convocationFile.name}
                  url={jury.convocationFile.url}
                />
              </div>
            )}
          </>
        )
      }
    </TimelineElement>
  );
};

const FileLink = ({ url, text }: { url: string; text: string }) => (
  <AuthenticatedLink text={text} title={text} url={url} className="mb-0" />
);

const juryResultLabels: { [key in JuryResult]: string } = {
  FULL_SUCCESS_OF_FULL_CERTIFICATION:
    "Réussite totale à une certification visée en totalité",
  PARTIAL_SUCCESS_OF_FULL_CERTIFICATION:
    "Réussite partielle à une certification visée en totalité",
  FULL_SUCCESS_OF_PARTIAL_CERTIFICATION:
    "Réussite totale aux blocs de compétences visés",
  PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION:
    "Réussite partielle aux blocs de compétences visés",
  FAILURE: "Non validation",
  CANDIDATE_EXCUSED: "Candidat excusé sur justificatif",
  CANDIDATE_ABSENT: "Candidat non présent",
};

const juryResultNotice: {
  [key in JuryResult]: "info" | "new" | "success" | "error";
} = {
  FULL_SUCCESS_OF_FULL_CERTIFICATION: "success",
  PARTIAL_SUCCESS_OF_FULL_CERTIFICATION: "info",
  FULL_SUCCESS_OF_PARTIAL_CERTIFICATION: "success",
  PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION: "info",
  FAILURE: "error",
  CANDIDATE_EXCUSED: "new",
  CANDIDATE_ABSENT: "new",
};

const CustomErrorBadge = ({ label }: { label: string }): JSX.Element => (
  <div>
    <div
      className={`text-[#6E445A] bg-[#FEE7FC] inline-flex items-center gap-1 rounded px-1 h-6`}
    >
      <label className={`text-sm font-bold`}>{label.toUpperCase()}</label>
    </div>
  </div>
);
