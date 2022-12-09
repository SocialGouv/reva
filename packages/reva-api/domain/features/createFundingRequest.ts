import { Either, EitherAsync, Left, Right } from "purify-ts";

import { Role } from "../types/account";
import {
  Candidate,
  FundingRequest,
  FundingRequestBatch,
  FundingRequestBatchContent,
  FundingRequestInput,
  Gender,
  VulnerabilityIndicator,
} from "../types/candidate";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface CreateFundingRequestDeps {
  createFundingRequest: (params: {
    candidacyId: string;
    fundingRequest: any;
  }) => Promise<Either<string, FundingRequest>>;
  getCandidateByCandidacyId: (id: string) => Promise<Either<string, Candidate>>;
  createFundingRequestBatch: (params: {
    fundingRequestId: string;
    content: object;
  }) => Promise<Either<string, FundingRequestBatch>>;
  hasRole: (role: Role) => boolean;
  existsCandidacyWithActiveStatuses: (params: {
    candidacyId: string;
    statuses: ["PARCOURS_CONFIRME", "ABANDON"];
  }) => Promise<Either<string, boolean>>;
}

const candidateBacNonFragile = (candidate: any) =>
  candidate.highestDegree.level > 4 &&
  candidate.vulnerabilityIndicator.label === "Vide";

const isBetween = (low: number, high: number) => (value: number) =>
  low <= value && value <= high;

const isLower2 = isBetween(0, 2);
const isLower4 = isBetween(0, 4);
const isLower15 = isBetween(0, 15);
const isLower20 = isBetween(0, 20);
const isLower30 = isBetween(0, 30);
const isLower35 = isBetween(0, 35);
const isLower70 = isBetween(0, 70);
const isLower78 = isBetween(0, 78);

