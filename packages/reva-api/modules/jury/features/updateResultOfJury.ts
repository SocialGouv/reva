import { isBefore, startOfDay } from "date-fns";
import z from "zod";

import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { NOT_AUTHORIZED_CANDIDACY_MANAGE } from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";

import { sendJuryResultAAPEmail } from "../emails/sendJuryResultAAPEmail";
import { sendJuryResultCandidateEmail } from "../emails/sendJuryResultCandidateEmail";
import { ALL_JURY_RESULTS, JuryInfo } from "../jury.types";

import { canManageJury } from "./canManageJury";
import { getPreviouslyValidatedBlocksByCandidacyId } from "./getPreviouslyValidatedBlocksByCandidacyId";

interface UpdateResultOfJury {
  juryId: string;
  juryInfo: JuryInfo;
  roles: KeyCloakUserRole[];
  hasRole: (role: string) => boolean;
  keycloakId: string;
  userEmail: string;
}

export const updateResultOfJury = async (params: UpdateResultOfJury) => {
  const { juryId, juryInfo, roles, keycloakId, userEmail } = params;

  if (
    juryInfo.juryResultByCompetenceBlocs?.length !== undefined &&
    juryInfo.juryResultByCompetenceBlocs.length > 0
  ) {
    await validateJuryResultWithBlocks(juryId, juryInfo);
  }

  const jury = await prismaClient.jury.findUnique({
    where: { id: juryId, isActive: true },
    include: {
      candidacy: {
        include: {
          organism: true,
          candidate: true,
        },
      },
    },
  });

  if (!jury) {
    throw new Error("Le jury n'est pas actif ou n'existe pas");
  }

  const authorized = await canManageJury({
    candidacyId: jury.candidacyId,
    roles,
    keycloakId,
  });

  if (!authorized) {
    throw new Error(NOT_AUTHORIZED_CANDIDACY_MANAGE);
  }

  const dateOfJuryHasNotPassed = jury
    ? isBefore(new Date(), startOfDay(jury.dateOfSession))
    : false;

  if (dateOfJuryHasNotPassed) {
    throw new Error("La date du jury n'est pas passée");
  }

  let isResultTemporary = false;

  if (params.hasRole("admin")) {
    isResultTemporary = true;
  }

  if (jury.result) {
    throw new Error("Le résultat du jury a déjà été renseigné");
  }

  const updatedJury = await prismaClient.jury.update({
    where: {
      id: jury.id,
    },
    data: {
      result: juryInfo.result,
      isResultTemporary,
      dateOfResult: new Date(),
      juryResultByCompetenceBlocs: {
        create: juryInfo.juryResultByCompetenceBlocs?.map((competenceBloc) => ({
          competenceBlocId: competenceBloc.competenceBlocId,
          isCompetenceBlocValidated: competenceBloc.isCompetenceBlocValidated,
        })),
      },
      informationOfResult:
        juryInfo.informationOfResult == ""
          ? undefined
          : juryInfo.informationOfResult,
    },
  });

  // When the candidacy has a failed jury result,
  // the user can submit another dossier de validation
  // So we need to reset the "ready for jury estimated date"
  const failedJuryResults = [
    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
    "FAILURE",
    "CANDIDATE_EXCUSED",
    "CANDIDATE_ABSENT",
  ];

  if (failedJuryResults.includes(juryInfo.result)) {
    await prismaClient.candidacy.update({
      where: {
        id: jury.candidacyId,
      },
      data: {
        readyForJuryEstimatedAt: null,
      },
    });
  }

  const { candidacy } = jury;

  if (candidacy.candidate) {
    await sendJuryResultCandidateEmail({
      email: candidacy.candidate.email,
    });

    if (candidacy.organism?.contactAdministrativeEmail) {
      await sendJuryResultAAPEmail({
        candidacyId: candidacy.id,
        email: candidacy.organism?.contactAdministrativeEmail,
        candidateFullName: `${candidacy.candidate.firstname} ${candidacy.candidate.lastname}`,
      });
    }
  }
  await logCandidacyAuditEvent({
    candidacyId: candidacy.id,
    userKeycloakId: keycloakId,
    userEmail,
    userRoles: roles,
    eventType: "JURY_RESULT_UPDATED",
    details: {
      result: juryInfo.result,
    },
  });

  return updatedJury;
};

const validateJuryResultWithBlocks = async (
  juryId: string,
  juryInfo: JuryInfo,
) => {
  const candidacyId = await prismaClient.jury
    .findUnique({
      where: { id: juryId },
      select: {
        candidacyId: true,
      },
    })
    .then((jury) => jury?.candidacyId);

  if (!candidacyId) {
    throw new Error("La candidature n'existe pas");
  }

  const previouslyValidatedBlocksIds =
    await getPreviouslyValidatedBlocksByCandidacyId({
      candidacyId,
    }).then((blocks) => blocks.map((block) => block.id));

  const feasibility = await prismaClient.feasibility.findFirst({
    where: { candidacyId, isActive: true },
    select: {
      dematerializedFeasibilityFile: {
        select: {
          dffCertificationCompetenceBlocs: true,
        },
      },
    },
  });

  const blocksTargetedForThisSession =
    feasibility?.dematerializedFeasibilityFile?.dffCertificationCompetenceBlocs.filter(
      (block) =>
        !previouslyValidatedBlocksIds.includes(
          block.certificationCompetenceBlocId,
        ),
    ) || [];

  // Rejette tout competenceBlocId absent du dossier de faisabilité de la
  // candidature (bloque l'écriture cross-dossier via interop).
  const validBlocIds = new Set(
    feasibility?.dematerializedFeasibilityFile?.dffCertificationCompetenceBlocs.map(
      (block) => block.certificationCompetenceBlocId,
    ) ?? [],
  );

  const invalidBlocIds = (juryInfo.juryResultByCompetenceBlocs ?? [])
    .filter((block) => !validBlocIds.has(block.competenceBlocId))
    .map((block) => block.competenceBlocId);

  if (invalidBlocIds.length > 0) {
    throw new Error(
      "Un ou plusieurs blocs de compétences ne font pas partie du dossier de cette candidature",
    );
  }

  const schema = z
    .object({
      result: z.enum(ALL_JURY_RESULTS),
      informationOfResult: z.string().optional(),
      juryResultByCompetenceBlocs: z.array(
        z.object({
          competenceBlocId: z.string(),
          isCompetenceBlocValidated: z.boolean(),
        }),
      ),
    })
    .superRefine((data, ctx) => {
      const validatedBlocks = data.juryResultByCompetenceBlocs.filter(
        (block) => block.isCompetenceBlocValidated,
      );
      if (
        (data.result === "FULL_SUCCESS_OF_FULL_CERTIFICATION" ||
          data.result === "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION" ||
          data.result === "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION" ||
          data.result === "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION") &&
        validatedBlocks.length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vous devez valider au moins un bloc pour ce résultat",
          path: ["juryResultByCompetenceBlocs"],
        });
      }
      if (
        (data.result === "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION" ||
          data.result === "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION") &&
        validatedBlocks.length === blocksTargetedForThisSession.length
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vous ne pouvez pas valider tous les blocs pour ce résultat",
          path: ["juryResultByCompetenceBlocs"],
        });
      }
    });

  const { error } = await schema.safeParseAsync(juryInfo);

  if (error) {
    throw new Error(error.message);
  }
};
