module View.Candidate exposing (Tab(..), events, layout, profile)

import Api exposing (Token)
import Candidate.Grade as Grade
import Candidate.Status as Status exposing (Status(..))
import Css exposing (height, px)
import Data.Candidate as Candidate exposing (Candidate, StatusEvent, SurveyEvent)
import Html.Styled exposing (Html, a, article, dd, div, dl, dt, h1, nav, node, span, text)
import Html.Styled.Attributes exposing (attribute, class, css, href, target)
import Page.Candidates.Recognition
import String.Interpolate exposing (interpolate)
import Url
import Url.Builder
import View.Helpers exposing (dataTest)
import View.Icons as Icons
import View.Navigation as Navigation
import View.Timeline as Timeline


type Tab
    = Events
    | Recognition Page.Candidates.Recognition.Model
    | Profil


layout :
    { a | token : Token, onSelectTab : Tab -> msg }
    -> Candidate
    -> Tab
    -> List (Html msg)
    -> Html msg
layout config candidate tab tabContent =
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
                    [ text "Candidats" ]
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
                        , div
                            [ class "mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1" ]
                            [ div
                                [ class "mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4" ]
                                [ a
                                    [ href ("mailto:" ++ candidate.email), class "inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" ]
                                    [ Icons.mail
                                    , span [] [ text "Message" ]
                                    ]
                                ]
                            ]
                        ]
                    , div
                        [ class "mt-3 min-w-0 flex-1" ]
                        [ h1
                            [ class "text-2xl font-bold text-gray-900 truncate" ]
                            [ text candidate.firstname
                            , text " "
                            , text candidate.lastname
                            ]
                        ]
                    ]
                ]
            , div
                [ class "mt-4 border-b border-gray-200" ]
                [ div
                    [ class "max-w-2xl mx-auto px-4 sm:px-6 lg:px-8" ]
                    [ Navigation.view
                        [ { dataTest = "events"
                          , name = "Évènements"
                          , selected = tab == Events
                          , toMsg = config.onSelectTab Events
                          }
                        , { dataTest = "recognition"
                          , name = "Reconnaissance"
                          , selected = isRecognitionTab tab
                          , toMsg = config.onSelectTab <| Recognition <| Page.Candidates.Recognition.init config.token
                          }
                        , { dataTest = "profile"
                          , name = "Profil"
                          , selected = tab == Profil
                          , toMsg = config.onSelectTab Profil
                          }
                        ]
                    ]
                ]
            , div
                [ class "my-6 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-gray-700" ]
                tabContent
            ]
        ]


emailLinkTemplate : String
emailLinkTemplate =
    """mailto:{0}?subject=[REVA] Je vous invite à passer à nouveau le questionnaire de l'expérimentation !&body=Bonjour {1},
%0A%0A
Dans le cadre de votre parcours VAE au sein de l'expérimentation REVA, je vous invite à remplir à nouveau le questionnaire avant la prochaine étape de votre accompagnement :
%0A%0A
%5B Description de la prochaine étape %5D
%0A%0A
{2}
%0A%0A
Vos réponses à ce questionnaire sont précieuses pour nous, afin d'évaluer votre perception du parcours expérimental auquel vous participez. Elles nous permettent d'améliorer et de faciliter la reconnaissance et la validation de votre expérience.
%0A%0A
%5B Signature %5D"""


events : Candidate -> List (Html msg)
events candidate =
    let
        successSurveyEvent : SurveyEvent -> Timeline.Event msg
        successSurveyEvent survey =
            { content =
                [ text "A répondu au questionnaire"
                , div
                    [ dataTest "grades", class "flex items-center" ]
                    [ Grade.view "Obtention" survey.grades.obtainment
                    , Grade.view "Profil" survey.grades.profile
                    ]
                ]
            , dataTest = "survey"
            , status = Timeline.Commented survey.date
            , timestamp = survey.timestamp
            }

        surveyHistory : List (Timeline.Event msg)
        surveyHistory =
            List.map successSurveyEvent candidate.surveys

        statusEvent : StatusEvent -> Timeline.Event msg
        statusEvent event =
            { content = [ text <| Status.toString event.status ]
            , dataTest = "status"
            , status = Status.toTimelineStatus event.status event.date
            , timestamp = event.timestamp
            }

        statusHistory : List (Timeline.Event msg)
        statusHistory =
            candidate.statusHistory
                |> List.filter (.status >> Status.isVisible)
                |> List.map statusEvent

        maybePrependStatusPending statuses history =
            List.head statuses
                |> Maybe.andThen (.status >> Status.toNextStepString)
                |> Maybe.map
                    (\next ->
                        { content = [ text next ]
                        , dataTest = "status"
                        , status = Timeline.Pending
                        , timestamp = 0
                        }
                            :: history
                    )
                |> Maybe.withDefault history

        maybePrependSecondSurveyRequired candidate_ history =
            case ( Candidate.isRejected candidate_, candidate_.surveys ) of
                ( False, [ submission ] ) ->
                    { content = [ text "En attente d'un deuxième passage du questionnaire" ]
                    , dataTest = "survey"
                    , status = Timeline.Pending
                    , timestamp = 0
                    }
                        :: history

                ( _, l ) ->
                    history

        eventHistory =
            statusHistory
                ++ surveyHistory
                |> List.sortBy (\event -> event.timestamp)
                |> List.reverse
                |> maybePrependStatusPending candidate.statusHistory
                |> maybePrependSecondSurveyRequired candidate

        baseUrl =
            "https://reva.beta.gouv.fr"

        surveyWebsiteLink =
            case ( candidate.diplome, candidate.city ) of
                ( Just diplome, Just city ) ->
                    Url.Builder.crossOrigin baseUrl
                        [ "inscription" ]
                        [ Url.Builder.string "diplome" diplome.id
                        , Url.Builder.string "cohorte" city.id
                        , Url.Builder.string "step" "welcome"
                        ]
                        |> Url.percentEncode

                _ ->
                    baseUrl

        surveyEmailLink =
            interpolate emailLinkTemplate [ candidate.email, candidate.firstname, surveyWebsiteLink ]
    in
    [ Timeline.view "survey-timeline" eventHistory
    , div
        [ class "flex justify-end items-center" ]
        [ a
            [ dataTest "survey-invitation"
            , class "block rounded py-2 px-3 text-blue-500 hover:text-blue-600"
            , href surveyEmailLink
            , target "_blank"
            ]
            [ text "Inviter le candidat à passer à nouveau le questionnaire ↗" ]
        ]
    ]


profile : Candidate -> List (Html msg)
profile candidate =
    let
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
    in
    [ dl
        [ class "grid grid-cols-1 gap-x-4 gap-y-8 2xl:grid-cols-2" ]
        [ candidate.phoneNumber
            |> text
            |> viewInfo "phone-number" "Téléphone"
        , a
            [ class "text-blue-500 hover:text-blue-600 truncate"
            , href ("mailto:" ++ candidate.email)
            ]
            [ text candidate.email ]
            |> viewInfo "email" "Email"
        , Candidate.maybeDiplomeToString candidate.diplome
            |> text
            |> viewInfo "diplome" "Diplôme"
        , Candidate.maybeCityToString candidate.city
            |> text
            |> viewInfo "city" "Ville"
        ]
    ]



-- HELPERS


isRecognitionTab : Tab -> Bool
isRecognitionTab tab =
    case tab of
        Recognition _ ->
            True

        _ ->
            False
