module Api.Jury exposing (..)

import Admin.Object
import Admin.Object.Jury
import Data.Jury
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)


selection : SelectionSet Data.Jury.Jury Admin.Object.Jury
selection =
    SelectionSet.succeed Data.Jury.Jury
        |> with Admin.Object.Jury.dateOfSession
        |> with Admin.Object.Jury.timeOfSession
        |> with Admin.Object.Jury.addressOfSession
        |> with Admin.Object.Jury.informationOfSession
        |> with Admin.Object.Jury.informationOfResult
        |> with Admin.Object.Jury.isResultProvisional
        |> with Admin.Object.Jury.result
