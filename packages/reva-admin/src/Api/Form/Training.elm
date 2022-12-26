module Api.Form.Training exposing (get, update)

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
import Data.Form.Training
import Data.Referential
import Dict exposing (Dict)
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
        trainingRequiredArs =
            Query.GetCandidacyByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)
    in
    Query.getCandidacyById trainingRequiredArs selection
        |> Auth.makeQuery endpointGraphql token (nothingToError "Cette candidature est introuvable" >> toMsg)


update :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData String () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> Dict String String
    -> Cmd msg
update candidacyId endpointGraphql token toMsg ( _, referential ) dict =
    let
        training =
            Data.Form.Training.fromDict referential.basicSkills referential.mandatoryTrainings dict

        trainingInformation =
            Admin.InputObject.TrainingInput
                training.certificateSkills
                training.otherTraining
                training.individualHourCount
                training.collectiveHourCount
                training.additionalHourCount
                True
                (List.map Uuid training.basicSkillsIds)
                (List.map Uuid training.mandatoryTrainingIds)
                training.isCertificationPartial

        trainingRequiredArgs =
            Mutation.CandidacySubmitTrainingFormRequiredArguments
                (Uuid <| Data.Candidacy.candidacyIdToString candidacyId)
                trainingInformation
    in
    Mutation.candidacy_submitTrainingForm trainingRequiredArgs SelectionSet.empty
        |> Auth.makeMutation endpointGraphql token toMsg


selection : SelectionSet (Dict String String) Admin.Object.Candidacy
selection =
    SelectionSet.succeed Data.Form.Training.training
        |> with Admin.Object.Candidacy.mandatoryTrainingIds
        |> with Admin.Object.Candidacy.basicSkillIds
        |> with Admin.Object.Candidacy.certificateSkills
        |> with Admin.Object.Candidacy.validatedByCandidate
        |> with Admin.Object.Candidacy.otherTraining
        |> with Admin.Object.Candidacy.individualHourCount
        |> with Admin.Object.Candidacy.collectiveHourCount
        |> with Admin.Object.Candidacy.additionalHourCount
        |> with Admin.Object.Candidacy.isCertificationPartial
