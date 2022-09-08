import { Left, Right } from 'purify-ts';
import { prismaClient } from './client';

export const createAccountProfile = async (params: { 
    email: string; 
    firstname: string; 
    lastname: string; 
    organismId: string;
    keycloakId: string;
}) => {
    try {

        const account = await prismaClient.account.create({
            data: {
                keycloakId: params.keycloakId,
                email: params.email,
                firstname: params.firstname,
                lastname: params.lastname,
                organismId: params.organismId
            }
        });

        return Right(account);
    } catch (e) {
        return Left("error while creating account");
    }
}