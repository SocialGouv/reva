import { Either, Left, Right } from "purify-ts";
import * as domain from '../../../domain/types/candidacy';
import { prismaClient } from "./client";

export const getBasicSkills = async (): Promise<Either<string, domain.BasicSkill[]>> => {
    try {
        const basicSkills = await prismaClient.basicSkill.findMany();

        return Right(basicSkills);
    } catch (e) {
        return Left(`error while retrieving basicSkills`);
    };
};