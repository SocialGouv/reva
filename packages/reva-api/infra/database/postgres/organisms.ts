import { Either, Left, Maybe, Right } from "purify-ts";
import * as domain from '../../../domain/types/candidacy';
import { prismaClient } from "./client";

export const getAAPOrganisms = async (params: { candidacyId: string; }): Promise<Either<string, domain.Organism[]>> => {
    try {

        const candidacy = await prismaClient.candidacy.findFirst({
            where: {
                id: params.candidacyId
            },
            include: {
                certificationsAndRegions:{
                    where: {
                        isActive: true
                    },
                    select: {
                        certificationId: true,
                        regionId: true
                    }
                }
            }
        })

        if (!candidacy) {
            return Right([])
        }

        const organisms = await prismaClient.organism.findMany({
            where: {
                regionsAndCertifications: {
                    some: {
                        certificationId: candidacy.certificationsAndRegions[0].certificationId,
                        regionId: candidacy.certificationsAndRegions[0].regionId,
                        isArchitect: true
                    }
                },
                isActive: true
            }
        })

        return Right(organisms);
    } catch (e) {
        return Left(`error while retrieving organisms`);
    };
};

export const getOrganismById = async (organismId: string) : Promise<Either<string, Maybe<domain.Organism>>> => {
    try {
        const organism = await prismaClient.organism.findFirst({
            where: {
                id: organismId
            }
        })

        return Right(Maybe.fromNullable(organism))
    } catch(e) {
        return Left(`error while retrieving organism ${organismId}`);
    }
}