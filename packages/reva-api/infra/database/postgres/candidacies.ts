import { Experience, prisma } from '@prisma/client';
import { Either, EitherAsync, Left, Maybe, Right } from 'purify-ts';
import * as domain from '../../../domains/candidacy';
import { prismaClient } from './client';
import { toDomainExperiences } from './experiences';
     
export const insertCandidacy = async (params: { deviceId: string; certificationId: string }): Promise<Either<string, domain.Candidacy>> => {
    try {

        const newCandidacy = await prismaClient.candidacy.create({
            data: {
                deviceId: params.deviceId,
                certificationId: params.certificationId
            },
            include: {
                experiences: true,
                goals: true
            }
        });

        return Right({ 
            id: newCandidacy.id,
            deviceId: newCandidacy.deviceId,
            certificationId: newCandidacy.certificationId,
            companionId: newCandidacy.companionId,
            experiences: toDomainExperiences(newCandidacy.experiences),
            goals: newCandidacy.goals
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
                goals: true
            }
        });

        console.log(candidacy)

        return Maybe.fromNullable(candidacy).toEither(`Candidacy with deviceId ${deviceId} not found`);
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
                goals: true
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