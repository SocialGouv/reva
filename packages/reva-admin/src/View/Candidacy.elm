module View.Candidacy exposing (view, viewCreatedAt, viewSentAt)

import Admin.Enum.Duration exposing (Duration(..))
import Api.Form.FundingRequest exposing (create)
import Api.Token
import BetaGouv.DSFR.Button as Button
import Data.Candidacy exposing (Candidacy, CandidacyExperience, CandidacyGoal, CandidacyStatus, DateWithLabels, isCandidacyArchived, isCandidacyReoriented)
import Data.Context exposing (Context)
import Data.Organism exposing (Organism)
import Data.Referential exposing (Department, Referential)
import Dict
import Html exposing (Html, a, button, dd, div, dl, dt, h3, h4, li, nav, p, span, text, ul)
import Html.Attributes exposing (attribute, class, classList, href, type_)
import Html.Events exposing (onClick)
import RemoteData exposing (RemoteData(..))
import Route
import Time
import View.Candidacy.Tab exposing (Value(..))
import View.Date
import View.Helpers exposing (dataTest)
import View.Icons as Icons


view :
    Context
    ->
        { a
            | candidacy : Candidacy
            , referential : RemoteData String Referential
        }
    -> List (Html msg)
view context config =
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
        [ class "mt-4 mb-8 text-gray-900" ]
        [ dl
            []
            [ case ( config.candidacy.firstname, config.candidacy.lastname ) of
                ( Just firstname, Just lastname ) ->
                    viewInfo
                        "firstname lastname"
                        "Prénom Nom"
                    <|
                        div
                            [ class "text-3xl font-bold mb-10" ]
                            [ text <| firstname ++ " " ++ lastname
                            ]

                _ ->
                    text ""
            , viewInfo
                "certification-label"
                "certification"
              <|
                div
                    [ class "text-xl font-bold leading-none text-gray-900 mb-5"
                    , classList [ ( "italic", config.candidacy.certification == Nothing ) ]
                    ]
                    [ Maybe.map .label config.candidacy.certification
                        |> Maybe.withDefault "Certification non sélectionnée"
                        |> text
                    ]
            , div
                [ class "bg-gray-100 px-5 py-4"
                , class "leading-relaxed"
                ]
                [ viewInfo "sent-at" "Date de candidature" <|
                    viewSentAt (Data.Candidacy.sentDate config.candidacy.statuses)
                , div [ class "flex space-x-2" ]
                    [ viewDepartment config.candidacy.department
                    , config.candidacy.phone
                        |> Maybe.map (text >> viewInfo "phone-number" "Téléphone")
                        |> Maybe.withDefault (text "")
                    ]
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
            ]
        , div
            [ class "my-12" ]
            [ case config.referential of
                Success referential ->
                    viewGoals referential config.candidacy.goals

                Failure err ->
                    text err

                _ ->
                    text "..."
            , if Api.Token.isAdmin context.token then
                viewOrganism config.candidacy.organism

              else
                text ""
            , viewExperiences config.candidacy.experiences
            , if isCandidacyReoriented config.candidacy then
                text ""

              else if isCandidacyArchived config.candidacy then
                Button.new
                    { onClick = Nothing, label = "Restaurer la candidature" }
                    |> Button.linkButton
                        (Route.toString context.baseUrl
                            (Route.Candidacy <|
                                View.Candidacy.Tab.Tab config.candidacy.id Unarchive
                            )
                        )
                    |> Button.secondary
                    |> Button.view

              else
                Button.new
                    { onClick = Nothing, label = "Archiver la candidature" }
                    |> Button.linkButton
                        (Route.toString context.baseUrl
                            (Route.Candidacy <|
                                View.Candidacy.Tab.Tab config.candidacy.id Archive
                            )
                        )
                    |> Button.secondary
                    |> Button.view
            , if config.candidacy.dropOutDate == Nothing then
                Button.new { onClick = Nothing, label = "Déclarer l'abandon du candidat" }
                    |> Button.linkButton
                        (Route.toString context.baseUrl
                            (Route.Candidacy <|
                                View.Candidacy.Tab.Tab config.candidacy.id DropOut
                            )
                        )
                    |> Button.secondary
                    |> Button.withAttrs [ class "ml-3" ]
                    |> Button.view

              else
                text ""
            ]
        ]
    ]


viewInfo : String -> String -> Html msg -> Html msg
viewInfo dataTestId label value =
    div []
        [ dt [ class "hidden" ] [ text label ]
        , dd
            [ dataTest dataTestId ]
            [ value ]
        ]


title : String -> Html msg
title s =
    h3 [ class "text-xl font-bold mb-2" ] [ text s ]


viewDepartment : Maybe Department -> Html msg
viewDepartment maybeDepartment =
    maybeDepartment
        |> Maybe.map Data.Referential.departmentToString
        |> Maybe.map (text >> viewInfo "department" "Département")
        |> Maybe.map (\content -> div [ class "flex space-x-2" ] [ content, div [] [ text "-" ] ])
        |> Maybe.withDefault (text "")


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
    div [ class "px-5 py-4 bg-gray-100 leading-tight" ]
        [ h4 [ class "font-semibold mb-1 text-lg" ] [ text experience.title ]
        , p [ class "my-2" ] [ text "Démarrée en ", text <| View.Date.toFullFormat experience.startedAt ]
        , p [ class "font-bold my-2" ] [ text "Durée d'expérience ", viewDuration experience.duration ]
        , p [ class "italic mb-0" ] [ text "\"", text experience.description, text "\"" ]
        ]


viewGoals : Referential -> List CandidacyGoal -> Html msg
viewGoals referential candidacyGoals =
    div [ class "my-10" ]
        [ title "Mon objectif"
        , ul
            [ class "mb-4 px-5 py-4 bg-gray-100 leading-tight"
            , class "list-none"
            ]
          <|
            if List.isEmpty candidacyGoals then
                [ li [ class "italic opacity-50" ] [ text "Non renseigné" ] ]

            else
                List.map (viewGoal referential) candidacyGoals
        ]


viewOrganism : Maybe Organism -> Html msg
viewOrganism maybeOrganism =
    case maybeOrganism of
        Just organism ->
            div [ class "my-10" ]
                [ title "Mon architecte de parcours"
                , div
                    [ class "px-5 py-4 bg-gray-100" ]
                    [ p [ class "mb-0" ] [ text organism.label ]
                    , p [ class "mb-0" ] [ text organism.contactAdministrativeEmail ]
                    ]
                ]

        Nothing ->
            text ""


viewExperiences : List CandidacyExperience -> Html msg
viewExperiences experiences =
    div [ class "my-10" ]
        [ title "Mes expériences"
        , div [ class "space-y-4" ] <| List.map viewExperience experiences
        ]


viewSentAt : Maybe DateWithLabels -> Html msg
viewSentAt sentAt =
    div
        []
    <|
        case sentAt of
            Just date ->
                [ text "Candidature envoyée le "
                , text date.fullFormat
                ]

            Nothing ->
                []


viewCreatedAt : Time.Posix -> Html msg
viewCreatedAt createdAt =
    div
        []
        [ text "Candidature créée le "
        , text <| View.Date.toFullFormat createdAt
        ]
