module Api.Referential exposing
    ( conventionCollectiveSelection
    , departmentSelection
    , departmentWithOrganismMethodsSelection
    , domainSelection
    , get
    )

import Admin.Object
import Admin.Object.BasicSkill
import Admin.Object.ConventionCollective
import Admin.Object.Department
import Admin.Object.DepartmentWithOrganismMethods
import Admin.Object.Domaine
import Admin.Object.DropOutReason
import Admin.Object.Goal
import Admin.Object.Referential
import Admin.Object.ReorientationReason
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
    SelectionSet.succeed Data.Referential.Referential
        |> with (Query.getBasicSkills basicSkillSelection)
        |> with (Query.getDegrees Api.Degree.selection)
        |> with (Query.getDropOutReasons dropOutReasonSelection)
        |> with (SelectionSet.map (\r -> r.goals) (Query.getReferential goalsSelection))
        |> with (Query.getTrainings trainingsSelection)
        |> with (Query.getReorientationReasons reorientationReasonSelection)
        |> with (Query.getVulnerabilityIndicators Api.VulnerabilityIndicator.selection)


basicSkillSelection : SelectionSet Data.Referential.BasicSkill Admin.Object.BasicSkill
basicSkillSelection =
    SelectionSet.succeed Data.Referential.BasicSkill
        |> with (SelectionSet.map (\(Uuid id) -> id) Admin.Object.BasicSkill.id)
        |> with Admin.Object.BasicSkill.label


dropOutReasonSelection : SelectionSet Data.Referential.BasicSkill Admin.Object.DropOutReason
dropOutReasonSelection =
    SelectionSet.succeed Data.Referential.DropOutReason
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.DropOutReason.id)
        |> with Admin.Object.DropOutReason.label


reorientationReasonSelection : SelectionSet Data.Referential.BasicSkill Admin.Object.ReorientationReason
reorientationReasonSelection =
    SelectionSet.succeed Data.Referential.ReorientationReason
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.ReorientationReason.id)
        |> with Admin.Object.ReorientationReason.label


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


departmentSelection : SelectionSet Data.Referential.Department Admin.Object.Department
departmentSelection =
    SelectionSet.succeed Data.Referential.Department
        |> with Admin.Object.Department.id
        |> with Admin.Object.Department.code
        |> with Admin.Object.Department.label


departmentWithOrganismMethodsSelection : SelectionSet Data.Referential.DepartmentWithOrganismMethods Admin.Object.DepartmentWithOrganismMethods
departmentWithOrganismMethodsSelection =
    SelectionSet.succeed Data.Referential.DepartmentWithOrganismMethods
        |> with (Admin.Object.DepartmentWithOrganismMethods.department departmentSelection)
        |> with Admin.Object.DepartmentWithOrganismMethods.isOnSite
        |> with Admin.Object.DepartmentWithOrganismMethods.isRemote


domainSelection : SelectionSet Data.Referential.Domain Admin.Object.Domaine
domainSelection =
    SelectionSet.succeed Data.Referential.Domain
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.Domaine.id)
        |> with Admin.Object.Domaine.code
        |> with Admin.Object.Domaine.label


conventionCollectiveSelection : SelectionSet Data.Referential.ConventionCollective Admin.Object.ConventionCollective
conventionCollectiveSelection =
    SelectionSet.succeed Data.Referential.ConventionCollective
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.ConventionCollective.id)
        |> with Admin.Object.ConventionCollective.code
        |> with Admin.Object.ConventionCollective.label
