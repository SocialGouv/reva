module View.Feasibility.FeasibilityCard exposing (..)

import Admin.Scalar
import BetaGouv.DSFR.Button as Button
import Data.Context exposing (Context)
import Data.Feasibility exposing (FeasibilitySummary)
import Html exposing (Html, div, li, text)
import Html.Attributes exposing (attribute, class)
import Route
import View.Date
import View.Helpers exposing (dataTest)


view : Context -> FeasibilitySummary -> Html msg
view context feasibilitySummary =
    let
        idToString (Admin.Scalar.Id id) =
            id
    in
    li [ dataTest "directory-item", attribute "style" "--li-bottom:0" ]
        [ div
            [ class "flex flex-col border py-5 pl-6 pr-4 my-8 gap-4" ]
            [ text (idToString feasibilitySummary.id)
            , div
                []
                [ text "Dossier envoyé le "
                , text <| View.Date.toSmallFormat feasibilitySummary.feasibilityFileSentAt
                ]
            , div
                [ class "ml-0 lg:ml-auto" ]
                [ Button.new { onClick = Nothing, label = "Accéder au dossier" }
                    |> Button.linkButton (Route.toString context.baseUrl (Route.Feasibility (idToString feasibilitySummary.id)))
                    |> Button.withAttrs [ attribute "title" "Accéder au dossier" ]
                    |> Button.view
                ]
            ]
        ]
