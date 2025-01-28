import { format } from "date-fns";
import {
  CandidacyLogUser,
  CandidacyLogUserProfile,
} from "@/graphql/generated/graphql";
import { capitalize, toLower, toUpper, truncate } from "lodash";
import Accordion from "@codegouvfr/react-dsfr/Accordion";

const getUserProfileText = ({
  userProfile,
  user,
}: {
  userProfile: CandidacyLogUserProfile;
  user: CandidacyLogUser;
}) => {
  switch (userProfile) {
    case "ADMIN":
      if (!user.firstname && !user.lastname) {
        return "Administrateur";
      }
      return `un administrateur (${toUpper(
        truncate(user.firstname, { length: 2, omission: "." }),
      )} ${capitalize(toLower(user.lastname))})`;
    case "AAP":
      return "AAP";
    case "CERTIFICATEUR":
      return "Certificateur";
    case "CANDIDAT":
      return "Candidat";
  }
};

export type CandidacyLog = {
  id: string;
  createdAt: number;
  userProfile: CandidacyLogUserProfile;
  user: CandidacyLogUser;
  message: string;
  details?: string | null;
};

export const DayLog = ({
  day,
  logs,
}: {
  day: string;
  logs: CandidacyLog[];
}) => {
  return (
    <Accordion label={day} defaultExpanded>
      <ul className="list-none flex flex-col gap-y-4 my-0 p-0 pt-3">
        {logs.map((log) => (
          <li key={log.id}>
            <div className="flex gap-x-12">
              <div className="flex-auto text-balance">
                <span className="font-semibold">
                  {getUserProfileText({
                    userProfile: log.userProfile,
                    user: log.user,
                  })}
                </span>
                {" : "}
                {log.message}
                <span className="italic text-sm text-neutral-500">
                  {log.details ? ` (${log.details}).` : "."}
                </span>
              </div>
              <div className="flex-none mt-1 text-xs text-neutral-500">
                {format(log.createdAt, "HH:mm")}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Accordion>
  );
};
