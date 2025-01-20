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
      if (!user.firstname && !user.lastname) {
        return "un administrateur";
      }
      return `un administrateur (${toUpper(
        truncate(user.firstname, { length: 2, omission: "." }),
      )} ${capitalize(toLower(user.lastname))})`;
    case "AAP":
      return "son AAP";
    case "CERTIFICATEUR":
      return "son certificateur";
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
      <Tag className="rounded-bl-none">{day}</Tag>
      <ul className="-mt-1 mb-0 pt-6 border-l-2 border-[#eee]">
        {logs.map((log) => (
          <li key={log.id} className="flex gap-x-4 mb-2">
            <div className="flex-auto text-sm">
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
          </li>
        ))}
      </ul>
    </div>
  );
};
