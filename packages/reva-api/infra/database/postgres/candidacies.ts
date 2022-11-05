import { CandidaciesStatus, Candidacy, CandidacyStatus, CandidateTypology, Certification, Organism } from '@prisma/client';
import { Either, Left, Maybe, Right } from 'purify-ts';
import * as domain from '../../../domain/types/candidacy';
import { prismaClient } from './client';
import { toDomainExperiences } from './experiences';
 
export const candidacyIncludes = {
    experiences: true,
    goals: true,
    candidacyStatuses: true,
    certificationsAndRegions: {
        select: {
            certification: true,
            region: true
        },
        where: {
            isActive: true
        }
    },
    organism: true,
    basicSkills: {
        select: {
            basicSkill: true
        }
    },
    trainings: {
        select: {
            training: true
        }
    },
};


const toDomainCandidacySummary = (candidacy: Candidacy & { candidacyStatuses: CandidaciesStatus[], certification: Certification; organism: Organism | null; firstname: string | undefined, lastname: string | undefined }) => {

    const statuses = candidacy.candidacyStatuses;
    const lastStatus = statuses.filter((status => status.isActive))[0];
    const sentStatus = statuses.filter((status => status.status == 'VALIDATION'))?.[0];
    const sentAt = sentStatus?.updatedAt || sentStatus?.createdAt;
    
    return {
        id: candidacy.id,
        deviceId: candidacy.deviceId,
        organismId: candidacy.organismId,
        organism: candidacy.organism,
        certificationId: candidacy.certification?.id,
        certification: candidacy.certification,
        firstname: candidacy.firstname,
        lastname: candidacy.lastname,
        email: candidacy.email,
        phone: candidacy.phone,
        lastStatus,
        createdAt: candidacy.createdAt,
        sentAt
    };
};    

const toDomainCandidacySummaries = (candidacies: (Candidacy & { candidacyStatuses: CandidaciesStatus[], certification: Certification; organism: Organism | null; firstname: string | undefined, lastname: string | undefined })[]): domain.CandidacySummary[] => {
    return candidacies.map(toDomainCandidacySummary);
};

export const insertCandidacy = async (params: { deviceId: string; certificationId: string; regionId: string; }): Promise<Either<string, domain.Candidacy>> => {
    try {
        const newCandidacy = await prismaClient.candidacy.create({
            data: {
                deviceId: params.deviceId,
                certificationsAndRegions: {
                    create: {
                        certificationId: params.certificationId,
                        regionId: params.regionId,
                        author: 'candidate',
                        isActive: true
                    }
                },
                candidacyStatuses: {
                    create: {
                        status: CandidacyStatus.PROJET,
                        isActive: true
                    }
                }
            },
            include: candidacyIncludes
        });

        return Right({ 
            id: newCandidacy.id,
            deviceId: newCandidacy.deviceId,
            regionId: newCandidacy.certificationsAndRegions[0].region.id,
            region: newCandidacy.certificationsAndRegions[0].region,
            certificationId: newCandidacy.certificationsAndRegions[0].certification.id,
            certification: newCandidacy.certificationsAndRegions[0].certification,
            experiences: toDomainExperiences(newCandidacy.experiences),
            goals: newCandidacy.goals,
            phone: newCandidacy.phone,
            email: newCandidacy.email,
            candidacyStatuses: newCandidacy.candidacyStatuses,
            createdAt: newCandidacy.createdAt
        });
    } catch (e) {
        return Left("error while creating candidacy");
    }
};

export const getCandidacyFromDeviceId = async (deviceId: string) => {
    try {
        const candidacy = await prismaClient.candidacy.findFirst({
            where: {
                deviceId: deviceId,
                candidacyStatuses: {
                    none: {
                        status: "ARCHIVE",
                        isActive: true
                    }
                }
            },
            include: candidacyIncludes
        });

        const certificationAndRegion = await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
            where: {
                candidacyId: candidacy?.id,
                isActive: true
            },
            include: {
                certification: true,
                region: true,
            }
        });

        if (!certificationAndRegion) {
            return Left(`error while retrieving the certification and region the device id ${deviceId}`);    
        }

        return Maybe.fromNullable(candidacy).map(c => ({ ...c, regionId: certificationAndRegion.region.id, region: certificationAndRegion.region, certificationId: certificationAndRegion.certification.id, certification: { ...certificationAndRegion.certification, codeRncp: certificationAndRegion.certification.rncpId } })).toEither(`Candidacy with deviceId ${deviceId} not found`);
    } catch (e) {
        return Left(`error while retrieving the candidacy with id ${deviceId}`);
    };
};

