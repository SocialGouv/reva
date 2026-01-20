import {
  CompetenceBlocsPartCompletionEnum,
  DFFCertificationCompetenceDetailsState,
  DFFDecision,
  DFFEligibilityRequirement,
  PrerequisiteState,
} from "@prisma/client";
import PDFDocument from "pdfkit";

import { isAapAvailableForCertificationId } from "@/modules/referential/features/isAapAvailableForCertificationId";
import { formatDateWithoutTimestamp } from "@/modules/shared/date/formatDateWithoutTimestamp";
import { prismaClient } from "@/prisma/client";

import {
  addSubSection,
  getEligibilityLabelAndType,
  pxToPt,
  addSection,
  addFrame,
  addTag,
  addInfoText,
  addCallout,
  addTitledBlock,
  addDisabledCheckbox,
  addDocumentHeader,
  addInfoTable,
  getCourtesyTitleFromGender,
  getCandidateTypologyLabel,
  getExperienceDurationLabel,
  addCompetence,
} from "../helpers/df-demat-pdf-helper/dfDematPdfHelper";

const ASSETS_PATH =
  "modules/feasibility/dematerialized-feasibility-file/assets/df-demat-pdf";

export const generateFeasibilityFileByCandidacyIdV2 = async (
  candidacyId: string,
): Promise<Buffer | undefined> => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    include: {
      certification: { include: { competenceBlocs: true } },
      candidate: {
        include: {
          highestDegree: true,
          niveauDeFormationLePlusEleve: true,
          country: true,
        },
      },
      Feasibility: {
        where: {
          isActive: true,
        },
        include: {
          dematerializedFeasibilityFile: {
            include: {
              dffCertificationCompetenceBlocs: {
                include: {
                  certificationCompetenceBloc: {
                    include: { competences: true },
                  },
                },
              },
              prerequisites: true,
              dffCertificationCompetenceDetails: true,
            },
          },
        },
      },
      ccn: true,
      goals: { include: { goal: true } },
      experiences: true,
    },
  });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  const { certification, candidate } = candidacy;

  if (!certification) {
    throw new Error("Certification non trouvée");
  }

  if (!candidate) {
    throw new Error("Candidat non trouvé");
  }

  const feasibility = candidacy.Feasibility[0];
  if (!feasibility) {
    throw new Error("Dossier de faisabilité non trouvé");
  }

  const { dematerializedFeasibilityFile } = feasibility;
  if (!dematerializedFeasibilityFile) {
    throw new Error("Dossier de faisabilité dématérialisé non trouvé");
  }

  const isDFFReady = checkIsDFFReady({
    attachmentsPartComplete:
      dematerializedFeasibilityFile.attachmentsPartComplete,
    certificationPartComplete:
      dematerializedFeasibilityFile.certificationPartComplete,
    competenceBlocsPartCompletion:
      dematerializedFeasibilityFile.competenceBlocsPartCompletion,
    prerequisitesPartComplete:
      dematerializedFeasibilityFile.prerequisitesPartComplete,
    aapDecision: dematerializedFeasibilityFile.aapDecision,
    eligibilityRequirement:
      dematerializedFeasibilityFile.eligibilityRequirement,
  });
  if (!isDFFReady) {
    throw new Error(
      "Dossier de faisabilité incomplet pour la génération du pdf",
    );
  }

  const aapAvailableForCertification = await isAapAvailableForCertificationId({
    certificationId: certification.id,
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait",
      autoFirstPage: true,
      bufferPages: false,
      compress: true,
      margins: {
        top: pxToPt(40),
        bottom: "80px",
        left: pxToPt(100),
        right: "40px",
      },
    });

    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const data = Buffer.concat(buffers);

      if (data) {
        resolve(data);
      } else {
        reject(undefined);
      }
    });

    addDocumentHeader(doc);

    const eligibilityLabelAndType = getEligibilityLabelAndType({
      eligibilityRequirement:
        dematerializedFeasibilityFile.eligibilityRequirement,
      eligibilitySituation:
        dematerializedFeasibilityFile.eligibilityCandidateSituation,
    });

    const dffBlocCompetenceBlocsIds =
      dematerializedFeasibilityFile.dffCertificationCompetenceBlocs.map(
        (bloc) => bloc.certificationCompetenceBlocId,
      );

    const certificationCompetenceBlocsWithSelectionStatus =
      certification.competenceBlocs.map((bloc) => ({
        code: bloc.code ?? "",
        label: bloc.label ?? "",
        selected: dffBlocCompetenceBlocsIds.includes(bloc.id ?? false),
      }));

    addContexteDemandeSection({
      doc,
      eligibilityLabelAndType,
      certification,
      aapAvailableForCertification,
      option: dematerializedFeasibilityFile.option,
      firstForeignLanguage: dematerializedFeasibilityFile.firstForeignLanguage,
      secondForeignLanguage:
        dematerializedFeasibilityFile.secondForeignLanguage,
      isCertificationPartial: !!candidacy.isCertificationPartial,
      certificationCompetenceBlocsWithSelectionStatus,
      prerequisites:
        dematerializedFeasibilityFile.prerequisites.map((p) => ({
          label: p.label,
          state: p.state,
        })) ?? [],
    });

    //dff competences blocs with competences (label and state)
    const dffCompetenceBlocsWithCompetencesAndStates =
      dematerializedFeasibilityFile.dffCertificationCompetenceBlocs.map(
        (bloc) => {
          const competences = bloc.certificationCompetenceBloc.competences
            .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
            .map((competence) => {
              const details =
                dematerializedFeasibilityFile.dffCertificationCompetenceDetails.find(
                  (detail) =>
                    detail.certificationCompetenceId === competence.id,
                );
              return {
                label: competence.label,
                state: details?.state as
                  | DFFCertificationCompetenceDetailsState
                  | "TO_COMPLETE",
              };
            });
          return {
            code: bloc.certificationCompetenceBloc.code ?? "",
            label: bloc.certificationCompetenceBloc.label,
            text: bloc.text ?? "",
            competences,
          };
        },
      );

    // start a new page if the text position is past the first half of the page
    if (doc.y > 298) {
      doc.addPage();
    }

    addProfilCandidatSection({
      candidate: {
        courtesyTitle: getCourtesyTitleFromGender(candidate.gender),
        firstSecondAndThirdNames: [
          candidate.firstname,
          candidate.firstname2,
          candidate.firstname3,
        ]
          .filter(Boolean)
          .join(", "),
        lastname: candidate.lastname,
        birthdate: candidate.birthdate
          ? formatDateWithoutTimestamp(candidate.birthdate)
          : "",
        birthcity: candidate.birthCity ?? "",
        nationality: candidate.nationality ?? "",
        highestDegreeLevel: candidate.highestDegree?.level?.toString() ?? "",
        highestDegreeLabel: candidate.highestDegreeLabel ?? "",
        niveauDeFormationLePlusEleveLevel:
          candidate.niveauDeFormationLePlusEleve?.level?.toString() ?? "",
        address:
          [
            candidate.street,
            candidate.addressComplement,
            candidate.zip,
            candidate.city,
          ]
            .filter(Boolean)
            .join(" ") + `, ${candidate.country?.label}`,
        email: candidate.email ?? "",
        phone: candidate.phone ?? "",
        candidacyCcnLabel: candidacy.ccn?.label ?? "",
        candidacyCandidateTypologyLabel: getCandidateTypologyLabel(
          candidacy.typology,
        ),
        goals: candidacy.goals.map((goal) => goal.goal.label),
        experiences: candidacy.experiences.map((experience) => ({
          title: experience.title,
          description: experience.description,
          durationLabel: getExperienceDurationLabel(experience.duration),
          startedAtLabel: `Démarrée le ${formatDateWithoutTimestamp(experience.startedAt)}`,
        })),
        dffCompetenceBlocsWithCompetencesAndStates,
      },
      doc,
    });
    doc.end();
  });
};

