import {
  CertificationCompetenceBloc,
  Jury,
  JuryResult,
  JuryResultByCompetenceBloc,
} from "@/graphql/generated/graphql";

export type JuryEntity = Partial<
  Omit<Jury, "juryResultByCompetenceBlocs" | "previouslyValidatedBlocks">
> & {
  juryResultByCompetenceBlocs?:
    | Partial<
        Omit<JuryResultByCompetenceBloc, "competenceBloc"> & {
          competenceBloc: Partial<CertificationCompetenceBloc>;
        }
      >[]
    | null;
  previouslyValidatedBlocks?: Partial<
    Omit<CertificationCompetenceBloc, "certification" | "competences">
  >[];
};

type CreateJuryEntityOptions = {
  id?: string;
  result?: JuryResult;
  dateOfSession?: number;
  dateOfResult?: number | null;
  informationOfResult?: string | null;
  isResultTemporary?: boolean | null;
  timeOfSession?: string | null;
  timeSpecified?: boolean | null;
  previouslyValidatedBlocks?: JuryEntity["previouslyValidatedBlocks"];
  juryResultByCompetenceBlocs?: JuryEntity["juryResultByCompetenceBlocs"];
};

export const createJuryEntity = (
  options?: CreateJuryEntityOptions,
): JuryEntity => {
  const {
    id = "jury-current",
    result = "FAILURE",
    dateOfSession = Date.now(),
    dateOfResult = null,
    informationOfResult = null,
    isResultTemporary = null,
    timeOfSession = null,
    timeSpecified = null,
    previouslyValidatedBlocks,
    juryResultByCompetenceBlocs,
  } = options || {};

  return {
    id,
    result,
    dateOfSession,
    dateOfResult,
    informationOfResult,
    isResultTemporary,
    timeOfSession,
    timeSpecified,
    previouslyValidatedBlocks,
    juryResultByCompetenceBlocs,
  };
};
