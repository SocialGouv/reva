import Accordion from "@codegouvfr/react-dsfr/Accordion";

import { JuryResult } from "@/graphql/generated/graphql";

import { ResultatCard } from "./ResultatCard";
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
  previouslyValidatedBlocks?:
    | {
        id: string;
        code?: string | null;
        label: string;
      }[]
    | null;
}

export const HistoryResultatView = (props: Props) => {
  const { historyJury, previouslyValidatedBlocks } = props;

  if (historyJury.length == 0) return null;

  return (
    <Accordion
      label="Voir les résultats précédents"
      data-testid="history-resultat-view"
    >
      <div className="flex flex-col gap-8">
        {historyJury.map((jury) => {
          // Les blocs validés précédemment (dans une session précédente) sont affichés séparément des blocs validés dans la session courante.
          // On prend tous les blocs validés précédemment et on soustrait ceux qui sont présents dans la session courante.
          // Chaque session ne contient que les blocs explicitements validés ou échoués pour ladite session.
          const previouslyValidatedBlocksForThisSession =
            previouslyValidatedBlocks?.filter((previousBlock) =>
              jury.juryResultByCompetenceBlocs?.every(
                (result) => result.competenceBloc.id !== previousBlock.id,
              ),
            );
          return (
            <div key={jury.id}>
              {jury.juryResultByCompetenceBlocs ? (
                <ResultatCardWithBlocks
                  jury={{
                    id: jury.id,
                    dateOfSession: jury.dateOfSession,
                    result: jury.result,
                    informationOfResult: jury.informationOfResult,
                    juryResultByCompetenceBlocs:
                      jury.juryResultByCompetenceBlocs,
                  }}
                  previouslyValidatedBlocks={
                    previouslyValidatedBlocksForThisSession
                  }
                />
              ) : (
                <ResultatCard
                  jury={{
                    id: jury.id,
                    dateOfSession: jury.dateOfSession,
                    result: jury.result,
                    informationOfResult: jury.informationOfResult,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </Accordion>
  );
};
