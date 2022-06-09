module View.Candidacy exposing (view)

import Css exposing (height, px)
import Data.Candidacy exposing (Candidacy, CandidacyGoal)
import Data.Referential exposing (Referential)
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
        , class "flex-1 relative z-10 overflow-y-auto focus:outline-none xl:order-last"
        ]
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
        , article
            []
            [ div
                []
                [ div []
                    [ div
                        [ css [ height (px 88) ]
                        , class "w-full object-cover bg-gray-500"
                        ]
                        []
                    ]
                , div
                    [ class "max-w-2xl mx-auto px-4 sm:px-6 lg:px-8" ]
                    [ div
                        [ class "sm:-mt-10 sm:flex sm:items-end sm:space-x-5" ]
                        [ div
                            [ class "flex text-gray-400" ]
                            [ div
                                [ class "rounded-full bg-white" ]
                                [ Icons.userLarge ]
                            ]
                        ]
                    , div
                        [ class "mt-3 min-w-0 flex-1" ]
                        [ h1
                            [ class "text-2xl font-bold text-gray-900 truncate" ]
                            [ text config.candidacy.certification.label
                            ]
                        ]
                    ]
                ]
            , div
                [ class "my-6 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-gray-700" ]
                [ if List.isEmpty config.candidacy.goals then
                    text ""

                  else
                    case config.referential of
                        Success referential ->
                            viewGoals referential config.candidacy.goals

                        Failure err ->
                            text err

                        _ ->
                            text "..."
                , dl
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
                , div [ class "border-t mt-8 pt-8" ]
                    [ button
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
        [ dt
            [ class "text-sm font-medium text-gray-500" ]
            [ text label ]
        , dd
            [ dataTest dataTestId
            , class "mt-1 text-sm text-gray-900"
            ]
            [ value ]
        ]


viewGoals : Referential -> List CandidacyGoal -> Html msg
viewGoals referential goals =
    div [ class "text-purple-800" ]
        [ h3 [ class "font-bold mb-2 text-lg" ] [ text "Objectif" ]
        , ul
            [ class "mb-4 rounded-lg px-5 py-4 bg-purple-100 leading-tight" ]
          <|
            List.map viewGoal goals
        ]


viewGoal : CandidacyGoal -> Html msg
viewGoal goal =
    li [] [ text goal.goalId ]
