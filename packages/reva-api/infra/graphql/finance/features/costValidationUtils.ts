import { Decimal } from "@prisma/client/runtime/library";

export interface HoursAndCosts {
  diagnosisHourCount: number;
  diagnosisCost: Decimal;
  postExamHourCount: number;
  postExamCost: Decimal;
  individualHourCount: number;
  individualCost: Decimal;
  collectiveHourCount: number;
  collectiveCost: Decimal;
  mandatoryTrainingsHourCount: number;
  mandatoryTrainingsCost: Decimal;
  basicSkillsHourCount: number;
  basicSkillsCost: Decimal;
  certificateSkillsHourCount: number;
  certificateSkillsCost: Decimal;
  examHourCount: number;
  examCost: Decimal;
  otherTrainingHourCount: number;
  otherTrainingCost: Decimal;
}

const isBetween = (low: number, high: number) => (value: number) =>
  low <= value && value <= high;

const isLower2 = isBetween(0, 2);
const isLower4 = isBetween(0, 4);
const isLower15 = isBetween(0, 15);
const isLower20 = isBetween(0, 20);
const isLower25 = isBetween(0, 25);
const isLower30 = isBetween(0, 30);
const isLower35 = isBetween(0, 35);
const isLower70 = isBetween(0, 70);
const isLower78 = isBetween(0, 78);

export const validateIndividualCosts = ({
  hoursAndCosts,
  isCandidateBacNonFragile,
  mandatoryTrainingContainAfgsu,
  numberOfMandatoryTrainings,
}: {
  hoursAndCosts: HoursAndCosts;
  isCandidateBacNonFragile: boolean;
  mandatoryTrainingContainAfgsu: boolean;
  numberOfMandatoryTrainings: number;
}): string[] => {
  const errors = [];

  if (
    isCandidateBacNonFragile &&
    !isLower2(
      hoursAndCosts.diagnosisHourCount + hoursAndCosts.postExamHourCount
    )
  ) {
    errors.push(
      "Le nombre d'heures demandées pour la prestation de l'Architecte de Parcours doit être compris entre 0 et 2h."
    );
  } else if (
    !isLower4(
      hoursAndCosts.diagnosisHourCount + hoursAndCosts.postExamHourCount
    )
  ) {
    errors.push(
      "Le nombre d'heures demandées pour la prestation de l'Architecte de Parcours doit être compris entre 0 et 4h."
    );
  }

  if (!isLower70(hoursAndCosts.diagnosisCost.toNumber())) {
    errors.push(
      "Le coût horaire demandé pour la prestation de l'Architecte de Parcours Diagnostique doit être compris entre 0 et 70 euros."
    );
  }

  if (!isLower70(hoursAndCosts.postExamCost.toNumber())) {
    errors.push(
      "Le coût horaire demandé pour la prestation de l'Architecte de Parcours Post Jury doit être compris entre 0 et 70 euros."
    );
  }

  if (
    isCandidateBacNonFragile &&
    !isLower15(hoursAndCosts.individualHourCount)
  ) {
    errors.push(
      "Le nombre d'heures demandé pour la prestation Accompagnement méthodologique à la VAE (individuel) doit être compris entre 0 et 15h."
    );
  } else if (!isLower30(hoursAndCosts.individualHourCount)) {
    errors.push(
      "Le nombre d'heures demandé pour la prestation Accompagnement méthodologique à la VAE (individuel) doit être compris entre 0 et 30h."
    );
  }

  if (!isLower70(hoursAndCosts.individualCost.toNumber())) {
    errors.push(
      "Le coût horaire demandé pour la prestation d'Accompagnement méthodologique à la VAE (individuel) doit être compris entre 0 et 70 euros."
    );
  }

  if (
    isCandidateBacNonFragile &&
    !isLower15(hoursAndCosts.collectiveHourCount)
  ) {
    errors.push(
      "Le nombre d'heures demandées pour la prestation d'Accompagnement méthodologique à la VAE (collectif) doit être compris entre 0 et 15h."
    );
  } else if (!isLower30(hoursAndCosts.collectiveHourCount)) {
    errors.push(
      "Le nombre d'heures demandées pour la prestation d'Accompagnement méthodologique à la VAE (collectif) doit être compris entre 0 et 30h."
    );
  }

  if (!isLower35(hoursAndCosts.collectiveCost.toNumber())) {
    errors.push(
      "Le coût horaire demandé pour la prestation Accompagnement méthodologique à la VAE (collectif) doit être compris entre 0 et 35 euros."
    );
  }

  if (!isLower20(hoursAndCosts.basicSkillsCost.toNumber())) {
    errors.push(
      "Le coût horaire demandé pour la prestation Compléments formatifs Savoirs de base doit être compris entre 0 et 20 euros."
    );
  }

  if (
    !isLower78(
      hoursAndCosts.mandatoryTrainingsHourCount +
        hoursAndCosts.basicSkillsHourCount +
        hoursAndCosts.certificateSkillsHourCount
    )
  ) {
    errors.push(
      "Le nombre d'heures total prescrit pour les actes formatifs doit être compris entre 0 et 78h."
    );
  }

  if (!isLower2(hoursAndCosts.examHourCount)) {
    errors.push(
      "Le nombre d'heures demandé pour la prestation Jury doit être compris entre 0 et 2h."
    );
  }
  if (!isLower20(hoursAndCosts.examCost.toNumber())) {
    errors.push(
      "Le coût horaire demandé pour la prestation Jury doit être compris entre 0 et 20 euros."
    );
  }

  if (mandatoryTrainingContainAfgsu) {
    if (numberOfMandatoryTrainings > 1) {
      errors.push(
        "Impossible de combiner l'AFGSU et une autre formation obligatoire."
      );
    } else if (!isLower25(hoursAndCosts.mandatoryTrainingsCost.toNumber())) {
      errors.push(
        "Le coût horaire demandé pour la prestation Formations obligatoires doit être compris entre 0 et 25 euros."
      );
    }
  } else if (!isLower20(hoursAndCosts.mandatoryTrainingsCost.toNumber())) {
    errors.push(
      "Le coût horaire demandé pour la prestation Formations obligatoires doit être compris entre 0 et 20 euros."
    );
  }

  if (!isLower20(hoursAndCosts.certificateSkillsCost.toNumber())) {
    errors.push(
      "Le coût horaire demandé pour la prestation Compléments formatifs Blocs de compétences doit être compris entre 0 et 20 euros."
    );
  }

  return errors;
};

