import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { capitalize, toLower, toUpper, truncate } from "lodash";

type LogUserProfile = "ADMIN" | "AAP" | "CERTIFICATEUR" | "CANDIDAT";
type LogUser = { firstname: string; lastname: string; email: string };

const getUserProfileText = ({
  userProfile,
  user,
}: {
  userProfile: LogUserProfile;
  user: LogUser;
}) => {
  switch (userProfile) {
    case "ADMIN":
      if (!user.firstname && !user.lastname) {
        return `Administrateur (${user.email})`;
      }
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

type Log = {
  id: string;
  createdAt: number;
  userProfile: LogUserProfile;
  user: LogUser;
  message: string;
  details?: string | null;
};

export const groupLogsByDay = (logs: Log[]) =>
  logs.reduce((acc: Record<string, Log[]>, log) => {
    const dayKey = format(log.createdAt, "do MMMM yyyy", { locale: fr });

    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(log);

    return acc;
  }, {});

export const DayLog = ({ day, logs }: { day: string; logs: Log[] }) => {
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
