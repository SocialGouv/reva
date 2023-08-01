module View.Feasibility.FeasibilityCard exposing (..)

import Admin.Scalar
import Data.Context exposing (Context)
import Data.Feasibility exposing (FeasibilitySummary)
import Html exposing (Html, div, li, text)
import Html.Attributes exposing (attribute, class)
import View.Helpers exposing (dataTest)


view : Context -> FeasibilitySummary -> Html msg
view context feasibilitySummary =
    let
        idToString (Admin.Scalar.Id id) =
            id
    in
    li [ dataTest "directory-item", attribute "style" "--li-bottom:0" ]
        [ div
            [ class "border py-5 pl-6 pr-4 my-8" ]
            [ text (idToString feasibilitySummary.id) ]
        ]
