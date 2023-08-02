module Api.File exposing (selection)

import Admin.Object
import Admin.Object.File
import Data.File
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)


selection : SelectionSet Data.File.File Admin.Object.File
selection =
    SelectionSet.succeed Data.File.File
        |> with Admin.Object.File.name
        |> with Admin.Object.File.url