export const getTotalCost = (hoursAndCosts: HoursAndCosts) =>
  hoursAndCosts.basicSkillsCost
    .times(hoursAndCosts.basicSkillsHourCount)
    .plus(
      hoursAndCosts.certificateSkillsCost.times(
        hoursAndCosts.certificateSkillsHourCount
      )
    )
    .plus(hoursAndCosts.collectiveCost.times(hoursAndCosts.collectiveHourCount))
    .plus(hoursAndCosts.diagnosisCost.times(hoursAndCosts.diagnosisHourCount))
    .plus(hoursAndCosts.examCost.times(hoursAndCosts.examHourCount))
    .plus(hoursAndCosts.individualCost.times(hoursAndCosts.individualHourCount))
    .plus(
      hoursAndCosts.mandatoryTrainingsCost.times(
        hoursAndCosts.mandatoryTrainingsHourCount
      )
    )
    .plus(hoursAndCosts.postExamCost.times(hoursAndCosts.postExamHourCount))
    .plus(
      hoursAndCosts.otherTrainingCost.times(
        hoursAndCosts.otherTrainingHourCount
      )
    );

export const validateTotalCost = (
  totalCost: Decimal,
  isCandidateBacNonFragile: boolean
) => {
  if (isCandidateBacNonFragile) {
    return totalCost.lessThanOrEqualTo(1755)
      ? null
      : "Le coût total ne doit pas dépasser 1755€";
  } else {
    return totalCost.lessThanOrEqualTo(5030)
      ? null
      : "Le coût total ne doit pas dépasser 5030€";
  }
};
