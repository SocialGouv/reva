module Api.Degree exposing (selection)

import Admin.Object
import Admin.Object.Degree
import Admin.Scalar exposing (Id(..))
import Data.Candidate
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)


selection : SelectionSet Data.Candidate.Degree Admin.Object.Degree
selection =
    SelectionSet.succeed Data.Candidate.Degree
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.Degree.id)
        |> with Admin.Object.Degree.code
        |> with Admin.Object.Degree.label
        |> with Admin.Object.Degree.longLabel
        |> with Admin.Object.Degree.level
