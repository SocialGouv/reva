module Api.Form.ExamInfo exposing (get, update)

import Admin.InputObject
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.Candidacy
import Admin.Object.ExamInfo
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Candidacy exposing (CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.ExamInfo exposing (examInfo)
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
        examInfoRequiredArs =
            Query.GetCandidacyByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)
    in
    Query.getCandidacyById examInfoRequiredArs selection
        |> Auth.makeQuery endpointGraphql token (nothingToError "Cette candidature est introuvable" >> toMsg)


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
        examInfo =
            Data.Form.ExamInfo.fromDict formData

        examInfoInformation =
            Admin.InputObject.ExamInfoInput
                (examInfo.examResult
                    |> Maybe.map Present
                    |> Maybe.withDefault Absent
                )
                (examInfo.estimatedExamDate
                    |> Maybe.map Present
                    |> Maybe.withDefault Absent
                )
                (examInfo.actualExamDate
                    |> Maybe.map Present
                    |> Maybe.withDefault Absent
                )

        examInfoRequiredArgs =
            Mutation.CandidacyUpdateExamInfoRequiredArguments
                (Uuid <| Data.Candidacy.candidacyIdToString candidacyId)
                examInfoInformation
    in
    Mutation.candidacy_updateExamInfo examInfoRequiredArgs SelectionSet.empty
        |> Auth.makeMutation endpointGraphql token toMsg


selection : SelectionSet (Dict String String) Admin.Object.Candidacy
selection =
    SelectionSet.succeed Data.Form.ExamInfo.examInfo
        |> with (Admin.Object.Candidacy.examInfo Admin.Object.ExamInfo.estimatedExamDate)
        |> with (Admin.Object.Candidacy.examInfo Admin.Object.ExamInfo.actualExamDate)
        |> with (Admin.Object.Candidacy.examInfo Admin.Object.ExamInfo.examResult)