export const validateFundingRequest =
  (candidate: Candidate) => (fundingRequest: FundingRequestInput) => {
    const errors = [];

    const isCandidateBacNonFragile = candidateBacNonFragile(candidate);

    if (isCandidateBacNonFragile) {
      fundingRequest.mandatoryTrainingsHourCount = 0;
      fundingRequest.mandatoryTrainingsCost = 0;
      fundingRequest.basicSkillsHourCount = 0;
      fundingRequest.basicSkillsCost = 0;
      fundingRequest.certificateSkillsCost = 0;
      fundingRequest.certificateSkillsHourCount = 0;
    }

    if (!fundingRequest.mandatoryTrainingsIds.length) {
      fundingRequest.mandatoryTrainingsHourCount = 0;
      fundingRequest.mandatoryTrainingsCost = 0;
    }

    if (!fundingRequest.basicSkillsIds.length) {
      fundingRequest.basicSkillsCost = 0;
      fundingRequest.basicSkillsHourCount = 0;
    }

    if (!fundingRequest.certificateSkills?.trim().length) {
      fundingRequest.certificateSkillsCost = 0;
      fundingRequest.certificateSkillsHourCount = 0;
    }

    if (
      isCandidateBacNonFragile &&
      !isLower2(fundingRequest.diagnosisHourCount)
    ) {
      errors.push(
        "Le nombre d'heures demandées pour la prestation de l'Architecte de Parcours Diagnostique doit être compris entre 0 et 2h."
      );
    } else if (!isLower4(fundingRequest.diagnosisHourCount)) {
      errors.push(
        "Le nombre d'heures demandées pour la prestation de l'Architecte de Parcours Diagnostique doit être compris entre 0 et 4h."
      );
    }

    if (!isLower70(fundingRequest.diagnosisCost)) {
      errors.push(
        "Le coût horaire demandé pour la prestation de l'Architecte de Parcours Diagnostique doit être compris entre 0 et 70 euros."
      );
    }

    if (!isLower70(fundingRequest.postExamCost)) {
      errors.push(
        "Le coût horaire demandé pour la prestation de l'Architecte de Parcours Post Jury doit être compris entre 0 et 70 euros."
      );
    }

    if (
      isCandidateBacNonFragile &&
      !isLower15(fundingRequest.individualHourCount)
    ) {
      errors.push(
        "Le nombre d'heures demandé pour la prestation Accompagnement méthodologique à la VAE (individuel) doit être compris entre 0 et 15h."
      );
    } else if (!isLower30(fundingRequest.individualHourCount)) {
      errors.push(
        "Le nombre d'heures demandé pour la prestation Accompagnement méthodologique à la VAE (individuel) doit être compris entre 0 et 30h."
      );
    }

    if (!isLower70(fundingRequest.individualCost)) {
      errors.push(
        "Le coût horaire demandé pour la prestation d'Accompagnement méthodologique à la VAE (individuel) doit être compris entre 0 et 70 euros."
      );
    }

    if (
      isCandidateBacNonFragile &&
      !isLower15(fundingRequest.collectiveHourCount)
    ) {
      errors.push(
        "Le nombre d'heures demandées pour la prestation d'Accompagnement méthodologique à la VAE (collectif) doit être compris entre 0 et 15h."
      );
    } else if (!isLower30(fundingRequest.collectiveHourCount)) {
      errors.push(
        "Le nombre d'heures demandées pour la prestation d'Accompagnement méthodologique à la VAE (collectif) doit être compris entre 0 et 30h."
      );
    }

    if (!isLower35(fundingRequest.collectiveCost)) {
      errors.push(
        "Le coût horaire demandé pour la prestation Accompagnement méthodologique à la VAE (collectif) doit être compris entre 0 et 35 euros."
      );
    }

    if (!isLower20(fundingRequest.basicSkillsCost)) {
      errors.push(
        "Le coût horaire demandé pour la prestation Compléments formatifs Savoirs de base doit être compris entre 0 et 20 euros."
      );
    }

    if (
      !isLower78(
        fundingRequest.mandatoryTrainingsHourCount +
          fundingRequest.basicSkillsHourCount +
          fundingRequest.certificateSkillsHourCount
      )
    ) {
      errors.push(
        "Le nombre d'heures total prescrit pour les actes formatifs doit être compris entre 0 et 78h."
      );
    }

    if (!isLower2(fundingRequest.examHourCount)) {
      errors.push(
        "Le nombre d'heures demandé pour la prestation Jury doit être compris entre 0 et 2h."
      );
    }
    if (!isLower20(fundingRequest.examCost)) {
      errors.push(
        "Le coût horaire demandé pour la prestation Jury doit être compris entre 0 et 20 euros."
      );
    }

    if (!isLower20(fundingRequest.mandatoryTrainingsCost)) {
      errors.push(
        "Le coût horaire demandé pour la prestation Formations obligatoires doit être compris entre 0 et 20 euros."
      );
    }

    if (!isLower20(fundingRequest.certificateSkillsCost)) {
      errors.push(
        "Le coût horaire demandé pour la prestation Compléments formatifs Blocs de compétences doit être compris entre 0 et 20 euros."
      );
    }

    if (errors.length) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.FUNDING_REQUEST_NOT_POSSIBLE,
          `Une erreur est survenue lors de la validation du formulaire`,
          errors
        )
      );
    } else {
      fundingRequest.totalCost =
        fundingRequest.basicSkillsCost * fundingRequest.basicSkillsHourCount +
        fundingRequest.certificateSkillsCost *
          fundingRequest.certificateSkillsHourCount +
        fundingRequest.collectiveCost * fundingRequest.collectiveHourCount +
        fundingRequest.diagnosisCost * fundingRequest.diagnosisHourCount +
        fundingRequest.examCost * fundingRequest.examHourCount +
        fundingRequest.individualCost * fundingRequest.individualHourCount +
        fundingRequest.mandatoryTrainingsCost *
          fundingRequest.mandatoryTrainingsHourCount +
        fundingRequest.postExamCost * fundingRequest.postExamHourCount;

      return Right(fundingRequest);
    }
  };

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
        statuses: ["PARCOURS_CONFIRME", "ABANDON"],
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

    // check rules
    const checkRules = (candidate: any) =>
      EitherAsync.fromPromise(async () =>
        validateFundingRequest(candidate)(params.fundingRequest)
      );

    const createFundingRequest = EitherAsync.fromPromise(() =>
      deps.createFundingRequest(params)
    )
      .map((fundingRequest: FundingRequest) => {
        return {
          ...fundingRequest,
          basicSkills: fundingRequest?.basicSkills.map(
            (b: any) => b.basicSkill
          ),
          mandatoryTrainings: fundingRequest?.mandatoryTrainings.map(
            (t: any) => t.training
          ),
        };
      })
      .mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.FUNDING_REQUEST_NOT_POSSIBLE,
            `Erreur lors de la creation de la demande de financement`
          )
      );

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

    const getGenreCandidat = (gender?: Gender | null) => {
      const nonNullGender = gender || "undisclosed";
      switch (nonNullGender) {
        case "undisclosed":
          return "0";
        case "man":
          return "1";
        case "woman":
          return "2";
        default:
          throw new Error("Unknown gender");
      }
    };

    const createFundingRequestBatch = async (fr: FundingRequest) =>
      EitherAsync.fromPromise(() =>
        deps.getCandidateByCandidacyId(fr.candidacyId)
      )
        .map((candidate) => {
          const batchContent: FundingRequestBatchContent = {
            NumAction: "?????",
            NomAP: "?????",
            SiretAP: "?????",
            CertificationVisée: "?????",
            NomCandidat: candidate.lastname,
            PrenomCandidat1: candidate.firstname,
            PrenomCandidat2: candidate.firstname2 || "",
            PrenomCandidat3: candidate.firstname3 || "",
            GenreCandidat: getGenreCandidat(candidate.gender),
            NiveauObtenuCandidat: "?????",
            IndPublicFragile: getIndPublicFragile(
              candidate.vulnerabilityIndicator
            ),
            NbHeureDemAPDiag: fr.diagnosisHourCount,
            CoutHeureDemAPDiag: fr.diagnosisCost,
            NbHeureDemAPPostJury: fr.postExamHourCount,
            CoutHeureDemAPPostJury: fr.postExamCost,
            AccompagnateurCandidat: fr.companionId,
            NbHeureDemAccVAEInd: fr.individualHourCount,
            CoutHeureDemAccVAEInd: fr.individualCost,
            NbHeureDemAccVAEColl: fr.collectiveHourCount,
            CoutHeureDemAccVAEColl: fr.collectiveCost,
            ActeFormatifComplémentaire_FormationObligatoire: "?????",
            NbHeureDemComplFormObligatoire: fr.mandatoryTrainingsHourCount,
            CoutHeureDemComplFormObligatoire: fr.mandatoryTrainingsCost,
            ActeFormatifComplémentaire_SavoirsDeBase: "?????",
            NbHeureDemComplFormSavoirsDeBase: fr.basicSkillsHourCount,
            CoutHeureDemComplFormSavoirsDeBase: fr.basicSkillsCost,
            ActeFormatifComplémentaire_BlocDeCompetencesCertifiant: "?????",
            NbHeureDemComplFormBlocDeCompetencesCertifiant:
              fr.certificateSkillsHourCount,
            CoutHeureDemComplFormBlocDeCompetencesCertifiant:
              fr.certificateSkillsCost,
            ActeFormatifComplémentaire_Autre: fr.otherTraining,
            NbHeureDemTotalActesFormatifs: fr.otherTrainingHourCount,
            NbHeureDemJury: fr.examHourCount,
            CoutHeureJury: fr.examCost,
            CoutTotalDemande: fr.totalCost || 0,
          };
          return batchContent;
        })
        .chain((batchContent) =>
          deps.createFundingRequestBatch({
            fundingRequestId: fr.id,
            content: batchContent,
          })
        );

    return existsCandidacyInRequiredStatuses
      .chain(() => getCandidateByCandidacyId)
      .chain(checkRules)
      .chain(() => createFundingRequest)
      .ifRight(createFundingRequestBatch);
  };
