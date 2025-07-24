import Accordion from "@codegouvfr/react-dsfr/Accordion";

import { JuryResult } from "@/graphql/generated/graphql";

import { ResultatCard } from "./ResultatCard";

type JuryType = {
  id: string;
  dateOfSession: number;
  result: JuryResult;
  informationOfResult?: string | null;
};

interface Props {
  historyJury: JuryType[];
}

export const HistoryResultatView = (props: Props) => {
  const { historyJury } = props;

  if (historyJury.length == 0) return null;

  return (
    <Accordion label="Voir les résultats précédents">
      <div className="flex flex-col gap-6">
        {historyJury.map((jury) => (
          <div
            key={jury.id}
            className="border-b border-neutral-300 last:border-none"
          >
            <ResultatCard jury={jury} />
          </div>
        ))}
      </div>
    </Accordion>
  );
};