type CheckIsDFFReadyArgs = {
  attachmentsPartComplete: boolean;
  certificationPartComplete: boolean;
  competenceBlocsPartCompletion: CompetenceBlocsPartCompletionEnum;
  prerequisitesPartComplete: boolean;
  aapDecision: DFFDecision | null;
  eligibilityRequirement: DFFEligibilityRequirement | null;
};

const checkIsDFFReady = ({
  attachmentsPartComplete,
  certificationPartComplete,
  competenceBlocsPartCompletion,
  prerequisitesPartComplete,
  eligibilityRequirement,
}: CheckIsDFFReadyArgs) => {
  let isDFFReady =
    attachmentsPartComplete &&
    certificationPartComplete &&
    prerequisitesPartComplete &&
    !!eligibilityRequirement;

  const isEligibilityTotal =
    eligibilityRequirement === "FULL_ELIGIBILITY_REQUIREMENT";

  if (isEligibilityTotal) {
    isDFFReady = isDFFReady && competenceBlocsPartCompletion === "COMPLETED";
  }

  return isDFFReady;
};

const addContexteDemandeSection = ({
  doc,
  eligibilityLabelAndType,
  certification,
  aapAvailableForCertification,
  option,
  firstForeignLanguage,
  secondForeignLanguage,
  isCertificationPartial,
  certificationCompetenceBlocsWithSelectionStatus,
  prerequisites,
}: {
  doc: PDFKit.PDFDocument;
  eligibilityLabelAndType: { label: string; type: "info" | "warning" };
  certification: { label: string; rncpId: string };
  aapAvailableForCertification: boolean;
  option: string | null;
  firstForeignLanguage: string | null;
  secondForeignLanguage: string | null;
  isCertificationPartial: boolean;
  certificationCompetenceBlocsWithSelectionStatus: {
    code: string;
    label: string;
    selected: boolean;
  }[];
  prerequisites: { label: string; state: PrerequisiteState }[];
}) => {
  addSection({
    doc,
    title: "Contexte de la demande",
    iconPath: `${ASSETS_PATH}/images/data-visualization.png`,
    content: (doc) => {
      addNatureDemandeSubSection({ doc, eligibilityLabelAndType });
      doc.moveDown(1);
      addCertificationSubSection({
        doc,
        certification,
        aapAvailableForCertification,
        option,
        firstForeignLanguage,
        secondForeignLanguage,
        isCertificationPartial,
        certificationCompetenceBlocsWithSelectionStatus,
      });
      doc.moveDown(1);
      addCertificationPrerequisitesSubSection({
        doc,
        prerequisites,
      });
    },
  });
};

