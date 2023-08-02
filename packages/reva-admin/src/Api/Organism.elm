module Api.Organism exposing (selection)

import Admin.Object
import Admin.Object.Organism
import Admin.Scalar exposing (Uuid(..))
import Data.Organism
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)


selection : SelectionSet Data.Organism.Organism Admin.Object.Organism
selection =
    SelectionSet.succeed Data.Organism.Organism
        |> with (SelectionSet.map (\(Uuid id) -> id) Admin.Object.Organism.id)
        |> with Admin.Object.Organism.label
        |> with Admin.Object.Organism.address
        |> with Admin.Object.Organism.zip
        |> with Admin.Object.Organism.city
        |> with Admin.Object.Organism.contactAdministrativeEmail
        |> with Admin.Object.Organism.typology
