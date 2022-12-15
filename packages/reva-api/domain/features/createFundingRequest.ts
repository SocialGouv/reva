import { Either, EitherAsync, Left, Right } from "purify-ts";

import { Role } from "../types/account";
import { Candidacy, Degree } from "../types/candidacy";
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
  getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
  createFundingRequestBatch: (params: {
    fundingRequestId: string;
    content: object;
  }) => Promise<Either<string, FundingRequestBatch>>;
  getNextNumAction: () => Promise<Either<string, string>>;
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
        .map((args) =>
          EitherAsync.fromPromise(() => deps.getNextNumAction()).map(
            (numAction) => ({ ...args, numAction })
          )
        )
        .join()
        .map(mapFundingRequestBatch)
        .chain((batchContent) =>
          deps.createFundingRequestBatch({
            fundingRequestId: fundingRequest.id,
            content: batchContent,
          })
        )
        .mapLeft(
          () =>
            new FunctionalError(
              FunctionalCodeError.FUNDING_REQUEST_NOT_POSSIBLE,
              `Erreur lors de la creation du bach de la demande de financement`
            )
        );

    return existsCandidacyInRequiredStatuses
      .chain(() => getCandidateByCandidacyId)
      .chain(checkRules)
      .chain(createFundingRequest)
      .ifRight(createFundingRequestBatch);
  };

const mapFundingRequestBatch = ({
  fundingRequest,
  candidate,
  candidacy,
  numAction,
}: {
  fundingRequest: FundingRequest;
  candidate: Candidate;
  candidacy: Candidacy;
  numAction: string;
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
        }
      });

    const getActeFormatifComplémentaire_FormationObligatoire = (
      mandatoryTrainings: { label: string }[]
    ) =>
      mandatoryTrainings.map((m) => {
        switch (m.label) {
          case "Attestation de Formation aux Gestes et Soins d’Urgence (AFGSU)":
            return "0";
          case "Equipier de Première Intervention":
            return "1";
          case "Sauveteur Secouriste du Travail (SST)":
            return "2";
          case "Systèmes d’attaches":
            return "3";
        }
      });

    const batchContent: FundingRequestBatchContent = {
      NumAction: numAction,
      NomAP: candidacy?.organism?.label || "",
      SiretAP: candidacy?.organism?.siret || "",
      CertificationVisée: candidacy.certification.rncpId,
      NomCandidat: candidate.lastname,
      PrenomCandidat1: candidate.firstname,
      PrenomCandidat2: candidate.firstname2 || "",
      PrenomCandidat3: candidate.firstname3 || "",
      GenreCandidat: getGenreCandidat(candidate.gender),
      NiveauObtenuCandidat: getNiveauObtenuCandidat(candidate.highestDegree),
      IndPublicFragile: getIndPublicFragile(candidate.vulnerabilityIndicator),
      NbHeureDemAPDiag: fundingRequest.diagnosisHourCount,
      CoutHeureDemAPDiag: fundingRequest.diagnosisCost,
      NbHeureDemAPPostJury: fundingRequest.postExamHourCount,
      CoutHeureDemAPPostJury: fundingRequest.postExamCost,
      AccompagnateurCandidat: fundingRequest?.companion?.siret || "",
      NbHeureDemAccVAEInd: fundingRequest.individualHourCount,
      CoutHeureDemAccVAEInd: fundingRequest.individualCost,
      NbHeureDemAccVAEColl: fundingRequest.collectiveHourCount,
      CoutHeureDemAccVAEColl: fundingRequest.collectiveCost,
      ActeFormatifComplémentaire_FormationObligatoire:
        getActeFormatifComplémentaire_FormationObligatoire(
          fundingRequest.mandatoryTrainings
        ).join(","),
      NbHeureDemComplFormObligatoire:
        fundingRequest.mandatoryTrainingsHourCount,
      CoutHeureDemComplFormObligatoire: fundingRequest.mandatoryTrainingsCost,
      ActeFormatifComplémentaire_SavoirsDeBase:
        getActeFormatifComplémentaire_SavoirsDeBase(
          fundingRequest.basicSkills
        ).join(","),
      NbHeureDemComplFormSavoirsDeBase: fundingRequest.basicSkillsHourCount,
      CoutHeureDemComplFormSavoirsDeBase: fundingRequest.basicSkillsCost,
      ActeFormatifComplémentaire_BlocDeCompetencesCertifiant:
        fundingRequest.certificateSkills,
      NbHeureDemComplFormBlocDeCompetencesCertifiant:
        fundingRequest.certificateSkillsHourCount,
      CoutHeureDemComplFormBlocDeCompetencesCertifiant:
        fundingRequest.certificateSkillsCost,
      ActeFormatifComplémentaire_Autre: fundingRequest.otherTraining,
      NbHeureDemTotalActesFormatifs: fundingRequest.otherTrainingHourCount,
      NbHeureDemJury: fundingRequest.examHourCount,
      CoutHeureJury: fundingRequest.examCost,
      CoutTotalDemande: fundingRequest.totalCost || 0,
    };
    return batchContent;
  }
};
