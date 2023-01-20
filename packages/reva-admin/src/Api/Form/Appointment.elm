module Api.Form.Appointment exposing (get, update)

import Admin.InputObject
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.Candidacy
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Candidacy exposing (CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.Appointment
import Data.Referential
import Dict exposing (Dict)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


get :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData String (Dict String String) -> msg)
    -> Cmd msg
get candidacyId endpointGraphql token toMsg =
    let
        appointmentRequiredArs =
            Query.GetCandidacyByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)
    in
    Query.getCandidacyById appointmentRequiredArs selection
        |> Auth.makeQuery endpointGraphql token (nothingToError "Cette candidature est introuvable" >> toMsg)


update :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData String () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> FormData
    -> Cmd msg
update candidacyId endpointGraphql token toMsg _ formData =
    let
        appointment =
            Data.Form.Appointment.appointmentFromDict candidacyId formData

        typologyInformationInput =
            Admin.InputObject.CandidateTypologyInformationsInput
                appointment.typology
                (Present appointment.additionalInformation)

        appointmentInformation =
            Admin.InputObject.AppointmentInformationsInput
                (appointment.firstAppointmentOccurredAt
                    |> Maybe.map Present
                    |> Maybe.withDefault Absent
                )
                appointment.wasPresentAtFirstAppointment
                appointment.appointmentCount

        appointmentRequiredArs =
            Mutation.CandidacyUpdateAppointmentInformationsRequiredArguments
                (Id <| Data.Candidacy.candidacyIdToString appointment.candidacyId)
                typologyInformationInput
                appointmentInformation
    in
    Mutation.candidacy_updateAppointmentInformations appointmentRequiredArs SelectionSet.empty
        |> Auth.makeMutation endpointGraphql token toMsg


selection : SelectionSet (Dict String String) Admin.Object.Candidacy
selection =
    SelectionSet.succeed Data.Form.Appointment.appointment
        |> with Admin.Object.Candidacy.typology
        |> with Admin.Object.Candidacy.typologyAdditional
        |> with Admin.Object.Candidacy.firstAppointmentOccuredAt
        |> with Admin.Object.Candidacy.appointmentCount
        |> with Admin.Object.Candidacy.wasPresentAtFirstAppointment
