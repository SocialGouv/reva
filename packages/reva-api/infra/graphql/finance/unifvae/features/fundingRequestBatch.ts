import { Decimal } from "@prisma/client/runtime";

import { prismaClient } from "../../../../database/postgres/client";

export const createBatchFromFundingRequestUnifvae = async (
  fundingRequestId: string
) => {
  const fundingRequest =
    await prismaClient.fundingRequestUnifvae.findUniqueOrThrow({
      where: { id: fundingRequestId },
      include: {
        candidacy: {
          select: {
            certificationsAndRegions: {
              include: { certification: { select: { label: true } } },
            },
            organism: { select: { siret: true } },
          },
        },
        basicSkills: {
          select: { basicSkill: { select: { label: true } } },
        },
        mandatoryTrainings: {
          select: { training: { select: { label: true } } },
        },
      },
    });

  const formationObligatoire = fundingRequest.mandatoryTrainings.map(
    (t) => t.training.label
  );
  const savoirsDeBase = fundingRequest.basicSkills.map(
    (bs) => bs.basicSkill.label
  );

  const formationComplementaire = [
    {
      count: fundingRequest.basicSkillsHourCount,
      cost: fundingRequest.basicSkillsCost,
    },
    {
      count: fundingRequest.mandatoryTrainingsHourCount,
      cost: fundingRequest.mandatoryTrainingsCost,
    },
    {
      count: fundingRequest.certificateSkillsHourCount,
      cost: fundingRequest.certificateSkillsCost,
    },
    {
      count: fundingRequest.otherTrainingHourCount,
      cost: fundingRequest.otherTrainingCost,
    },
  ];

  const formationComplementaireHeures = formationComplementaire.reduce(
    (heures, fc) => heures.plus(fc.count),
    new Decimal(0)
  );
  const formationComplementaireCoutTotal = formationComplementaire.reduce(
    (totalCost, fc) => totalCost.plus(fc.cost.times(fc.count)),
    new Decimal(0)
  );

  return prismaClient.fundingRequestBatchUnifvae.create({
    data: {
      fundingRequestId: fundingRequest.id,
      content: {
        NumAction: fundingRequest.numAction,
        SiretAP: fundingRequest.candidacy?.organism?.siret,
        Certification:
          fundingRequest.candidacy?.certificationsAndRegions[0].certification
            .label,
        NomCandidat: fundingRequest.candidateLastname,
        PrenomCandidat1: fundingRequest.candidateFirstname,
        PrenomCandidat2: fundingRequest.candidateSecondname,
        PrenomCandidat3: fundingRequest.candidateThirdname,
        ActeFormatifComplémentaire_FormationObligatoire: formationObligatoire
          .sort()
          .join(", "),
        ActeFormatifComplémentaire_SavoirsDeBase: savoirsDeBase
          .sort()
          .join(", "),
        ActeFormatifComplémentaire_BlocDeCompetencesCertifiant:
          fundingRequest.certificateSkills,
        ActeFormatifComplémentaire_Autre: fundingRequest.otherTraining,
        NbHeureDemAccVAEInd: fundingRequest.individualHourCount.toFixed(2),
        CoutHeureDemAccVAEInd: fundingRequest.individualCost.toFixed(2),
        NbHeureDemAccVAEColl: fundingRequest.collectiveHourCount.toFixed(2),
        CoutHeureDemAccVAEColl: fundingRequest.collectiveCost.toFixed(2),
        NHeureDemActeFormatifCompl: formationComplementaireHeures.toFixed(2),
        CoutHeureDemActeFormatifCompl:
          formationComplementaireCoutTotal.toFixed(2),
        ForfaitPartiel: fundingRequest.isPartialCertification ? 1 : 0,
      },
    },
  });
};
