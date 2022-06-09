module View.Candidacy exposing (view)

import Css exposing (height, px)
import Data.Candidacy exposing (Candidacy, CandidacyGoal)
import Data.Referential exposing (Referential)
import Dict
import Html.Styled exposing (Html, a, article, button, dd, div, dl, dt, h1, h3, li, nav, node, p, span, text, ul)
import Html.Styled.Attributes exposing (attribute, class, css, href, type_)
import Html.Styled.Events exposing (onClick)
import RemoteData exposing (RemoteData(..))
import View.Helpers exposing (dataTest)
import View.Icons as Icons


view :
    { a
        | candidacy : Candidacy
        , deleteMsg : Candidacy -> msg
        , referential : RemoteData String Referential
    }
    -> Html msg
view config =
    node "main"
        [ dataTest "profile"
        , class "flex-1 relative z-10 overflow-y-auto focus:outline-none xl:order-last bg-gray-100"
        ]
        [ article
            [ class "max-w-2xl bg-white h-screen px-3 sm:px-6" ]
            [ nav
                [ class "flex items-start px-4 py-3 sm:px-6 lg:px-8 md:hidden", attribute "aria-label" "Breadcrumb" ]
                [ a
                    [ href "#", class "inline-flex items-center space-x-3 text-sm font-medium text-gray-900" ]
                    [ Icons.chevronLeft
                    , span
                        []
                        [ text "Candidatures" ]
                    ]
                ]
            , div
                [ class "pt-8" ]
                [ h1
                    [ class "text-2xl font-medium text-gray-900 leading-none" ]
                    [ text config.candidacy.certification.label
                    ]
                ]
            , div
                [ class "mt-2 mb-6 text-sm text-gray-700" ]
                [ dl
                    [ class "grid grid-cols-1 gap-x-4 gap-y-8 2xl:grid-cols-2" ]
                    [ config.candidacy.phone
                        |> Maybe.map (text >> viewInfo "phone-number" "Téléphone")
                        |> Maybe.withDefault (text "")
                    , config.candidacy.email
                        |> Maybe.map
                            (\email ->
                                a
                                    [ class "text-blue-500 hover:text-blue-600 truncate"
                                    , href ("mailto:" ++ email)
                                    ]
                                    [ text email ]
                                    |> viewInfo "email" "Email"
                            )
                        |> Maybe.withDefault (text "")
                    ]
                , div
                    [ class "my-12 mx-8" ]
                    [ case config.referential of
                        Success referential ->
                            viewGoals referential config.candidacy.goals

                        Failure err ->
                            text err

                        _ ->
                            text "..."
                    , button
                        [ type_ "button"
                        , class "shadow text-xs border border-gray-300 hover:bg-gray-50 text-gray-600 px-2 py-1 rounded"
                        , onClick (config.deleteMsg config.candidacy)
                        ]
                        [ text "Supprimer la candidature" ]
                    ]
                ]
            ]
        ]


viewInfo : String -> String -> Html msg -> Html msg
viewInfo dataTestId label value =
    div
        [ class "sm:col-span-1" ]
        [ dd
            [ dataTest dataTestId
            , class "mt-1 text-sm text-gray-900"
            ]
            [ value ]
        ]


viewGoals : Referential -> List CandidacyGoal -> Html msg
viewGoals referential candidacyGoals =
    div [ class "text-purple-800 my-6" ]
        [ h3 [ class "font-bold mb-2" ] [ text "Mon objectif" ]
        , ul
            [ class "mb-4 rounded-lg px-5 py-4 bg-purple-100 leading-tight" ]
          <|
            if List.isEmpty candidacyGoals then
                [ li [ class "italic opacity-50" ] [ text "Non renseigné" ] ]

            else
                List.map (viewGoal referential) candidacyGoals
        ]


viewGoal : Referential -> CandidacyGoal -> Html msg
viewGoal referential candidacyGoal =
    case Dict.get candidacyGoal.goalId referential.goals of
        Just goal ->
            li [] [ text goal.label ]

        Nothing ->
            text ""
