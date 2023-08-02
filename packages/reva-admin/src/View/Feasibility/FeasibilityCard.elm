module View.Feasibility.FeasibilityCard exposing (..)

import Admin.Scalar
import BetaGouv.DSFR.Button as Button
import Data.Context exposing (Context)
import Data.Feasibility exposing (FeasibilitySummary)
import Html exposing (Html, div, h3, li, p, text)
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
            [ class "flex flex-col border py-5 pl-6 pr-4 my-8" ]
            [ div [ class "grid grid-cols-2" ]
                [ h3 [ class "col-span-2 text-xl font-semibold truncate mb-2" ] [ text (Maybe.withDefault "" feasibilitySummary.certificationLabel) ]
                , div [ class "flex text-lg" ]
                    [ text (Maybe.withDefault "" feasibilitySummary.candidateFirstname ++ " " ++ Maybe.withDefault "" feasibilitySummary.candidatelastname)
                    ]
                , p [ class "text-lg mb-2" ] [ text (Maybe.withDefault "" feasibilitySummary.departmentLabel ++ " (" ++ Maybe.withDefault "" feasibilitySummary.departmentCode ++ ")") ]
                , p [ class "text-lg mb-2" ]
                    [ text <| "Dossier envoyé le " ++ View.Date.toSmallFormat feasibilitySummary.feasibilityFileSentAt
                    ]
                , div
                    [ class "col-span-2  mt-2 lg:ml-auto" ]
                    [ Button.new { onClick = Nothing, label = "Accéder au dossier" }
                        |> Button.linkButton (Route.toString context.baseUrl (Route.Feasibility (idToString feasibilitySummary.id)))
                        |> Button.withAttrs [ attribute "title" "Accéder au dossier" ]
                        |> Button.view
                    ]
                ]
            ]
        ]
