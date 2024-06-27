export const costsAndHoursTotal = ({
  individualEffectiveHourCount,
  individualEffectiveCost,
  collectiveEffectiveHourCount,
  collectiveEffectiveCost,
  mandatoryTrainingsEffectiveHourCount,
  mandatoryTrainingsEffectiveCost,
  basicSkillsEffectiveHourCount,
  basicSkillsEffectiveCost,
  certificateSkillsEffectiveHourCount,
  certificateSkillsEffectiveCost,
  otherTrainingEffectiveHourCount,
  otherTrainingEffectiveCost,
  diagnosisEffectiveHourCount,
  diagnosisEffectiveCost,
  postExamEffectiveHourCount,
  postExamEffectiveCost,
  examEffectiveHourCount,
  examEffectiveCost,
}: {
  individualEffectiveHourCount?: number;
  individualEffectiveCost?: number;
  collectiveEffectiveHourCount?: number;
  collectiveEffectiveCost?: number;
  mandatoryTrainingsEffectiveHourCount?: number;
  mandatoryTrainingsEffectiveCost?: number;
  basicSkillsEffectiveHourCount?: number;
  basicSkillsEffectiveCost?: number;
  certificateSkillsEffectiveHourCount?: number;
  certificateSkillsEffectiveCost?: number;
  otherTrainingEffectiveHourCount?: number;
  otherTrainingEffectiveCost?: number;
  diagnosisEffectiveHourCount?: number;
  diagnosisEffectiveCost?: number;
  postExamEffectiveHourCount?: number;
  postExamEffectiveCost?: number;
  examEffectiveHourCount?: number;
  examEffectiveCost?: number;
}) => {
  const meetingHourCountTotal =
    (diagnosisEffectiveHourCount || 0) + (postExamEffectiveHourCount || 0);

  const meetingCostTotal =
    (diagnosisEffectiveHourCount || 0) * (diagnosisEffectiveCost || 0) +
    (postExamEffectiveHourCount || 0) * (postExamEffectiveCost || 0);

  const supportHourCountTotal =
    (individualEffectiveHourCount || 0) + (collectiveEffectiveHourCount || 0);

  const supportEffectiveCostTotal =
    (individualEffectiveHourCount || 0) * (individualEffectiveCost || 0) +
    (collectiveEffectiveHourCount || 0) * (collectiveEffectiveCost || 0);

  const trainingHourCountTotal =
    (mandatoryTrainingsEffectiveHourCount || 0) +
    (basicSkillsEffectiveHourCount || 0) +
    (certificateSkillsEffectiveHourCount || 0) +
    (otherTrainingEffectiveHourCount || 0);

  const trainingCostTotal =
    (mandatoryTrainingsEffectiveHourCount || 0) *
      (mandatoryTrainingsEffectiveCost || 0) +
    (basicSkillsEffectiveHourCount || 0) * (basicSkillsEffectiveCost || 0) +
    (certificateSkillsEffectiveHourCount || 0) *
      (certificateSkillsEffectiveCost || 0) +
    (otherTrainingEffectiveHourCount || 0) * (otherTrainingEffectiveCost || 0);

  const juryHourCountTotal = examEffectiveHourCount || 0;

  const juryCostTotal =
    (examEffectiveHourCount || 0) * (examEffectiveCost || 0);

  const totalHourCount =
    meetingHourCountTotal +
    supportHourCountTotal +
    trainingHourCountTotal +
    juryHourCountTotal;

  const totalCost =
    meetingCostTotal +
    supportEffectiveCostTotal +
    trainingCostTotal +
    juryCostTotal;

  return {
    meetingHourCountTotal,
    meetingCostTotal,
    supportHourCountTotal,
    supportEffectiveCostTotal,
    trainingHourCountTotal,
    trainingCostTotal,
    juryHourCountTotal,
    juryCostTotal,
    totalHourCount,
    totalCost,
  };
};