const addNatureDemandeSubSection = ({
  doc,
  eligibilityLabelAndType,
}: {
  doc: PDFKit.PDFDocument;
  eligibilityLabelAndType: { label: string; type: "info" | "warning" };
}) => {
  const { backgroundColor, textColor, iconPath } =
    eligibilityLabelAndType.type === "info"
      ? {
          backgroundColor: "#e8edff",
          textColor: "#0063cb",
          iconPath: `${ASSETS_PATH}/images/info-fill.png`,
        }
      : {
          backgroundColor: "#feebd0",
          textColor: "#695240",
          iconPath: `${ASSETS_PATH}/images/flashlight-fill.png`,
        };

  addSubSection({
    title: "Nature de la demande",
    doc,
    content: (doc) => {
      doc
        .font("assets/fonts/Marianne/Marianne-Bold.otf")
        .fontSize(8)
        .table({
          columnStyles: [doc.widthOfString(eligibilityLabelAndType.label) + 25],
          data: [
            [
              {
                border: 0,
                backgroundColor,
                textColor,
                text: "        " + eligibilityLabelAndType.label,
              },
            ],
          ],
        });

      doc.image(iconPath, doc.x + 2, doc.y - 13, {
        fit: [12, 12],
      });
    },
  });
};

const addCertificationSubSection = ({
  doc,
  certification,
  aapAvailableForCertification,
  option,
  firstForeignLanguage,
  secondForeignLanguage,
  isCertificationPartial,
  certificationCompetenceBlocsWithSelectionStatus,
}: {
  doc: PDFKit.PDFDocument;
  certification: { label: string; rncpId: string };
  aapAvailableForCertification: boolean;
  option: string | null;
  firstForeignLanguage: string | null;
  secondForeignLanguage: string | null;
  isCertificationPartial: boolean;
  certificationCompetenceBlocsWithSelectionStatus: {
    code: string;
    label: string;
    selected: boolean;
  }[];
}) => {
  addSubSection({
    title: "Informations sur la certification professionnelle visée",
    doc,
    content: (doc) => {
      addFrame({
        doc,
        startInPt: pxToPt(180),
        widthInPt: pxToPt(1160),
        content: (doc) => {
          doc.moveDown(0.75);
          addTag({
            doc,
            text: aapAvailableForCertification
              ? "VAE en autonomie ou accompagnée"
              : "VAE en autonomie",
            startInPt: doc.x + pxToPt(72),
          });
          doc.image(
            `${ASSETS_PATH}/images/verified-badge.png`,
            doc.x,
            doc.y + pxToPt(20),
            {
              fit: [pxToPt(16), pxToPt(16)],
            },
          );
          doc
            .font("assets/fonts/Marianne/Marianne-Light.otf")
            .fontSize(6)
            .text(
              `       RNCP ${certification.rncpId}`,
              doc.x,
              doc.y + pxToPt(16),
            );

          doc
            .font("assets/fonts/Marianne/Marianne-Bold.otf")
            .fontSize(11)
            .text(certification.label, doc.x, doc.y + pxToPt(16), {
              width: pxToPt(1096),
            });

          doc.moveDown(2);
        },
      });

      doc.moveDown(0.5);

      addInfoText({
        title: "Option ou parcours :",
        value: option ?? "",
        doc,
        maxWidthInPt: pxToPt(1160),
      });

      doc.moveDown(0.5);

      const oldY = doc.y;

      const oldX = doc.x;

      addInfoText({
        title: "Langue vivante 1 :",
        value: firstForeignLanguage ?? "",
        doc,
      });

      addInfoText({
        title: "Langue vivante 2 :",
        value: secondForeignLanguage ?? "",
        x: doc.x + pxToPt(300),
        y: oldY,
        doc,
      });

      doc.moveDown(1);

      addCallout({
        title: "Le candidat vise",
        description: isCertificationPartial
          ? "Un ou plusieurs bloc(s) de compétences de la certification"
          : "La certification dans sa totalité",
        x: oldX,
        doc,
        widthInPt: pxToPt(1160),
      });

      doc.moveDown(1);

      addTitledBlock({
        doc,
        title: "Choix des blocs de compétences",
        content: (doc) =>
          certificationCompetenceBlocsWithSelectionStatus.forEach((bloc) => {
            addDisabledCheckbox({
              label: `${bloc.code} - ${bloc.label}`,
              checked: bloc.selected,
              doc,
            });
            doc.moveDown(0.5);
          }),
        widthInPt: pxToPt(1160),
      });
    },
  });
};

