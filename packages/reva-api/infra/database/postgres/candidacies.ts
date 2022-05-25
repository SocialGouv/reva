import { CandidacyStatus, Experience, prisma } from '@prisma/client';
import { Either, EitherAsync, Left, Maybe, Right } from 'purify-ts';
import * as domain from '../../../domains/candidacy';
import { prismaClient } from './client';
import { toDomainExperiences } from './experiences';
     
export const insertCandidacy = async (params: { deviceId: string; certificationId: string }): Promise<Either<string, domain.Candidacy>> => {
    try {

        const newCandidacy = await prismaClient.candidacy.create({
            data: {
                deviceId: params.deviceId,
                certificationId: params.certificationId,
                candidacyStatuses: {
                    create: {
                        status: CandidacyStatus.PROJET
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
        const candidacy = await prismaClient.candidacy.findUnique({
            where: {
                deviceId
            },
            include: {
                experiences: true,
                goals: true,
                certification: true,
                candidacyStatuses: true
            }
        });

        return Maybe.fromNullable(candidacy).map(c => ({...c, certification: {...c.certification, codeRncp: c.certification.rncpId} })).toEither(`Candidacy with deviceId ${deviceId} not found`);
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
                candidacyStatuses: true
            }
        });

        return Maybe.fromNullable(candidacy).toEither(`Candidacy with deviceId ${candidacyId} not found`);
    } catch (e) {
        return Left(`error while retrieving the candidacy with id ${candidacyId}`);
    };
};

export const getCompanions = async () => {
    try {
        const companions = await prismaClient.companion.findMany();

        return Right(companions);
    } catch (e) {
        return Left(`error while retrieving companions`);
    };
}


export const updateContactOnCandidacy = async (params: {candidacyId: string, email: string, phone : string}) => {
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
}

export const updateCandidacyStatus = async (params: {candidacyId: string, status: CandidacyStatus}) => {
    try {
        const newCandidacy = await prismaClient.candidacy.update({
            where: {
                id: params.candidacyId
            },
            data: {
                candidacyStatuses: {
                    create: {
                        status: params.status
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
        return Left(`error while updating status on candidacy ${params.candidacyId}`);
    };
}

export const updateCertification = async (params: {candidacyId: string, certificationId: string}) => {
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
}

export const deleteCandidacyFromPhone = async (phone: string) => {
    try {

        const {count } = await prismaClient.candidacy.deleteMany({
            where: {
                phone: phone
            },
        })

        if (count === 0) {
            return Right(`Candidature non trouvée.`);
        } else {
            return Right(`Candidature supprimée `);
        }

    }
    catch(e) {
        console.log(e)
        return Left(`Candidature non supprimée, ${(e as any).message}`);
    }

}
export const deleteCandidacyFromEmail = async (email: string) => {
    try {

        const {count } = await prismaClient.candidacy.deleteMany({
            where: {
                email: email
            },
        })

        if (count === 0) {
            return Right(`Candidature non trouvée.`);
        } else {
            return Right(`Candidature supprimée `);
        }

    }
    catch(e) {
        return Left(`Candidature non supprimée, ${(e as any).message}`);
    }
}