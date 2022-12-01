import { Either, EitherAsync } from "purify-ts";

import {
  AppointmentInformations,
  Candidacy,
  CandidateTypology,
} from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface UpdateAppointmentInformations {
  updateAppointmentInformations: (params: {
    candidacyId: string;
    candidateTypologyInformations: {
      typology: CandidateTypology;
      additionalInformation: string;
    };
    appointmentInformations: AppointmentInformations;
  }) => Promise<Either<string, Candidacy>>;
}

export const updateAppointmentInformations =
  (deps: UpdateAppointmentInformations) =>
  (params: {
    candidacyId: string;
    candidateTypologyInformations: {
      typology: CandidateTypology;
      additionalInformation: string;
    };
    appointmentInformations: AppointmentInformations;
  }) => {
    const result = EitherAsync.fromPromise(() =>
      deps.updateAppointmentInformations(params)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.APPOINTMENT_INFORMATIONS_NOT_SAVED,
          `Erreur lors de l'enregistrement des informations de rendez-vous de la candidature ${params.candidacyId}`
        )
    );

    return result;
  };
