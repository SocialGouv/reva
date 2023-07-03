module Api.Form.DropOut exposing (..)

import Admin.InputObject exposing (DropOutInput)
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.Candidacy
import Admin.Object.CandidacyDropOut
import Admin.Object.DropOutReason
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Uuid(..))
import Api.Auth as Auth
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Candidacy exposing (CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.DropOut
import Data.Referential
import Dict exposing (Dict)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData)


get :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData (List String) (Dict String String) -> msg)
    -> Cmd msg
get candidacyId endpointGraphql token toMsg =
    let
        candidacyRequiredArgs =
            Query.GetCandidacyByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)
    in
    Query.getCandidacyById candidacyRequiredArgs selection
        |> Auth.makeQuery "getCandidacyDropOutDetails" endpointGraphql token (nothingToError "Cette candidature est introuvable" >> toMsg)


dropOut :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> FormData
    -> Cmd msg
dropOut candidacyId endpointGraphql token toMsg _ formData =
    let
        dropOutData =
            Data.Form.DropOut.fromDict formData

        dropOutReasonContent =
            if dropOutData.otherReasonContent == "" then
                Null

            else
                Present dropOutData.otherReasonContent

        dropOutInput =
            DropOutInput
                dropOutData.droppedOutAt
                (Uuid dropOutData.dropOutReasonId)
                dropOutReasonContent

        id =
            Data.Candidacy.candidacyIdToString candidacyId
    in
    Mutation.candidacy_dropOut (Mutation.CandidacyDropOutRequiredArguments (Uuid id) dropOutInput) (SelectionSet.succeed ())
        |> Auth.makeMutation "dropOutCandidacy" endpointGraphql token toMsg


selection : SelectionSet (Dict String String) Admin.Object.Candidacy
selection =
    let
        dropOutReasonIdSelection =
            SelectionSet.succeed identity
                |> with Admin.Object.DropOutReason.id

        dropOutSelection =
            SelectionSet.succeed Data.Form.DropOut.dropOut
                |> with (Admin.Object.CandidacyDropOut.dropOutReason dropOutReasonIdSelection)
                |> with Admin.Object.CandidacyDropOut.otherReasonContent
                |> with Admin.Object.CandidacyDropOut.droppedOutAt
    in
    SelectionSet.succeed identity
        |> with (Admin.Object.Candidacy.candidacyDropOut dropOutSelection)
        |> SelectionSet.withDefault Dict.empty