export const getCandidacyFromId = async (candidacyId: string) => {
    try {
        const candidacy = await prismaClient.candidacy.findUnique({
            where: {
                id: candidacyId
            },
            include: {
                ...candidacyIncludes,
                candidate: true
            }
        });

        const certificationAndRegion = await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
            where: {
                candidacyId: candidacy?.id,
                isActive: true
            },
            include: {
                certification: true,
                region: true
            } 
        });

        return Maybe.fromNullable(candidacy).map(c => ({ 
            ...c, 
            firstname: c.candidate?.firstname,
            lastname: c.candidate?.lastname,
            phone: c.candidate?.phone || c.phone,
            email: c.candidate?.email || c.email,
            regionId: certificationAndRegion?.region.id, 
            region: certificationAndRegion?.region, 
            certificationId: certificationAndRegion?.certification.id, 
            certification: certificationAndRegion && { 
                ...certificationAndRegion?.certification, 
                codeRncp: certificationAndRegion?.certification.rncpId 
            } 
        })).toEither(`Candidacy with deviceId ${candidacyId} not found`);
    } catch (e) {
        return Left(`error while retrieving the candidacy with id ${candidacyId}`);
    };
};

export const existsCandidacyWithActiveStatus = async (params: { candidacyId: string, status: CandidacyStatus; }) => {
    try {
        const candidaciesCount = await prismaClient.candidacy.count({
            where: {
                id: params.candidacyId,
                candidacyStatuses: {
                    some: {
                        status: params.status,
                        isActive: true
                    }
                }
            }
        });

        return Right(candidaciesCount === 1);
    } catch (e) {
        return Left(`error while retrieving the candidacy with id ${params.candidacyId}`);
    };
};

// export const getCompanions = async () => {
//     try {x
//         const companions = await prismaClient.companion.findMany();

//         return Right(companions);
//     } catch (e) {
//         return Left(`error while retrieving companions`);
//     };
// };


export const updateContactOnCandidacy = async (params: { candidacyId: string, email: string, phone: string; }) => {
    try {
        const newCandidacy = await prismaClient.candidacy.update({
            where: {
                id: params.candidacyId
            },
            data: {
                phone: params.phone,
                email: params.email
            },
            include: candidacyIncludes
        });

        const certificationAndRegion = await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
            where: {
                candidacyId: params.candidacyId,
                isActive: true
            },
            select: {
                certification: true,
                region: true
            }
        });

        return Right({ 
            id: newCandidacy.id,
            deviceId: newCandidacy.deviceId,
            regionId: certificationAndRegion?.region.id,
            region: certificationAndRegion?.region,
            certificationId: certificationAndRegion?.certification.id,
            certification: certificationAndRegion?.certification,
            organismId: newCandidacy.organismId,
            experiences: toDomainExperiences(newCandidacy.experiences),
            goals: newCandidacy.goals,
            email: newCandidacy.email,
            phone: newCandidacy.phone,
            candidacyStatuses: newCandidacy.candidacyStatuses,
            createdAt: newCandidacy.createdAt
        });
    } catch (e) {
        return Left(`error while updating contact on candidacy ${params.candidacyId}`);
    };
};

