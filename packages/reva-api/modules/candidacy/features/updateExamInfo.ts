import { Either, EitherAsync, Left, Maybe } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { ExamInfo } from "../candidacy.types";

interface UpdateExamInfoDeps {
  getExamInfoFromCandidacyId: (params: {
    candidacyId: string;
  }) => Promise<Either<string, Maybe<ExamInfo>>>;
  updateExamInfo: (params: {
    examInfoId: string;
    examInfo: ExamInfo;
  }) => Promise<Either<string, ExamInfo>>;
}

export const updateExamInfo =
  (deps: UpdateExamInfoDeps) =>
  async (params: {
    candidacyId: string;
    examInfo: Partial<ExamInfo>;
  }): Promise<Either<FunctionalError, ExamInfo>> => {
    const updateExamInfoOrRaiseError = (
      existingExamInfo: Maybe<ExamInfo>
    ): Promise<Either<string, ExamInfo>> =>
      existingExamInfo.caseOf({
        Just: (e) =>
          deps.updateExamInfo({
            examInfoId: e.id,
            examInfo: {
              ...e,
              actualExamDate: null,
              estimatedExamDate: null,
              examResult: null,
              ...params.examInfo,
            },
          }),

        Nothing: () =>
          Promise.resolve(
            Left("Erreur admissibilité non trouvé pour la candidature")
          ),
      });

    return EitherAsync.fromPromise(() =>
      deps.getExamInfoFromCandidacyId({ candidacyId: params.candidacyId })
    )
      .chain(updateExamInfoOrRaiseError)
      .mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            `Erreur pendant la création ou la mise à jour de la recevabilité de la candidature`
          )
      );
  };
