import { format } from "date-fns";
import {
  CandidacyLogUser,
  CandidacyLogUserProfile,
} from "@/graphql/generated/graphql";
import { capitalize, toLower, toUpper, truncate } from "lodash";

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
      <h2 className="text-base font-medium mb-4">{day}</h2>
      <ul className="border-l-2 border-gray-100">
        {logs.map((log) => (
          <li key={log.id} className="flex flex-col my-2">
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
