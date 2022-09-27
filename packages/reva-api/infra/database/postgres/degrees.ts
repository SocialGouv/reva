import { Either, Left, Right } from "purify-ts";
import * as domain from '../../../domain/types/candidacy';
import { prismaClient } from "./client";

export const getRegions = async (): Promise<Either<string, domain.Degree[]>> => {
    try {
        const degrees = await prismaClient.degree.findMany();

        return Right(degrees);
    } catch (e) {
        return Left(`error while retrieving degrees`);
    };
};