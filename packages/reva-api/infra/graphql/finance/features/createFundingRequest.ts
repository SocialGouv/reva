import { Decimal } from "@prisma/client/runtime";
import { Either, EitherAsync, Left, Right } from "purify-ts";

import { Role } from "../../../../domain/types/account";
import { Candidacy, Degree } from "../../../../domain/types/candidacy";
import {
  Candidate,
  FundingRequest,
  FundingRequestBatch,
  FundingRequestBatchContent,
  FundingRequestInput,
  VulnerabilityIndicator,
} from "../../../../domain/types/candidate";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { logger } from "../../../logger";
import { getTotalCost, validateIndividualCosts } from "./costValidationUtils";

interface CreateFundingRequestDeps {
  createFundingRequest: (params: {
    candidacyId: string;
    fundingRequest: any;
  }) => Promise<Either<string, FundingRequest>>;
  getCandidateByCandidacyId: (id: string) => Promise<Either<string, Candidate>>;
  getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
  createFundingRequestBatch: (params: {
    fundingRequestId: string;
    content: object;
  }) => Promise<Either<string, FundingRequestBatch>>;
  hasRole: (role: Role) => boolean;
  existsCandidacyWithActiveStatuses: (params: {
    candidacyId: string;
    statuses: ["PRISE_EN_CHARGE", "PARCOURS_ENVOYE", "PARCOURS_CONFIRME"];
  }) => Promise<Either<string, boolean>>;
  getAfgsuTrainingId: () => Promise<string | null>;
}

const candidateBacNonFragile = (candidate: any) =>
  candidate.highestDegree.level > 4 &&
  candidate.vulnerabilityIndicator.label === "Vide";

export const validateFundingRequest =
  (candidate: Candidate) =>
  (
    fundingRequest: FundingRequestInput,
    afgsuTrainingId: string
  ): Either<FunctionalError, FundingRequestInput> => {
    const isCandidateBacNonFragile = candidateBacNonFragile(candidate);

    if (isCandidateBacNonFragile) {
      fundingRequest.mandatoryTrainingsHourCount = 0;
      fundingRequest.mandatoryTrainingsCost = new Decimal(0);
      fundingRequest.basicSkillsHourCount = 0;
      fundingRequest.basicSkillsCost = new Decimal(0);
      fundingRequest.certificateSkillsCost = new Decimal(0);
      fundingRequest.certificateSkillsHourCount = 0;
    }

    if (!fundingRequest.mandatoryTrainingsIds.length) {
      fundingRequest.mandatoryTrainingsHourCount = 0;
      fundingRequest.mandatoryTrainingsCost = new Decimal(0);
    }

    if (!fundingRequest.basicSkillsIds.length) {
      fundingRequest.basicSkillsCost = new Decimal(0);
      fundingRequest.basicSkillsHourCount = 0;
    }

    if (!fundingRequest.certificateSkills?.trim().length) {
      fundingRequest.certificateSkillsCost = new Decimal(0);
      fundingRequest.certificateSkillsHourCount = 0;
    }

    const mandatoryTrainingContainAfgsu =
      fundingRequest.mandatoryTrainingsIds.includes(afgsuTrainingId);

    const errors = validateIndividualCosts({
      hoursAndCosts: fundingRequest,
      isCandidateBacNonFragile,
      mandatoryTrainingContainAfgsu,
      numberOfMandatoryTrainings: fundingRequest.mandatoryTrainingsIds.length,
    });

    if (errors.length) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.FUNDING_REQUEST_NOT_POSSIBLE,
          `Une erreur est survenue lors de la validation du formulaire`,
          errors
        )
      );
    } else {
      fundingRequest.totalCost = getTotalCost(fundingRequest);
      return Right(fundingRequest);
    }
  };

export const checkDropoutConditions = (
  candidacy: Candidacy,
  fundingRequest: FundingRequest
): EitherAsync<FunctionalError, boolean> =>
  EitherAsync.fromPromise(async () => {
    if (candidacy.candidacyDropOut) {
      switch (candidacy.candidacyDropOut.status) {
        case "PRISE_EN_CHARGE":
        case "PARCOURS_ENVOYE":
        case "PARCOURS_CONFIRME": {
          // in case of dropout, the funding request can only be made for those specific satus and can only include diagnosis and post exam costs
          if (
            fundingRequest.individualCost
              .times(fundingRequest.individualHourCount)
              .greaterThan(0) ||
            fundingRequest.collectiveCost
              .times(fundingRequest.collectiveHourCount)
              .greaterThan(0) ||
            fundingRequest.mandatoryTrainingsCost
              .times(fundingRequest.mandatoryTrainingsCost)
              .greaterThan(0) ||
            fundingRequest.basicSkillsCost
              .times(fundingRequest.basicSkillsHourCount)
              .greaterThan(0) ||
            fundingRequest.certificateSkillsCost
              .times(fundingRequest.certificateSkillsHourCount)
              .greaterThan(0) ||
            fundingRequest.examCost
              .times(fundingRequest.examHourCount)
              .greaterThan(0)
          ) {
            return Left(
              new FunctionalError(
                FunctionalCodeError.FUNDING_REQUEST_NOT_POSSIBLE,
                `Une partie de cette demande de financement n'est pas possible pour cause d'abandon`
              )
            );
          }
          break;
        }
        default:
          return Left(
            new FunctionalError(
              FunctionalCodeError.FUNDING_REQUEST_NOT_POSSIBLE,
              `Cette demande de financement n'est pas possible pour cause d'abandon`
            )
          );
      }
    }
    return Right(true);
  });