export const updateCandidacyStatus = async (params: { candidacyId: string, status: CandidacyStatus; }) => {
    try {
        const [, newCandidacy, certificationAndRegion] = await prismaClient.$transaction([
            prismaClient.candidaciesStatus.updateMany({
                where: {
                    candidacyId: params.candidacyId
                },
                data: {
                    isActive: false
                }
            }),
            prismaClient.candidacy.update({
                where: {
                    id: params.candidacyId
                },
                data: {
                    candidacyStatuses: {
                        create: {
                            status: params.status,
                            isActive: true
                        }
                    }
                },
                include: {
                    ...candidacyIncludes,
                    candidate: true
                }
            }),
            prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
                where: {
                    candidacyId: params.candidacyId,
                    isActive: true
                },
                include: {
                    certification: true,
                    region: true
                }
            })
        ]);


        return Right({ 
            id: newCandidacy.id,
            deviceId: newCandidacy.deviceId,
            regionId: certificationAndRegion?.region.id,
            region: certificationAndRegion?.region,
            certificationId: certificationAndRegion?.certificationId,
            certification: { ...certificationAndRegion?.certification, codeRncp: certificationAndRegion?.certification.rncpId },
            organismId: newCandidacy.organismId,
            experiences: toDomainExperiences(newCandidacy.experiences),
            goals: newCandidacy.goals,
            phone: newCandidacy.candidate?.phone || newCandidacy.phone,
            email: newCandidacy.candidate?.email || newCandidacy.email,
            candidacyStatuses: newCandidacy.candidacyStatuses,
            createdAt: newCandidacy.createdAt
        });
    } catch (e) {
        return Left(`error while updating status on candidacy ${params.candidacyId}`);
    };
};

export const updateCertification = async (params: { candidacyId: string, certificationId: string; regionId: string; author: string; }) => {
    try {
        const [, newCandidacy, certificationAndRegion] = await prismaClient.$transaction([
            prismaClient.candidaciesOnRegionsAndCertifications.updateMany({
                data: {
                    isActive: false
                },
                where: {
                    candidacyId: params.candidacyId,
                    isActive: true
                }
            }),
            prismaClient.candidacy.update({
                where: {
                    id: params.candidacyId
                },
                data: {
                    certificationsAndRegions: {
                        create: {
                            certificationId: params.certificationId,
                            regionId: params.regionId,
                            author: params.author,
                            isActive: true
                        }
                    }
                },
                include: {
                    ...candidacyIncludes,
                    candidate: true
                }
            }),

            prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
                where: {
                    candidacyId: params.candidacyId,
                    isActive: true
                }, 
                select: {
                    certification: true,
                    region: true,
                }
            })
        ]);


        return Right({ 
            id: newCandidacy.id,
            deviceId: newCandidacy.deviceId,
            regionId: certificationAndRegion?.region.id,
            region: certificationAndRegion?.region,
            certificationId: certificationAndRegion?.certification.id,
            certification: certificationAndRegion?.certification,
            organismId: newCandidacy.organismId,
            experiences: toDomainExperiences(newCandidacy.experiences),
            goals: newCandidacy.goals,
            phone: newCandidacy.candidate?.phone || newCandidacy.phone,
            email: newCandidacy.candidate?.email || newCandidacy.email,
            candidacyStatuses: newCandidacy.candidacyStatuses,
            createdAt: newCandidacy.createdAt
        });
    } catch (e) {
        return Left(`error while updating certification on candidacy ${params.candidacyId}`);
    };
};

export const deleteCandidacyFromPhone = async (phone: string) => {
    try {

        const { count } = await prismaClient.candidacy.deleteMany({
            where: {
                phone: phone
            },
        });

        if (count === 0) {
            return Right(`Candidature non trouvée.`);
        } else {
            return Right(`Candidature supprimée `);
        }

    }
    catch (e) {
        return Left(`Candidature non supprimée, ${(e as any).message}`);
    }
};

export const deleteCandidacyFromEmail = async (email: string) => {
    try {

        const { count } = await prismaClient.candidacy.deleteMany({
            where: {
                email: email
            },
        });

        if (count === 0) {
            return Right(`Candidature non trouvée.`);
        } else {
            return Right(`Candidature supprimée `);
        }

    }
    catch (e) {
        return Left(`Candidature non supprimée, ${(e as any).message}`);
    }
};

export const deleteCandidacyFromId = async (id: string) => {
    try {

        const { count } = await prismaClient.candidacy.deleteMany({
            where: {
                id: id,
                candidacyStatuses: {
                    some: {
                        status: 'ARCHIVE',
                        isActive: true
                    }
                }
            },
        });

        if (count === 0) {
            return Right(`Candidature non trouvée.`);
        } else {
            return Right(`Candidature supprimée `);
        }

    }
    catch (e) {
        return Left(`Candidature non supprimée, ${(e as any).message}`);
    }
};
    
