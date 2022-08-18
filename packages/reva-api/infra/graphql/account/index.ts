import mercurius from "mercurius";
import { createAccount } from "../../../domain/features/createAccount";

export const resolvers = {
  Mutation: {
    account_createAccount: async (_: any, params: any, {app}: any) => {
      console.log("createAccount", app.keycloakAdmin)

      // const result = await createAccount({
      //   createAccountInIAM: () => {},
      //   createAccount: () => {},
      //   getAccountInIAMFromEmail: () => {}
      // })("");


      // // const result = await updateAppointmentInformations({
      // //   updateAppointmentInformations: candidacyDb.updateAppointmentInformations,
      // // })({
      // //   candidacyId: payload.candidacyId,
      // //   candidateTypologyInformations: payload.candidateTypologyInformations,
      // //   appointmentInformations: payload.appointmentInformations
      // // });

      // return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();


    },
   
  },
};