export const createFundingRequest =
  (deps: CreateFundingRequestDeps) =>
  async (params: {
    candidacyId: string;
    fundingRequest: any;
  }): Promise<Either<FunctionalError, FundingRequest>> => {
    if (!deps.hasRole("admin") && !deps.hasRole("manage_candidacy")) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.NOT_AUTHORIZED,
          `Vous n'avez pas accès à la demande de financement de cette candidature`
        )
      );
    }

    const existsCandidacyInRequiredStatuses = EitherAsync.fromPromise(() =>
      deps.existsCandidacyWithActiveStatuses({
        candidacyId: params.candidacyId,
        statuses: ["PRISE_EN_CHARGE", "PARCOURS_ENVOYE", "PARCOURS_CONFIRME"],
      })
    )
      .chain((existsCandidacy) => {
        if (!existsCandidacy) {
          return EitherAsync.liftEither(
            Left(
              `Le statut de la candidature ne permet pas d'effectuer une demande de financement`
            )
          );
        }
        return EitherAsync.liftEither(Right(existsCandidacy));
      })
      .mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.NOT_AUTHORIZED, error)
      );

    const getCandidateByCandidacyId = EitherAsync.fromPromise(() =>
      deps.getCandidateByCandidacyId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );

    const getCandidacyByCandidacyId = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );

    const afgsuTrainingId = await deps.getAfgsuTrainingId();

    // check rules
    const checkRules = async (candidate: any) =>
      validateFundingRequest(candidate)(
        params.fundingRequest,
        afgsuTrainingId || ""
      );

    const createFundingRequest = (inputFundingRequest: any) =>
      EitherAsync.fromPromise(() =>
        deps.createFundingRequest({
          ...params,
          fundingRequest: inputFundingRequest,
        })
      )
        .map((savedFundingRequest: FundingRequest) => {
          return {
            ...savedFundingRequest,
            basicSkills: savedFundingRequest?.basicSkills.map(
              (b: any) => b.basicSkill
            ),
            mandatoryTrainings: savedFundingRequest?.mandatoryTrainings.map(
              (t: any) => t.training
            ),
            totalCost: inputFundingRequest?.totalCost,
          };
        })
        .mapLeft(
          () =>
            new FunctionalError(
              FunctionalCodeError.FUNDING_REQUEST_NOT_POSSIBLE,
              `Erreur lors de la creation de la demande de financement`
            )
        );

    const createFundingRequestBatch = async (fundingRequest: FundingRequest) =>
      EitherAsync.fromPromise(() =>
        deps.getCandidateByCandidacyId(fundingRequest.candidacyId)
      )
        .map((candidate) =>
          EitherAsync.fromPromise(() =>
            deps.getCandidacyFromId(fundingRequest.candidacyId)
          ).map((candidacy) => ({ fundingRequest, candidate, candidacy }))
        )
        .join()
        .map(mapFundingRequestBatch)
        .chain((batchContent) =>
          deps.createFundingRequestBatch({
            fundingRequestId: fundingRequest.id,
            content: batchContent,
          })
        )
        .map(() => fundingRequest)
        .mapLeft((e) => {
          logger.error(e);
          return new FunctionalError(
            FunctionalCodeError.FUNDING_REQUEST_NOT_POSSIBLE,
            `Erreur lors de la creation du bach de la demande de financement`
          );
        });

    return existsCandidacyInRequiredStatuses
      .chain(() => getCandidacyByCandidacyId)
      .chain((candidacy: Candidacy) =>
        checkDropoutConditions(candidacy, params.fundingRequest)
      )
      .chain(() => getCandidateByCandidacyId)
      .chain(checkRules)
      .chain(createFundingRequest)
      .chain(createFundingRequestBatch);
  };