export const getCandidacies = async () => {
    try {
        const candidacies = await prismaClient.candidacy.findMany({
            include: {
                candidacyStatuses: true,
                certificationsAndRegions: {
                    select: {
                        certification: true
                    },
                    where: {
                        isActive: true
                    }
                },
                candidate: true,
                organism: true
            }
        });

        return Right(toDomainCandidacySummaries(candidacies.map(c => ({
            ...c, 
            certification: c.certificationsAndRegions[0]?.certification,
            firstname: c.candidate?.firstname,
            lastname: c.candidate?.lastname,
            phone: c.candidate?.phone || c.phone,
            email: c.candidate?.email || c.email,
        }))));
    }
    catch (e) {
        console.log('error', e);
        return Left(`Erreur lors de la récupération des candidatures, ${(e as any).message}`);
    }
};

export const getCandidaciesForUser = async (keycloakId: string) => {
    if (!keycloakId) {
        return Left(`Erreur lors de la récupération des candidatures, identifiant null`);
    }
    
    try {
        const candidacies = await prismaClient.candidacy.findMany({
            where: {
                organism: {
                    accounts: {
                        some: {
                            keycloakId: keycloakId
                        }
                    }
                }
            },
            include: {
                candidacyStatuses: true,
                certificationsAndRegions: {
                    select: {
                        certification: true
                    },
                    where: {
                        isActive: true
                    }
                },
                candidate: true,
                organism: true
            }
        });

        return Right(toDomainCandidacySummaries(candidacies.map(c => ({
            ...c, 
            certification: c.certificationsAndRegions[0]?.certification,
            firstname: c.candidate?.firstname,
            lastname: c.candidate?.lastname,
            phone: c.candidate?.phone || c.phone,
            email: c.candidate?.email || c.email,
        }))));
    }
    catch (e) {
        console.log(e);
        return Left(`Erreur lors de la récupération des candidatures, ${(e as any).message}`);
    }
};

export const updateAppointmentInformations = async (params: {
    candidacyId: string;
    candidateTypologyInformations: {
        typology: CandidateTypology;
        additionalInformation: string;
    },
    appointmentInformations: {
        firstAppointmentOccuredAt: Date;
        appointmentCount: number;
        wasPresentAtFirstAppointment: boolean;
    },
}) => {
    try {
        const candidacy = await prismaClient.candidacy.update({
            where: {
                id: params.candidacyId,
            },
            data: {
                typology: params.candidateTypologyInformations.typology,
                typologyAdditional: params.candidateTypologyInformations.additionalInformation,
                firstAppointmentOccuredAt: params.appointmentInformations.firstAppointmentOccuredAt,
                appointmentCount: params.appointmentInformations.appointmentCount,
                wasPresentAtFirstAppointment: params.appointmentInformations.wasPresentAtFirstAppointment
            },
            include: {
                ...candidacyIncludes,
                candidate: true
            }
        });

        const candidaciesOnRegionsAndCertifications = await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
            where: {
                candidacyId: params.candidacyId,
                isActive: true
            },
            select: {
                certification: true,
                region: true,
            }
        });

        return Right({ 
            id: candidacy.id,
            deviceId: candidacy.deviceId,
            regionId: candidaciesOnRegionsAndCertifications?.region.id,
            region: candidaciesOnRegionsAndCertifications?.region,
            certificationId: candidaciesOnRegionsAndCertifications?.certification.id,
            certification: candidaciesOnRegionsAndCertifications?.certification,
            organismId: candidacy.organismId,
            experiences: toDomainExperiences(candidacy.experiences),
            goals: candidacy.goals,
            phone: candidacy.candidate?.phone || candidacy.phone,
            email: candidacy.candidate?.email || candidacy.email,
            typology: candidacy.typology,
            typologyAdditional: candidacy.typologyAdditional,
            firstAppointmentOccuredAt: candidacy.firstAppointmentOccuredAt,
            appointmentCount: candidacy.appointmentCount,
            wasPresentAtFirstAppointment: candidacy.wasPresentAtFirstAppointment,
            candidacyStatuses: candidacy.candidacyStatuses,
            createdAt: candidacy.createdAt
        });
    }
    catch (e) {
        return Left(`Erreur lors de la mise à jour des informations de rendez de la candidature, ${(e as any).message}`);
    }
};

