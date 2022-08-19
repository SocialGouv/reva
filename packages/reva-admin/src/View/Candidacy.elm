module View.Candidacy exposing (Tab(..), view)

import Admin.Enum.Duration exposing (Duration(..))
import Data.Candidacy exposing (Candidacy, CandidacyExperience, CandidacyGoal, CandidacyId)
import Data.Referential exposing (Referential)
import Dict
import Html.Styled exposing (Html, a, article, button, dd, div, dl, dt, h1, h3, h4, li, nav, node, p, span, text, ul)
import Html.Styled.Attributes exposing (attribute, class, css, href, type_)
import Html.Styled.Events exposing (onClick)
import RemoteData exposing (RemoteData(..))
import View.Date as Date
import View.Helpers exposing (dataTest)
import View.Icons as Icons


type Tab
    = Empty
    | Meetings CandidacyId
    | Profil CandidacyId
    | Training CandidacyId


view :
    { a
        | candidacy : Candidacy
        , archiveMsg : Candidacy -> msg
        , deleteMsg : Candidacy -> msg
        , referential : RemoteData String Referential
    }
    -> List (Html msg)
view config =
    [ nav
        [ class "flex items-start px-4 pb-3 sm:px-6 lg:px-8 md:hidden", attribute "aria-label" "Breadcrumb" ]
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
            [ class "text-3xl font-medium text-gray-900 leading-none" ]
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
            , viewExperiences config.candidacy.experiences
            , button
                [ type_ "button"
                , class "shadow text-xs border border-gray-300 hover:bg-gray-50 text-gray-600 px-2 py-1 rounded"
                , onClick (config.archiveMsg config.candidacy)
                ]
                [ text "Archiver la candidature" ]
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


title : String -> Html msg
title s =
    h3 [ class "text-xl font-bold mb-2" ] [ text s ]


viewGoal : Referential -> CandidacyGoal -> Html msg
viewGoal referential candidacyGoal =
    case Dict.get candidacyGoal.goalId referential.goals of
        Just goal ->
            li [] [ text goal.label ]

        Nothing ->
            text ""


viewDuration : Duration -> Html msg
viewDuration duration =
    case duration of
        Unknown ->
            text "inconnue"

        LessThanOneYear ->
            text "de moins d'un an"

        BetweenOneAndThreeYears ->
            text "comprise entre 1 et 3 ans"

        MoreThanThreeYears ->
            text "de plus de 3 ans"

        MoreThanFiveYears ->
            text "de plus de 5 ans"

        MoreThanTenYears ->
            text "de plus de 10 ans"


viewExperience : CandidacyExperience -> Html msg
viewExperience experience =
    div [ class "rounded-lg px-5 py-4 bg-gray-100 text-base leading-tight" ]
        [ h4 [ class "font-semibold mb-2" ] [ text experience.title ]
        , p [ class "my-4" ] [ text "Démarrée en ", Date.view experience.startedAt ]
        , p [ class "font-bold my-4" ] [ text "Durée d'expérience ", viewDuration experience.duration ]
        , p [ class "italic" ] [ text "\"", text experience.description, text "\"" ]
        ]


viewGoals : Referential -> List CandidacyGoal -> Html msg
viewGoals referential candidacyGoals =
    div [ class "text-purple-800 my-10" ]
        [ title "Mon objectif"
        , ul
            [ class "mb-4 rounded-lg px-5 py-4 bg-purple-100 leading-tight"
            , class "text-lg"
            ]
          <|
            if List.isEmpty candidacyGoals then
                [ li [ class "italic opacity-50" ] [ text "Non renseigné" ] ]

            else
                List.map (viewGoal referential) candidacyGoals
        ]


viewExperiences : List CandidacyExperience -> Html msg
viewExperiences experiences =
    div [ class "text-gray-900 my-10" ]
        [ title "Mes expériences"
        , div [ class "space-y-4" ] <| List.map viewExperience experiences
        ]
