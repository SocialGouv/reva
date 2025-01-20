import { format } from "date-fns";
import {
  CandidacyLogUser,
  CandidacyLogUserProfile,
} from "@/graphql/generated/graphql";
import { capitalize, toLower, toUpper, truncate } from "lodash";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

const getUserProfileText = ({
  userProfile,
  user,
}: {
  userProfile: CandidacyLogUserProfile;
  user: CandidacyLogUser;
}) => {
  switch (userProfile) {
    case "ADMIN":
      return `Administrateur (${toUpper(
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
};

export const DayLog = ({
  day,
  logs,
}: {
  day: string;
  logs: CandidacyLog[];
}) => {
  return (
    <div className="mb-6">
      <Tag className="rounded-bl-none">{day}</Tag>
      <ul className="-mt-1 mb-0 py-4 border-l-2 border-[#eee]">
        {logs.map((log) => (
          <li key={log.id} className="flex flex-col">
            <span className="text-sm font-bold">
              {format(log.createdAt, "HH:mm")}
            </span>
            <span>
              <strong>
                {getUserProfileText({
                  userProfile: log.userProfile,
                  user: log.user,
                })}{" "}
                :{" "}
              </strong>
              {log.message}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
