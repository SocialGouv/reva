module Api.Form.Admissibility exposing (get, update)

import Admin.InputObject
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.Admissibility
import Admin.Object.Candidacy
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Candidacy exposing (CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.Admissibility exposing (admissibility)
import Data.Referential
import Dict exposing (Dict)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


get :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData (List String) (Dict String String) -> msg)
    -> Cmd msg
get candidacyId endpointGraphql token toMsg =
    let
        admissibilityRequiredArs =
            Query.GetCandidacyByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)
    in
    Query.getCandidacyById admissibilityRequiredArs selection
        |> Auth.makeQuery "getCandidacyAdmissibility" endpointGraphql token (nothingToError "Cette candidature est introuvable" >> toMsg)


update :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> FormData
    -> Cmd msg
update candidacyId endpointGraphql token toMsg _ formData =
    let
        admissibility =
            Data.Form.Admissibility.fromDict formData

        maybeToOptional : Maybe a -> OptionalArgument a
        maybeToOptional arg =
            Maybe.map Present arg
                |> Maybe.withDefault Absent

        absentIfNotAdmissible : Maybe a -> OptionalArgument a
        absentIfNotAdmissible field =
            if admissibility.isCandidateAlreadyAdmissible then
                Absent

            else
                maybeToOptional field

        admissibilityInformation =
            Admin.InputObject.AdmissibilityInput
                admissibility.isCandidateAlreadyAdmissible
                (absentIfNotAdmissible admissibility.reportSentAt)
                (absentIfNotAdmissible admissibility.certifierRespondedAt)
                (absentIfNotAdmissible admissibility.responseAvailableToCandidateAt)
                (absentIfNotAdmissible admissibility.status)

        admissibilityRequiredArgs =
            Mutation.CandidacyUpdateAdmissibilityRequiredArguments
                (Uuid <| Data.Candidacy.candidacyIdToString candidacyId)
                admissibilityInformation
    in
    Mutation.candidacy_updateAdmissibility admissibilityRequiredArgs SelectionSet.empty
        |> Auth.makeMutation "updateCandidacyAdmissibility" endpointGraphql token toMsg


selection : SelectionSet (Dict String String) Admin.Object.Candidacy
selection =
    SelectionSet.succeed Data.Form.Admissibility.admissibility
        |> with (Admin.Object.Candidacy.admissibility Admin.Object.Admissibility.isCandidateAlreadyAdmissible)
        |> with (Admin.Object.Candidacy.admissibility Admin.Object.Admissibility.reportSentAt)
        |> with (Admin.Object.Candidacy.admissibility Admin.Object.Admissibility.certifierRespondedAt)
        |> with (Admin.Object.Candidacy.admissibility Admin.Object.Admissibility.responseAvailableToCandidateAt)
        |> with (Admin.Object.Candidacy.admissibility Admin.Object.Admissibility.status)
