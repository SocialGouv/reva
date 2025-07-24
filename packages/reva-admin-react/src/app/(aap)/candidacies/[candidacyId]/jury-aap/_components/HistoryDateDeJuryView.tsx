import Accordion from "@codegouvfr/react-dsfr/Accordion";

import { DateDeJuryCard } from "./DateDeJuryCard";

type JuryType = {
  id: string;
  dateOfSession: number;
  timeSpecified?: boolean | null;
  addressOfSession?: string | null;
  informationOfSession?: string | null;
};

interface Props {
  historyJury: JuryType[];
}

export const HistoryDateDeJuryView = (props: Props) => {
  const { historyJury } = props;

  if (historyJury.length == 0) return null;

  return (
    <Accordion label="Voir les précédents jurys">
      <div className="flex flex-col gap-6">
        {historyJury.map((jury) => (
          <div
            key={jury.id}
            className="border-b border-neutral-300 last:border-none"
          >
            <DateDeJuryCard jury={jury} />
          </div>
        ))}
      </div>
    </Accordion>
  );
};
