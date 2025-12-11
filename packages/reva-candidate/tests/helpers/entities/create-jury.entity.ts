import { Jury, JuryResult } from "@/graphql/generated/graphql";

export type JuryEntity = Partial<Jury>;

type CreateJuryEntityOptions = {
  result?: JuryResult;
  dateOfSession?: number;
  dateOfResult?: number | null;
  informationOfResult?: string | null;
  isResultTemporary?: boolean | null;
  timeOfSession?: string | null;
  timeSpecified?: boolean | null;
};

export const createJuryEntity = (
  options?: CreateJuryEntityOptions,
): JuryEntity => {
  const {
    result = "FAILURE",
    dateOfSession = Date.now(),
    dateOfResult = null,
    informationOfResult = null,
    isResultTemporary = null,
    timeOfSession = null,
    timeSpecified = null,
  } = options || {};

  return {
    result,
    dateOfSession,
    dateOfResult,
    informationOfResult,
    isResultTemporary,
    timeOfSession,
    timeSpecified,
  };
};