export const mapFundingRequestBatch = ({
  fundingRequest,
  candidate,
  candidacy,
}: {
  fundingRequest: FundingRequest;
  candidate: Candidate;
  candidacy: Candidacy;
}) => {
  {
    const getIndPublicFragile = (v?: VulnerabilityIndicator | null) => {
      const vulnerabilityLabel = v?.label || "Vide";
      switch (vulnerabilityLabel) {
        case "Demandeur d'emploi >12m":
          return "1";
        case "RQTH":
          return "2";
        case "Bénéficiaire de minima sociaux":
          return "3";
        case "Vide":
          return "0";
        default:
          throw new Error("Unknown vulnerability label");
      }
    };

    const getNiveauObtenuCandidat = (degree?: Degree | null) => {
      const code = degree?.code || "N1_SANS";

      switch (code) {
        case "N1_SANS":
          return "1";
        case "N2_CLEA":
          return "2";
        case "N3_CAP_BEP":
          return "3";
        case "N4_BAC":
          return "4";
        case "N5_BAC_2":
          return "5";
        case "N6_BAC_3_4":
          return "6";
        case "N7_BAC_5":
          return "7";
        case "N8_BAC_8":
          return "8";
        default:
          throw new Error("Unknown degree code");
      }
    };

    const getActeFormatifComplémentaire_SavoirsDeBase = (
      basicSkill: { label: string }[]
    ) =>
      basicSkill.map((b) => {
        switch (b.label) {
          case "Communication en français":
            return "0";
          case "Utilisation des règles de base de calcul et du raisonnement mathématique":
            return "1";
          case "Usage et communication numérique":
            return "2";
          default:
            throw new Error(`Unknown basic skill label: ${b.label}`);
        }
      });

    const getActeFormatifComplémentaire_FormationObligatoire = (
      mandatoryTrainings: { label: string }[]
    ) =>
      mandatoryTrainings.map((m) => {
        switch (m.label) {
          case "Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU)":
            return "0";
          case "Equipier de Première Intervention":
            return "1";
          case "Sauveteur Secouriste du Travail (SST)":
            return "2";
          case "Systèmes d'attaches":
            return "3";
          default:
            throw new Error(`Unknown mandatory training label: ${m.label}`);
        }
      });

    const batchContent: FundingRequestBatchContent = {
      NumAction: fundingRequest.numAction,
      SiretAP: candidacy?.organism?.siret || "",
      CertificationVisée: candidacy.certification.rncpId,
      NomCandidat: candidate.lastname,
      PrenomCandidat1: candidate.firstname,
      PrenomCandidat2: candidate.firstname2 || "",
      PrenomCandidat3: candidate.firstname3 || "",
      NiveauObtenuCandidat: getNiveauObtenuCandidat(candidate.highestDegree),
      IndPublicFragile: getIndPublicFragile(candidate.vulnerabilityIndicator),
      NbHeureDemAPDiag: fundingRequest.diagnosisHourCount,
      CoutHeureDemAPDiag: fundingRequest.diagnosisCost.toNumber(),
      NbHeureDemAPPostJury: fundingRequest.postExamHourCount,
      CoutHeureDemAPPostJury: fundingRequest.postExamCost.toNumber(),
      NbHeureDemAccVAEInd: fundingRequest.individualHourCount,
      CoutHeureDemAccVAEInd: fundingRequest.individualCost.toNumber(),
      NbHeureDemAccVAEColl: fundingRequest.collectiveHourCount,
      CoutHeureDemAccVAEColl: fundingRequest.collectiveCost.toNumber(),
      ActeFormatifComplémentaire_FormationObligatoire:
        getActeFormatifComplémentaire_FormationObligatoire(
          fundingRequest.mandatoryTrainings
        ).join(","),
      NbHeureDemComplFormObligatoire:
        fundingRequest.mandatoryTrainingsHourCount,
      CoutHeureDemComplFormObligatoire:
        fundingRequest.mandatoryTrainingsCost.toNumber(),
      ActeFormatifComplémentaire_SavoirsDeBase:
        getActeFormatifComplémentaire_SavoirsDeBase(
          fundingRequest.basicSkills
        ).join(","),
      NbHeureDemComplFormSavoirsDeBase: fundingRequest.basicSkillsHourCount,
      CoutHeureDemComplFormSavoirsDeBase:
        fundingRequest.basicSkillsCost.toNumber(),
      ActeFormatifComplémentaire_BlocDeCompetencesCertifiant:
        fundingRequest.certificateSkills,
      NbHeureDemComplFormBlocDeCompetencesCertifiant:
        fundingRequest.certificateSkillsHourCount,
      CoutHeureDemComplFormBlocDeCompetencesCertifiant:
        fundingRequest.certificateSkillsCost.toNumber(),
      ActeFormatifComplémentaire_Autre: fundingRequest.otherTraining,
      NBHeureActeFormatifComplémentaire_Autre:
        fundingRequest.otherTrainingHourCount,
      CoutHeureActeFormatifComplémentaire_Autre:
        fundingRequest.otherTrainingCost.toNumber(),
      NbHeureDemTotalActesFormatifs:
        fundingRequest.mandatoryTrainingsHourCount +
        fundingRequest.basicSkillsHourCount +
        fundingRequest.certificateSkillsHourCount,
      NbHeureDemJury: fundingRequest.examHourCount,
      CoutHeureJury: fundingRequest.examCost.toNumber(),
    };
    return batchContent;
  }
};
