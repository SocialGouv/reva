module View.Candidacy exposing (view, viewCreatedAt, viewSentAt)

import Accessibility exposing (h1, h2)
import Admin.Enum.Duration exposing (Duration(..))
import Api.Token
import BetaGouv.DSFR.Button as Button
import Data.Candidacy exposing (Candidacy, CandidacyExperience, CandidacyGoal, DateWithLabels, canDropoutCandidacy, isCandidacyArchived, isCandidacyReoriented)
import Data.Context exposing (Context)
import Data.Organism exposing (Organism)
import Data.Referential exposing (Department, Referential)
import Dict
import Html exposing (Html, a, dd, div, dl, dt, h4, li, p, text, ul)
import Html.Attributes exposing (class, classList, href)
import RemoteData exposing (RemoteData(..))
import Route
import Time
import View
import View.Candidacy.Tab exposing (Value(..))
import View.Date
import View.Helpers exposing (dataTest)


view :
    Context
    ->
        { a
            | candidacy : Candidacy
            , referential : RemoteData (List String) Referential
        }
    -> List (Html msg)
view context config =
    [ div
        [ class "mt-4 mb-8 text-gray-900" ]
        [ div
            []
            [ case ( config.candidacy.firstname, config.candidacy.lastname ) of
                ( Just firstname, Just lastname ) ->
                    viewInfo
                        "firstname lastname"
                        "Prénom Nom"
                    <|
                        h1
                            [ class "text-3xl font-bold mb-8" ]
                            [ text <| firstname ++ " " ++ lastname
                            ]

                _ ->
                    text ""
            , viewInfo
                "certification-label"
                "certification"
              <|
                h2
                    [ class "text-2xl font-bold leading-none text-gray-900 mb-5"
                    , classList [ ( "italic", config.candidacy.certification == Nothing ) ]
                    ]
                    [ Maybe.map .label config.candidacy.certification
                        |> Maybe.withDefault "Certification non sélectionnée"
                        |> text
                    ]
            ]
        , div
            [ class "mt-12 mb-4" ]
            [ View.infoBlock "Ma candidature"
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
                                [ class "text-blue-700 hover:text-blue-800 truncate"
                                , href ("mailto:" ++ email)
                                ]
                                [ text email ]
                                |> viewInfo "email" "Email"
                        )
                    |> Maybe.withDefault (text "")
                ]
            , case config.referential of
                Success referential ->
                    viewGoals referential config.candidacy.goals

                Failure errors ->
                    View.errors errors

                _ ->
                    text "..."
            , if Api.Token.isAdmin context.token then
                viewOrganism config.candidacy.organism

              else
                text ""
            , View.infoBlock "Mes expériences" <| List.map viewExperience config.candidacy.experiences
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
                    { onClick = Nothing, label = "Supprimer la candidature" }
                    |> Button.linkButton
                        (Route.toString context.baseUrl
                            (Route.Candidacy <|
                                View.Candidacy.Tab.Tab config.candidacy.id Archive
                            )
                        )
                    |> Button.secondary
                    |> Button.view
            , if canDropoutCandidacy config.candidacy then
                Button.new { onClick = Nothing, label = "Déclarer l'abandon du candidat" }
                    |> Button.linkButton
                        (Route.toString context.baseUrl
                            (Route.Candidacy <|
                                View.Candidacy.Tab.Tab config.candidacy.id DropOut
                            )
                        )
                    |> Button.secondary
                    |> Button.withAttrs [ class "mt-3 sm:mt-0 sm:ml-3" ]
                    |> Button.view

              else
                text ""
            ]
        ]
    ]


viewInfo : String -> String -> Html msg -> Html msg
viewInfo dataTestId label value =
    dl []
        [ dt [ class "hidden" ] [ text label ]
        , dd
            [ class "text-lg", dataTest dataTestId ]
            [ value ]
        ]


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
    div [ class "mt-4 leading-tight" ]
        [ h4 [ class "font-semibold mb-1 text-xl" ] [ text experience.title ]
        , p [ class "text-lg my-2" ] [ text "Démarrée en ", text <| View.Date.toFullFormat experience.startedAt ]
        , p [ class "text-lg my-2" ] [ text "Durée d'expérience ", viewDuration experience.duration ]
        , p [ class "text-lg italic mb-0" ] [ text "\"", text experience.description, text "\"" ]
        ]


viewGoals : Referential -> List CandidacyGoal -> Html msg
viewGoals referential candidacyGoals =
    View.infoBlock "Mon objectif"
        [ ul
            [ class "text-lg px-0 mb-0 leading-tight list-none" ]
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
            View.infoBlock "Mon architecte de parcours"
                [ p [ class "text-lg mb-0" ] [ text organism.label ]
                , p [ class "text-lg mb-0" ] [ text organism.contactAdministrativeEmail ]
                ]

        Nothing ->
            text ""


viewSentAt : Maybe DateWithLabels -> Html msg
viewSentAt sentAt =
    div
        []
    <|
        case sentAt of
            Just date ->
                [ text "Envoyée le "
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
