import { CandicadiesOnGoals, CandidaciesStatus, Candidacy, CandidacyStatus, CandidateTypology, Certification, Experience, prisma } from '@prisma/client';
import { Either, EitherAsync, Left, Maybe, Right } from 'purify-ts';
import * as domain from '../../../domain/types/candidacy';
import { prismaClient } from './client';
import { toDomainExperiences } from './experiences';
 


const toDomainCandidacy = (candidacy: Candidacy & { candidacyStatuses: CandidaciesStatus[], certification: Certification; }) => ({
    id: candidacy.id,
    deviceId: candidacy.deviceId,
    certificationId: candidacy.certificationId,
    certification: candidacy.certification,
    companionId: candidacy.companionId,
    email: candidacy.email,
    phone: candidacy.phone,
    lastStatus: candidacy.candidacyStatuses[0],
    createdAt: candidacy.createdAt
});    

const toDomainCandidacies = (candidacies: (Candidacy & { candidacyStatuses: CandidaciesStatus[], certification: Certification; })[]): domain.CandidacySummary[] => {
    return candidacies.map(toDomainCandidacy);
};

export const insertCandidacy = async (params: { deviceId: string; certificationId: string; }): Promise<Either<string, domain.Candidacy>> => {
    try {

        const newCandidacy = await prismaClient.candidacy.create({
            data: {
                deviceId: params.deviceId,
                certificationId: params.certificationId,
                candidacyStatuses: {
                    create: {
                        status: CandidacyStatus.PROJET,
                        isActive: true
                    }
                }
            },
            include: {
                experiences: true,
                goals: true,
                candidacyStatuses: true
            }
        });

        return Right({ 
            id: newCandidacy.id,
            deviceId: newCandidacy.deviceId,
            certificationId: newCandidacy.certificationId,
            companionId: newCandidacy.companionId,
            experiences: toDomainExperiences(newCandidacy.experiences),
            goals: newCandidacy.goals,
            phone: newCandidacy.phone,
            email: newCandidacy.email,
            candidacyStatuses: newCandidacy.candidacyStatuses,
            createdAt: newCandidacy.createdAt
        });
    } catch (e) {
        console.log(e);
        return Left("error while creating candidacy");
    }
};

export const getCompanionFromId = async (companionId: string): Promise<Either<string, domain.Companion>> => {
    try {
        const companion = await prismaClient.companion.findFirst({
            where: {
                id: companionId
            }
        });

        return Maybe.fromNullable(companion).toEither(`Companion with id ${companionId} not found`);
    } catch (e) {
        return Left(`error while retrieving the companion with id ${companionId}`);
    };
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
            include: {
                experiences: true,
                goals: true,
                certification: true,
                candidacyStatuses: true
            }
        });

        return Maybe.fromNullable(candidacy).map(c => ({ ...c, certification: { ...c.certification, codeRncp: c.certification.rncpId } })).toEither(`Candidacy with deviceId ${deviceId} not found`);
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
                experiences: true,
                goals: true,
                candidacyStatuses: true,
                certification: true
            }
        });

        return Maybe.fromNullable(candidacy).map(c => ({ ...c, certification: { ...c.certification, codeRncp: c.certification.rncpId } })).toEither(`Candidacy with deviceId ${candidacyId} not found`);
    } catch (e) {
        return Left(`error while retrieving the candidacy with id ${candidacyId}`);
    };
};

export const existsCandidacyWithActiveStatus = async (params: {candidacyId: string, status: CandidacyStatus}) => {
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

        return Right(candidaciesCount === 1)
    } catch (e) {
        return Left(`error while retrieving the candidacy with id ${params.candidacyId}`);
    };
};

export const getCompanions = async () => {
    try {
        const companions = await prismaClient.companion.findMany();

        return Right(companions);
    } catch (e) {
        return Left(`error while retrieving companions`);
    };
};


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
            include: {
                experiences: true,
                goals: true,
                candidacyStatuses: true
            }
        });

        return Right({ 
            id: newCandidacy.id,
            deviceId: newCandidacy.deviceId,
            certificationId: newCandidacy.certificationId,
            companionId: newCandidacy.companionId,
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
        const [, newCandidacy] = await prismaClient.$transaction([
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
                    experiences: true,
                    goals: true,
                    candidacyStatuses: true,
                    certification: true
                }
            })
        ]);

        return Right({ 
            id: newCandidacy.id,
            deviceId: newCandidacy.deviceId,
            certificationId: newCandidacy.certificationId,
            certification: { ...newCandidacy.certification, codeRncp: newCandidacy.certification.rncpId },
            companionId: newCandidacy.companionId,
            experiences: toDomainExperiences(newCandidacy.experiences),
            goals: newCandidacy.goals,
            email: newCandidacy.email,
            phone: newCandidacy.phone,
            candidacyStatuses: newCandidacy.candidacyStatuses,
            createdAt: newCandidacy.createdAt
        });
    } catch (e) {
        return Left(`error while updating status on candidacy ${params.candidacyId}`);
    };
};

export const updateCertification = async (params: { candidacyId: string, certificationId: string; }) => {
    try {
        const newCandidacy = await prismaClient.candidacy.update({
            where: {
                id: params.candidacyId
            },
            data: {
                certification: {
                    connect: {
                        id: params.certificationId
                    }
                }
            },
            include: {
                experiences: true,
                goals: true,
                candidacyStatuses: true
            }
        });

        return Right({ 
            id: newCandidacy.id,
            deviceId: newCandidacy.deviceId,
            certificationId: newCandidacy.certificationId,
            companionId: newCandidacy.companionId,
            experiences: toDomainExperiences(newCandidacy.experiences),
            goals: newCandidacy.goals,
            email: newCandidacy.email,
            phone: newCandidacy.phone,
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
            return Right(`Candidature non trouv??e.`);
        } else {
            return Right(`Candidature supprim??e `);
        }

    }
    catch (e) {
        console.log(e);
        return Left(`Candidature non supprim??e, ${(e as any).message}`);
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
            return Right(`Candidature non trouv??e.`);
        } else {
            return Right(`Candidature supprim??e `);
        }

    }
    catch (e) {
        return Left(`Candidature non supprim??e, ${(e as any).message}`);
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
            return Right(`Candidature non trouv??e.`);
        } else {
            return Right(`Candidature supprim??e `);
        }

    }
    catch (e) {
        return Left(`Candidature non supprim??e, ${(e as any).message}`);
    }
};
    
export const getCandidacies = async () => {
    try {
        const candidacies = await prismaClient.candidacy.findMany({
            include: {
                candidacyStatuses: {
                    where: {
                        isActive: true
                    }
                },
                certification: true
            }
        });

        return Right(toDomainCandidacies(candidacies));
    }
    catch (e) {
        return Left(`Erreur lors de la r??cup??ration des candidatures, ${(e as any).message}`);
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
                experiences: true,
                goals: true,
                candidacyStatuses: true
            }
        });

        return Right({ 
            id: candidacy.id,
            deviceId: candidacy.deviceId,
            certificationId: candidacy.certificationId,
            companionId: candidacy.companionId,
            experiences: toDomainExperiences(candidacy.experiences),
            goals: candidacy.goals,
            email: candidacy.email,
            phone: candidacy.phone,
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
        return Left(`Erreur lors de la mise ?? jour des informations de rendez de la candidature, ${(e as any).message}`);
    }
}