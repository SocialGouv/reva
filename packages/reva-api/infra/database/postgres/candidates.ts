import { prismaClient } from './client';
import { Left, Right } from "purify-ts";
import { candidacyIncludes } from './candidacies';
import { Candidacy, CandidacyStatus } from '@prisma/client';


const withBasicSkills = (c: Candidacy) => ({
    ...c,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    basicSkillIds: c.basicSkills.reduce((memo, bs) => {
        return [...memo, bs.basicSkill.id];
    }, []),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    basicSkills: c.basicSkills.map(bs => bs.basicSkill),
});

const withMandatoryTrainings = (c: Candidacy) => ({
    ...c,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mandatoryTrainingIds: c.trainings.reduce((memo, t) => {
        return [...memo, t.training.id];
    }, []),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mandatoryTrainings: c.trainings.map(t => t.training)
});

export const createCandidateWithCandidacy = async (candidate: any) => {

    try {
        const newCandidate = await prismaClient.candidate.create({
            data: {
                email: candidate.email,
                firstname: candidate.firstname,
                lastname: candidate.lastname,
                phone: candidate.phone,
                keycloakId: candidate.keycloakId,
                candidacies: {
                    create: {
                        deviceId: candidate.email,
                        candidacyStatuses: {
                            create: {
                                status: CandidacyStatus.PROJET,
                                isActive: true
                            }
                        }
                    }
                }
            },
            include: {
                candidacies: {
                    include: candidacyIncludes
                }
            }
        });

        return Right(newCandidate)
            .map(c => ({ ...c, candidacies: c.candidacies.map(candidacy => withBasicSkills(withMandatoryTrainings(candidacy))) }));

    } catch (e) {
        return Left(`error while creating candidate ${candidate.email} with candidacy with keycloakId ${candidate.keycloakId}`);
    }
};