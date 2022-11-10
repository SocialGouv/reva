import { Either, Left, Right } from "purify-ts";
import * as domain from '../../../domain/types/candidacy';
import { prismaClient } from "./client";

export const getRegions = async (): Promise<Either<string, domain.Region[]>> => {
    try {
        const regions = await prismaClient.region.findMany({
            include: {
                departments: true
            }
        });

        return Right(regions);
    } catch (e) {
        return Left(`error while retrieving regions`);
    };
};

export const getDepartments = async (): Promise<Either<string, domain.Department[]>> => {
    try {
        const deparments = await prismaClient.department.findMany();

        return Right(deparments);
    } catch (e) {
        return Left(`error while retrieving deparments`);
    };
};