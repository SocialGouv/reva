module Api.Referential exposing (get)

import Admin.Object
import Admin.Object.BasicSkill
import Admin.Object.Goal
import Admin.Object.Referential
import Admin.Object.Training
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.Degree
import Api.Token exposing (Token)
import Api.VulnerabilityIndicator
import Data.Referential
import Dict exposing (Dict)
import Graphql.Operation
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


get :
    String
    -> Token
    -> (RemoteData String Data.Referential.Referential -> msg)
    -> Cmd msg
get endpointGraphql token toMsg =
    Auth.makeQuery endpointGraphql token toMsg selection


selection : SelectionSet Data.Referential.Referential Graphql.Operation.RootQuery
selection =
    SelectionSet.succeed
        (\basicSkills referentialGoals trainings ->
            Data.Referential.Referential basicSkills referentialGoals.goals trainings
        )
        |> with (Query.getBasicSkills basicSkillSelection)
        |> with (Query.getReferential goalsSelection)
        |> with (Query.getDegrees Api.Degree.selection)
        |> with (Query.getTrainings trainingsSelection)
        |> with (Query.getVulnerabilityIndicators Api.VulnerabilityIndicator.selection)


basicSkillSelection : SelectionSet Data.Referential.BasicSkill Admin.Object.BasicSkill
basicSkillSelection =
    SelectionSet.succeed Data.Referential.BasicSkill
        |> with (SelectionSet.map (\(Uuid id) -> id) Admin.Object.BasicSkill.id)
        |> with Admin.Object.BasicSkill.label


referentialGoalSelection : SelectionSet Data.Referential.ReferentialGoal Admin.Object.Goal
referentialGoalSelection =
    SelectionSet.succeed Data.Referential.ReferentialGoal
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.Goal.id)
        |> with Admin.Object.Goal.label
        |> with Admin.Object.Goal.order
        |> with Admin.Object.Goal.needsAdditionalInformation
        |> with Admin.Object.Goal.isActive


trainingsSelection : SelectionSet Data.Referential.MandatoryTraining Admin.Object.Training
trainingsSelection =
    SelectionSet.succeed Data.Referential.MandatoryTraining
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.Training.id)
        |> with Admin.Object.Training.label


toGoals : List Data.Referential.ReferentialGoal -> Data.Referential.ReferentialGoals
toGoals goals =
    let
        goalsDict =
            List.map (\g -> ( g.id, g )) goals |> Dict.fromList
    in
    { goals = goalsDict }


goalsSelection : SelectionSet Data.Referential.ReferentialGoals Admin.Object.Referential
goalsSelection =
    SelectionSet.succeed toGoals
        |> with (Admin.Object.Referential.goals referentialGoalSelection)