const addCertificationPrerequisitesSubSection = ({
  doc,
  prerequisites,
}: {
  doc: PDFKit.PDFDocument;
  prerequisites: { label: string; state: PrerequisiteState }[];
}) => {
  addSubSection({
    title:
      "Pré-requis à la délivrance de la certification professionnelle visée ",
    doc,
    content: (doc) => {
      addTitledBlock({
        doc,
        title: "Oui",
        widthInPt: pxToPt(1160),
        content: (doc) => {
          prerequisites
            .filter((p) => p.state === "ACQUIRED")
            .forEach((prerequisite) =>
              doc
                .fontSize(8)
                .font("assets/fonts/Marianne/Marianne-Light.otf")
                .text("- " + prerequisite.label, doc.x, doc.y),
            );
        },
      });
      doc.moveDown(1);
      addTitledBlock({
        doc,
        title: "Non",
        widthInPt: pxToPt(1160),
        content: (doc) => {
          prerequisites
            .filter((p) => p.state === "IN_PROGRESS")
            .forEach((prerequisite) =>
              doc
                .fontSize(8)
                .font("assets/fonts/Marianne/Marianne-Light.otf")
                .text("- " + prerequisite.label, doc.x, doc.y),
            );
        },
      });
    },
  });
};

const addProfilCandidatSection = ({
  doc,
  candidate: {
    courtesyTitle,
    firstSecondAndThirdNames,
    lastname,
    birthdate,
    birthcity,
    nationality,
    highestDegreeLevel,
    highestDegreeLabel,
    niveauDeFormationLePlusEleveLevel,
    address,
    email,
    phone,
    candidacyCcnLabel,
    candidacyCandidateTypologyLabel,
    goals,
    experiences,
    dffCompetenceBlocsWithCompetencesAndStates,
  },
}: {
  candidate: {
    courtesyTitle: string;
    firstSecondAndThirdNames: string;
    lastname: string;
    birthdate: string;
    birthcity: string;
    nationality: string;
    highestDegreeLevel: string;
    highestDegreeLabel: string;
    niveauDeFormationLePlusEleveLevel: string;
    address: string;
    email: string;
    phone: string;
    candidacyCcnLabel: string;
    candidacyCandidateTypologyLabel: string;
    goals: string[];
    experiences: {
      title: string;
      description: string;
      durationLabel: string;
      startedAtLabel: string;
    }[];
    dffCompetenceBlocsWithCompetencesAndStates: {
      code: string;
      label: string;
      text: string;
      competences: {
        label: string;
        state: DFFCertificationCompetenceDetailsState | "TO_COMPLETE";
      }[];
    }[];
  };
  doc: PDFKit.PDFDocument;
}) => {
  addSection({
    doc,
    title: "Profil du candidat",
    iconPath: `${ASSETS_PATH}/images/avatar.png`,
    content: (doc) => {
      addSubSection({
        title: "Informations sur le candidat",
        doc,
        content: (doc) => {
          addInfoTable({
            widthInPt: pxToPt(1160),
            data: [
              { title: "Civilité :", value: courtesyTitle },
              { title: "Nom de naissance:", value: lastname },
              { title: "Prénoms :", value: firstSecondAndThirdNames },
              {
                title: "Date de naissance :",
                value: birthdate,
              },
              { title: "Ville de naissance :", value: birthcity },
              { title: "Nationalité :", value: nationality },
            ],
            doc,
          });
        },
      });
      doc.moveDown(1);
      addSubSection({
        title: "Niveau de formation",
        doc,
        content: (doc) => {
          addInfoTable({
            widthInPt: pxToPt(1160),
            data: [
              {
                title: "Niveau de formation le plus élevé:",
                value: niveauDeFormationLePlusEleveLevel,
              },
              {
                title: "Niveau de la certification obtenue la plus élevée:",
                value: highestDegreeLevel,
              },
              {
                title: "Intitulé de la certification la plus élevée obtenue:",
                value: highestDegreeLabel,
              },
            ],
            doc,
          });
        },
      });
      doc.moveDown(1);
      addSubSection({
        title: "Informations de contact du candidat",
        doc,
        content: (doc) => {
          addInfoTable({
            widthInPt: pxToPt(1160),
            data: [
              { title: "Adresse postale:", value: address },
              { title: "Adresse électronique:", value: email },
              { title: "Téléphone:", value: phone },
            ],
            doc,
          });
        },
      });
      doc.moveDown(1);
      addSubSection({
        title: "Statut",
        doc,
        content: (doc) => {
          doc
            .fontSize(8)
            .font("assets/fonts/Marianne/Marianne-Regular.otf")
            .text(candidacyCandidateTypologyLabel, doc.x, doc.y);
          doc.moveDown(1);
          addCallout({
            title:
              "Identifiant de la Convention collective de l’employeur du candidat",
            description: candidacyCcnLabel,
            x: doc.x,
            doc,
            widthInPt: pxToPt(1160),
          });
        },
      });
      doc.moveDown(1);
      addSubSection({
        title: "Objectifs du candidat",
        doc,
        content: (doc) => {
          goals.forEach((goal) => {
            doc
              .fontSize(8)
              .font("assets/fonts/Marianne/Marianne-Regular.otf")
              .text("- " + goal, doc.x, doc.y);
            doc.moveDown(0.5);
          });
        },
      });
      doc.moveDown(1);
      addSubSection({
        title: "Expériences",
        doc,
        content: (doc) => {
          experiences.forEach((experience) => {
            addTitledBlock({
              doc,
              title: experience.title,
              content: (doc) => {
                doc
                  .fontSize(8)
                  .font("assets/fonts/Marianne/Marianne-Light.otf")
                  .text(experience.description, doc.x, doc.y);
                doc.moveDown(0.5);
                doc
                  .fontSize(8)
                  .font("assets/fonts/Marianne/Marianne-Light.otf")
                  .text(experience.durationLabel, doc.x, doc.y);
                doc.moveDown(0.5);
                doc
                  .fontSize(8)
                  .font("assets/fonts/Marianne/Marianne-Light.otf")
                  .text(experience.startedAtLabel, doc.x, doc.y);
              },
              widthInPt: pxToPt(1160),
            });
            doc.moveDown(1);
          });
        },
      });
      addSubSection({
        title:
          "Informations sur les expériences du candidat en lien avec le référentiel d’activités et de compétences",
        doc,
        content: (doc) => {
          doc.moveDown(0.5);
          dffCompetenceBlocsWithCompetencesAndStates.forEach((bloc) => {
            addTitledBlock({
              doc,
              title: `${bloc.code} - ${bloc.label}`,
              content: (doc) => {
                doc.moveDown(0.5);
                bloc.competences.forEach((competence) => {
                  addCompetence({
                    doc,
                    label: competence.label,
                    state: competence.state,
                  });
                  doc.moveDown(1);
                });
                doc
                  .font("assets/fonts/Marianne/Marianne-Bold.otf")
                  .fontSize(8)
                  .text("Commentaire sur le bloc");
                doc.moveDown(0.25);
                doc
                  .font("assets/fonts/Marianne/Marianne-Regular.otf")
                  .fontSize(8)
                  .text(bloc.text);
              },
              widthInPt: pxToPt(1160),
            });
            doc.moveDown(1);
          });
        },
      });
    },
  });
};
