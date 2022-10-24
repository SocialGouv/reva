import { prismaClient } from './client';
import { Left, Maybe, Right } from "purify-ts";
import { candidacyIncludes } from './candidacies';
import { CandidacyStatus } from '@prisma/client';
import { IAMAccount } from '../../../domain/types/account';
import { Candidacy } from '../../../domain/types/candidacy';


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

        // Create account
        const createdCandidate = await prismaClient.candidate.create({
            data: {
                email: candidate.email,
                firstname: candidate.firstname,
                lastname: candidate.lastname,
                phone: candidate.phone,
                keycloakId: candidate.keycloakId
            }
        });

        // Update existing candidacy with this id
        const update = await prismaClient.candidacy.updateMany({
            data: {
                candidateId: createdCandidate.id
            },
            where: {
                email: candidate.email.trim()
            }
        });

        // Check if an existing candidacy is active
        const candidacy = await prismaClient.candidacy.findFirst({
            where: {
                candidateId: createdCandidate.id,
                candidacyStatuses: {
                    none: {
                        status: "ARCHIVE",
                        isActive: true
                    }
                }
            }
        });

        let newCandidate = null;
        if (!candidacy) {
            newCandidate = await prismaClient.candidate.update({
                data: {
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
                where: {
                    id: createdCandidate.id
                },
                include: {
                    candidacies: {
                        include: candidacyIncludes
                    }
                }
            });
        } else {
            newCandidate = await prismaClient.candidate.findFirst({
                where: {
                    id: createdCandidate.id
                },
                include: {
                    candidacies: {
                        include: candidacyIncludes
                    }
                }
            });
        }

        const certificationAndRegion = await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
            where: {
                candidacyId: newCandidate?.candidacies[0].id,
                isActive: true
            },
            include: {
                certification: true,
                region: true,
            }
        });

        return Maybe.fromNullable(newCandidate)
            .map(c => ({
                ...c, candidacies: c.candidacies.map(candidacy => withBasicSkills(withMandatoryTrainings({ 
                    ...candidacy, 
                    regionId: certificationAndRegion?.region.id, 
                    region: certificationAndRegion?.region, 
                    certificationId: certificationAndRegion?.certification.id, 
                    certification: certificationAndRegion?.certification && {
                        ...certificationAndRegion?.certification, 
                        codeRncp: certificationAndRegion?.certification.rncpId
                    }
                })))
            }))
            .toEither(`Candidate not found`);

    } catch (e) {
        console.log(e);
        return Left(`error while creating candidate ${candidate.email} with candidacy with keycloakId ${candidate.keycloakId}`);
    }
};

export const getCandidateWithCandidacyFromKeycloakId = async (keycloakId: string) => {
    try {
        const candidate = await prismaClient.candidate.findFirst({
            where: {
                keycloakId: keycloakId,
                candidacies: {
                    some: {
                        candidacyStatuses: {
                            none: {
                                status: "ARCHIVE",
                                isActive: true
                            }
                        }    
                    }
                }
            },
            include: {
                candidacies: {
                    include: candidacyIncludes
                },
            }
        });

        const certificationAndRegion = await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
            where: {
                candidacyId: candidate?.candidacies[0].id,
                isActive: true
            },
            include: {
                certification: true,
                region: true,
            }
        });

        return Maybe.fromNullable(candidate)
            .map(c => ({
                ...c, 
                candidacies: c.candidacies.map(candidacy => withBasicSkills(withMandatoryTrainings({ 
                    ...candidacy, 
                    regionId: certificationAndRegion?.region.id, 
                    region: certificationAndRegion?.region, 
                    certificationId: certificationAndRegion?.certification.id, 
                    certification: certificationAndRegion?.certification && {
                        ...certificationAndRegion?.certification, 
                        codeRncp: certificationAndRegion?.certification.rncpId
                    }
                })))
            }))
            .toEither(`Candidate not found`);
    } catch (e) {
        return Left(`error while retrieving the candidate`);
    };
};

