module Api.Form.DropOut exposing (..)

import Admin.InputObject exposing (DropOutInput)
import Admin.Mutation as Mutation
import Admin.Scalar exposing (Uuid(..))
import Api.Auth as Auth
import Api.Token exposing (Token)
import Data.Candidacy exposing (CandidacyId)
import Data.Form.DropOut
import Data.Referential
import Dict exposing (Dict)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet
import RemoteData exposing (RemoteData)


dropOut :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData String () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> Dict String String
    -> Cmd msg
dropOut candidacyId endpointGraphql token toMsg ( _, referential ) dict =
    let
        dropOutData =
            Data.Form.DropOut.fromDict referential.dropOutReasons dict

        dropOutReasonContent =
            if dropOutData.otherReasonContent == "" then
                Null

            else
                Present dropOutData.otherReasonContent

        dropOutInput =
            DropOutInput
                dropOutData.droppedOutAt
                (Uuid dropOutData.dropOutReason)
                dropOutReasonContent

        id =
            Data.Candidacy.candidacyIdToString candidacyId
    in
    Mutation.candidacy_dropOut (Mutation.CandidacyDropOutRequiredArguments (Uuid id) dropOutInput) (SelectionSet.succeed ())
        |> Auth.makeMutation endpointGraphql token toMsg
