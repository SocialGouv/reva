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
      if (!user.firstname && !user.lastname) {
        return "un administrateur";
      }
      return `un administrateur (${toUpper(
        truncate(user.firstname, { length: 2, omission: "." }),
      )} ${capitalize(toLower(user.lastname))})`;
    case "AAP":
      return "un AAP";
    case "CERTIFICATEUR":
      return "un certificateur";
    case "CANDIDAT":
      return "le candidat";
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
    <div className="mb-6 max-w-2xl">
      <h2 className="text-xl border-b pb-3 mb-3">{day}</h2>
      <ul className="list-none mb-10 p-0">
        {logs.map((log) => (
          <li key={log.id} className="mb-4">
            <div className="flex gap-x-20">
              <div className="flex-auto text-balance">
                {log.message} par{" "}
                <span className="font-semibold">
                  {getUserProfileText({
                    userProfile: log.userProfile,
                    user: log.user,
                  })}
                </span>
                .
              </div>
              <div className="flex-none mt-1 text-xs text-neutral-500">
                {format(log.createdAt, "HH:mm")}
              </div>
            </div>
            {log.details && (
              <p className="mb-0 mt-2 px-3 py-2 rounded bg-neutral-100 text-sm  text-neutral-800 font-medium max-w-lg">
                {log.details}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
