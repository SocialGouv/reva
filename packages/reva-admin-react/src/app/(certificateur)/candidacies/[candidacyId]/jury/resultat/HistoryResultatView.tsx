import Accordion from "@codegouvfr/react-dsfr/Accordion";

import { JuryResult } from "@/graphql/generated/graphql";

import { ResultatCardWithBlocks } from "./ResultatCardWithBlocks";

type JuryType = {
  id: string;
  dateOfSession: number;
  result: JuryResult;
  informationOfResult?: string | null;
  juryResultByCompetenceBlocs?:
    | {
        competenceBloc: {
          id: string;
          code?: string | null;
          label: string;
        };
        isCompetenceBlocValidated: boolean;
      }[]
    | null;
};

interface Props {
  historyJury: JuryType[];
}

export const HistoryResultatView = (props: Props) => {
  const { historyJury } = props;

  if (historyJury.length == 0) return null;

  return (
    <Accordion label="Voir les résultats précédents">
      <div className="flex flex-col gap-8">
        {historyJury.map((jury) => (
          <div key={jury.id} className="">
            <ResultatCardWithBlocks
              jury={{
                id: jury.id,
                dateOfSession: jury.dateOfSession,
                result: jury.result,
                informationOfResult: jury.informationOfResult,
                juryResultByCompetenceBlocs: jury.juryResultByCompetenceBlocs,
              }}
            />
          </div>
        ))}
      </div>
    </Accordion>
  );
};
