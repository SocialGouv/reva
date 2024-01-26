import { Decimal } from "@prisma/client/runtime/library";

import { prismaClient } from "../../../../prisma/client";

export const createBatchFromFundingRequestUnifvae = async (
  fundingRequestId: string,
) => {
  const fundingRequest =
    await prismaClient.fundingRequestUnifvae.findUniqueOrThrow({
      where: { id: fundingRequestId },
      include: {
        candidacy: {
          select: {
            certificationsAndRegions: {
              where: { isActive: true },
              include: { certification: { select: { rncpId: true } } },
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
    (t) => t.training.label,
  );
  const savoirsDeBase = fundingRequest.basicSkills.map(
    (bs) => bs.basicSkill.label,
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
    new Decimal(0),
  );
  const formationComplementaireCoutHoraireMoyen =
    formationComplementaireHeures.isZero()
      ? new Decimal(0)
      : formationComplementaire
          .reduce(
            (totalCost, fc) => totalCost.plus(fc.cost.times(fc.count)),
            new Decimal(0),
          )
          .dividedBy(formationComplementaireHeures);

  return prismaClient.fundingRequestBatchUnifvae.create({
    data: {
      fundingRequestId: fundingRequest.id,
      content: {
        NumAction: fundingRequest.numAction,
        SiretAP: fundingRequest.candidacy?.organism?.siret,
        Certification:
          fundingRequest.candidacy?.certificationsAndRegions[0]?.certification
            .rncpId,
        NomCandidat: fundingRequest.candidateLastname,
        PrenomCandidat1: fundingRequest.candidateFirstname,
        PrenomCandidat2: fundingRequest.candidateSecondname,
        PrenomCandidat3: fundingRequest.candidateThirdname,
        ActeFormatifComplémentaire_FormationObligatoire: formationObligatoire
          .map(getActeFormatifComplémentaire_FormationObligatoireId)
          .sort()
          .join(","),
        ActeFormatifComplémentaire_SavoirsDeBase: savoirsDeBase
          .map(getActeFormatifComplémentaire_SavoirsDeBaseId)
          .sort()
          .join(","),
        ActeFormatifComplémentaire_BlocDeCompetencesCertifiant:
          fundingRequest.certificateSkills,
        ActeFormatifComplémentaire_Autre: fundingRequest.otherTraining,
        NbHeureDemAccVAEInd: fundingRequest.individualHourCount.toFixed(2),
        CoutHeureDemAccVAEInd: fundingRequest.individualCost.toFixed(2),
        NbHeureDemAccVAEColl: fundingRequest.collectiveHourCount.toFixed(2),
        CoutHeureDemAccVAEColl: fundingRequest.collectiveCost.toFixed(2),
        NHeureDemActeFormatifCompl: formationComplementaireHeures.toFixed(2),
        CoutHeureDemActeFormatifCompl:
          formationComplementaireCoutHoraireMoyen.toFixed(2, Decimal.ROUND_UP),
        ForfaitPartiel: fundingRequest.isPartialCertification ? 1 : 0,
      },
    },
  });
};

const getActeFormatifComplémentaire_FormationObligatoireId = (
  mandatoryTrainingLabel: string,
) => {
  switch (mandatoryTrainingLabel) {
    case "Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU 2)":
      return "0";
    case "Equipier de Première Intervention":
      return "1";
    case "Sauveteur Secouriste du Travail (SST)":
      return "2";
    case "Systèmes d'attaches":
      return "3";
    case "Prévention et secours civiques de niveau 1 (PSC1)":
      return "4";
    case "Premiers secours en équipe de niveau 1 (PSE1)":
      return "5";
    case "Brevet national de sécurité et de sauvetage aquatique (BNSSA)":
      return "6";
    default:
      throw new Error(
        `Unknown mandatory training label: ${mandatoryTrainingLabel}`,
      );
  }
};

const getActeFormatifComplémentaire_SavoirsDeBaseId = (
  basicSkillLabel: string,
) => {
  switch (basicSkillLabel) {
    case "Usage et communication numérique":
      return "0";
    case "Utilisation des règles de base de calcul et du raisonnement mathématique":
      return "1";
    case "Communication en français":
      return "2";
    default:
      throw new Error(`Unknown basic skill label: ${basicSkillLabel}`);
  }
};