export const updateOrganism = async (params: { candidacyId: string, organismId: string; }) => {
    try {
        const newCandidacy = await prismaClient.candidacy.update({
            where: {
                id: params.candidacyId
            },
            data: {
                organismId: params.organismId,
            },
            include: {
                ...candidacyIncludes,
                candidate: true
            }
        });

        const certificationAndRegion = await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
            where: {
                candidacyId: params.candidacyId,
                isActive: true
            },
            select: {
                certification: true,
                region: true,
            }
        });

        return Right({ 
            id: newCandidacy.id,
            deviceId: newCandidacy.deviceId,
            regionId: certificationAndRegion?.region.id,
            region: certificationAndRegion?.region,
            certificationId: certificationAndRegion?.certification.id,
            certification: certificationAndRegion?.certification,
            organismId: newCandidacy.organismId,
            experiences: toDomainExperiences(newCandidacy.experiences),
            goals: newCandidacy.goals,
            phone: newCandidacy.candidate?.phone || newCandidacy.phone,
            email: newCandidacy.candidate?.email || newCandidacy.email,
            candidacyStatuses: newCandidacy.candidacyStatuses,
            createdAt: newCandidacy.createdAt
        });
    } catch (e) {
        return Left(`error while updating contact on candidacy ${params.candidacyId}`);
    };
};

export const updateTrainingInformations = async (params: {
    candidacyId: string;
    training: {
        basicSkillIds: string[];
        mandatoryTrainingIds: string[];
        certificateSkills: string;
        otherTraining: string;
        individualHourCount: number;
        collectiveHourCount: number;
        additionalHourCount: number;
        validatedByCandidate: boolean;
    };
}) => {
    try {

        const [, , , , newCandidacy] = await prismaClient.$transaction([
            prismaClient.basicSkillOnCandidacies.deleteMany({
                where: {
                    candidacyId: params.candidacyId
                }
            }),
            prismaClient.basicSkillOnCandidacies.createMany({
                data: params.training.basicSkillIds.map(id => ({
                    candidacyId: params.candidacyId,
                    basicSkillId: id
                }))
            }),
            prismaClient.trainingOnCandidacies.deleteMany({
                where: {
                    candidacyId: params.candidacyId
                }
            }),
            prismaClient.trainingOnCandidacies.createMany({
                data: params.training.mandatoryTrainingIds.map(id => ({
                    candidacyId: params.candidacyId,
                    trainingId: id
                }))
            }),
            prismaClient.candidacy.update({
                where: {
                    id: params.candidacyId
                },
                data: {
                    certificateSkills: params.training.certificateSkills,
                    otherTraining: params.training.otherTraining,
                    individualHourCount: params.training.individualHourCount,
                    collectiveHourCount: params.training.collectiveHourCount,
                    additionalHourCount: params.training.additionalHourCount,
                    validatedByCandidate: params.training.validatedByCandidate
                },
                include: {
                    ...candidacyIncludes,
                    candidate: true
                }
            })
        ]);

        const certificationAndRegion = await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
            where: {
                candidacyId: params.candidacyId,
                isActive: true
            },
            select: {
                certification: true,
                region: true,
            }
        });

        return Right({ 
            id: newCandidacy.id,
            deviceId: newCandidacy.deviceId,
            regionId: certificationAndRegion?.region.id,
            region: certificationAndRegion?.region,
            certificationId: certificationAndRegion?.certification.id,
            certification: certificationAndRegion?.certification,
            organismId: newCandidacy.organismId,
            experiences: toDomainExperiences(newCandidacy.experiences),
            goals: newCandidacy.goals,
            phone: newCandidacy.candidate?.phone || newCandidacy.phone,
            email: newCandidacy.candidate?.email || newCandidacy.email,
            candidacyStatuses: newCandidacy.candidacyStatuses,
            createdAt: newCandidacy.createdAt
        });;
    } catch (e) {
        return Left(`error while updating training informations on candidacy ${params.candidacyId}`);
    }
}
