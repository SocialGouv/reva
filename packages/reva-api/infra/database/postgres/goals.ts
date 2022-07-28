import { Goal } from "@prisma/client";
import { Either, Left, Maybe, Right } from "purify-ts";
import * as domain from '../../../domain/types/candidacy';
import { prismaClient } from "./client";

export const getGoals = async (): Promise<Either<string, Goal[]>> => {
    try {
        const goals = await prismaClient.goal.findMany({
            where: {
                isActive: true
            }
        });

        return Right(goals);
    } catch (e) {
        return Left(`error while retrieving goals`);
    };
};

export const updateGoals = async (params: {
    candidacyId: string;
    goals: domain.Goal[];
}) => {
    try {
        const [, goals] = await prismaClient.$transaction([
            prismaClient.candicadiesOnGoals.deleteMany({
                where: {
                    candidacyId: params.candidacyId
                }
            }),
            prismaClient.candicadiesOnGoals.createMany({
                data: params.goals.map(goal => ({
                    candidacyId: params.candidacyId,
                    goalId: goal.goalId
                    ,
                }))
            
            })
        ]);

        return Right(goals.count);
    } catch (e) {
        return Left(`error while retrieving goals`);
    };
}