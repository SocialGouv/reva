module Page.Candidates exposing
    ( Candidate
    , Model
    , addFilter
    , candidatesDecoder
    , init
    , receiveCandidates
    , selectCandidate
    , view
    )

import Candidate.Grade as Grade exposing (Grade)
import Candidate.Status as Status exposing (Status(..))
import Css exposing (height, px)
import Html.Styled exposing (Html, a, article, aside, button, dd, div, dl, dt, h1, h2, h3, input, label, li, nav, node, p, span, text, ul)
import Html.Styled.Attributes exposing (action, attribute, class, css, for, href, id, name, placeholder, target, type_)
import Html.Styled.Events exposing (onClick, onInput)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (optional, required)
import List.Extra
import String.Interpolate exposing (interpolate)
import Url
import Url.Builder
import View.Helpers exposing (dataTest)
import View.Icons as Icons
import View.Timeline as Timeline


type alias Model =
    { filter : Maybe String
    , selected : Maybe Candidate
    , state : State
    }


type State
    = Loading
    | Idle (List Candidate)


type alias Grades =
    { obtainment : Grade
    , profile : Grade
    }


type alias SurveyEvent =
    { date : String
    , grades : Grades
    , timestamp : Int
    }


type alias StatusEvent =
    { date : String
    , status : Status
    , timestamp : Int
    }


type alias Candidate =
    { city : Maybe City
    , diplome : Maybe Diplome
    , email : String
    , firstname : String
    , lastname : String
    , phoneNumber : String
    , status : List StatusEvent
    , surveys : List SurveyEvent
    }


type alias City =
    { id : String
    , label : String
    , region : String
    }


type alias Diplome =
    { id : String
    , label : String
    }


init : Model
init =
    { filter = Nothing
    , selected = Nothing
    , state = Loading
    }


receiveCandidates : Model -> List Candidate -> Model
receiveCandidates model candidates =
    { model | state = Idle candidates }


selectCandidate : Model -> Candidate -> Model
selectCandidate model candidate =
    { model | selected = Just candidate }


addFilter : Model -> String -> Model
addFilter model filter =
    { model | filter = Just filter }


filterCandidate : String -> Candidate -> Bool
filterCandidate filter candidate =
    let
        match s =
            String.toLower s
                |> String.contains (String.toLower filter)
    in
    match candidate.email
        || match (candidate.firstname ++ " " ++ candidate.lastname)
        || (Maybe.map (.label >> match) candidate.diplome |> Maybe.withDefault False)
        || (Maybe.map (\city -> match city.label || match city.region) candidate.city
                |> Maybe.withDefault False
           )



-- VIEW


view :
    { a
        | onFilter : String -> msg
        , onSelect : Candidate -> msg
    }
    -> Model
    -> Html msg
view config model =
    case model.state of
        Loading ->
            div [] [ text "loading" ]

        Idle candidates ->
            case model.filter of
                Nothing ->
                    viewContent config model candidates

                Just filter ->
                    List.filter (filterCandidate filter) candidates
                        |> viewContent config model


viewContent :
    { a | onFilter : String -> msg, onSelect : Candidate -> msg }
    -> Model
    -> List Candidate
    -> Html msg
viewContent config model candidates =
    div
        [ class "flex flex-col min-w-0 flex-1 overflow-hidden" ]
        [ div
            [ class "sm:hidden" ]
            [ div
                [ class "flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-1.5" ]
                [ div
                    []
                    [-- Logo here
                    ]
                , div
                    []
                    [ button
                        [ type_ "button", class "-mr-3 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600" ]
                        [ span
                            [ class "sr-only" ]
                            [ text "Open sidebar" ]
                        , Icons.menu
                        ]
                    ]
                ]
            ]
        , div
            [ class "flex-1 relative z-0 flex overflow-hidden" ]
            [ Maybe.map viewProfile model.selected
                |> Maybe.withDefault (div [ class "h-full w-full bg-gray-500" ] [])
            , viewDirectoryPanel config candidates
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


viewProfile : Candidate -> Html msg
viewProfile candidate =
    let
        maxSafeInteger : Int
        maxSafeInteger =
            9007199254740991

        successSurveyEvent : SurveyEvent -> Timeline.Event msg
        successSurveyEvent survey =
            { content =
                [ text "A répondu au questionnaire"
                , div
                    [ dataTest "grades", class "flex items-center" ]
                    [ Grade.view "Profil" survey.grades.profile
                    , Grade.view "Obtention" survey.grades.obtainment
                    ]
                ]
            , dataTest = "survey"
            , status = Timeline.Success survey.date
            , timestamp = survey.timestamp
            }

        surveyHistory : List (Timeline.Event msg)
        surveyHistory =
            case candidate.surveys of
                [ submission ] ->
                    [ { content = [ text "En attente du deuxième passage" ]
                      , dataTest = "survey-pending"
                      , status = Timeline.Pending
                      , timestamp = maxSafeInteger
                      }
                    , successSurveyEvent submission
                    ]

                l ->
                    List.map successSurveyEvent l

        successStatusEvent : StatusEvent -> Timeline.Event msg
        successStatusEvent event =
            { content = [ text <| Status.toString event.status ]
            , dataTest = "status"
            , status = Timeline.Success event.date
            , timestamp = event.timestamp
            }

        statusHistory : List (Timeline.Event msg)
        statusHistory =
            let
                events =
                    List.map successStatusEvent candidate.status
            in
            List.head candidate.status
                |> Maybe.andThen (.status >> Status.toNextStepString)
                |> Maybe.map
                    (\next ->
                        { content = [ text next ]
                        , dataTest = "status-pending"
                        , status = Timeline.Pending
                        , timestamp = maxSafeInteger
                        }
                            :: events
                    )
                |> Maybe.withDefault events

        eventHistory =
            (surveyHistory ++ statusHistory)
                |> List.sortBy (\event -> event.timestamp)
                |> List.reverse

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
    node "main"
        [ dataTest "profile", class "flex-1 relative z-0 overflow-y-auto focus:outline-none xl:order-last" ]
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
                [ class "mt-0" ]
                [ div
                    [ class "border-b border-gray-200" ]
                    [ div
                        [ class "max-w-2xl mx-auto px-4 sm:px-6 lg:px-8" ]
                        [ nav
                            [ class "-mb-px flex space-x-8", attribute "aria-label" "Tabs" ]
                            [ a
                                [ href "#", class "border-indigo-500 text-gray-900 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm", attribute "aria-current" "page" ]
                                [ text "Profil" ]

                            -- , a
                            --     [ href "#", class "text-gray-900 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm", attribute "aria-current" "page" ]
                            --     [ text "Questionnaires" ]
                            ]
                        ]
                    ]
                ]
            , div
                [ class "my-6 max-w-2xl   mx-auto px-4 sm:px-6 lg:px-8" ]
                [ div [ class "text-sm flex items-center justify-between" ]
                    [ h3
                        [ class "font-medium text-gray-500" ]
                        [ text "Évènement" ]
                    , a
                        [ dataTest "survey-invitation"
                        , class "py-2 text-blue-500 hover:text-blue-700"
                        , href surveyEmailLink
                        , target "_blank"
                        ]
                        [ text "Inviter à passer à nouveau le questionnaire" ]
                    ]
                , Timeline.view "survey-timeline" eventHistory
                , dl
                    [ class "grid grid-cols-1 gap-x-4 gap-y-8 2xl:grid-cols-2" ]
                    [ candidate.phoneNumber
                        |> text
                        |> viewInfo "Téléphone"
                    , a
                        [ class "text-blue-500 hover:text-blue-600 truncate"
                        , href ("mailto:" ++ candidate.email)
                        ]
                        [ text candidate.email ]
                        |> viewInfo "Email"
                    , maybeDiplomeToString candidate.diplome
                        |> text
                        |> viewInfo "Diplôme"
                    , maybeCityToString candidate.city
                        |> text
                        |> viewInfo "Ville"
                    ]
                ]
            ]
        ]


viewInfo : String -> Html msg -> Html msg
viewInfo label value =
    div
        [ class "sm:col-span-1" ]
        [ dt
            [ class "text-sm font-medium text-gray-500" ]
            [ text label ]
        , dd
            [ class "mt-1 text-sm text-gray-900" ]
            [ value ]
        ]


viewDirectoryPanel :
    { a
        | onFilter : String -> msg
        , onSelect : Candidate -> msg
    }
    -> List Candidate
    -> Html msg
viewDirectoryPanel config candidates =
    let
        candidatesByFirstLetter =
            List.Extra.groupWhile
                (\c1 c2 -> candidateFirstLetter c1 == candidateFirstLetter c2)
                candidates
    in
    aside
        [ class "hidden md:order-first md:flex md:flex-col flex-shrink-0 w-96 border-r border-gray-200" ]
        [ div
            [ class "px-6 pt-6 pb-4" ]
            [ h2
                [ class "text-lg font-medium text-gray-900" ]
                [ text "Candidats" ]
            , p
                [ class "mt-1 text-sm text-gray-600" ]
                [ text "Rechercher par nom, diplôme, région..." ]
            , div
                [ class "mt-6 flex space-x-4", action "#" ]
                [ div
                    [ class "flex-1 min-w-0" ]
                    [ label
                        [ for "search", class "sr-only" ]
                        [ text "Rechercher" ]
                    , div
                        [ class "relative rounded-md shadow-sm" ]
                        [ div
                            [ class "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" ]
                            [ Icons.search
                            ]
                        , input
                            [ type_ "search"
                            , name "search"
                            , id "search"
                            , class "focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                            , placeholder "Rechercher"
                            , onInput config.onFilter
                            ]
                            []
                        ]
                    ]
                ]
            ]
        , List.map (viewDirectory config) candidatesByFirstLetter
            |> nav [ dataTest "directory", class "flex-1 min-h-0 overflow-y-auto", attribute "aria-label" "Candidats" ]
        ]


viewDirectory : { a | onSelect : Candidate -> msg } -> ( Candidate, List Candidate ) -> Html msg
viewDirectory config ( firstCandidate, candidates ) =
    let
        groupName =
            candidateFirstLetter firstCandidate
                |> String.fromChar
                |> String.toUpper
    in
    div
        [ dataTest "directory-group", class "relative" ]
        [ div
            [ dataTest "directory-group-name"
            , class "z-10 sticky top-0 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500"
            ]
            [ h3 [] [ text groupName ] ]
        , List.map (viewItem config) (firstCandidate :: candidates)
            |> ul [ attribute "role" "list", class "relative z-0 divide-y divide-gray-200" ]
        ]


viewItem : { a | onSelect : Candidate -> msg } -> Candidate -> Html msg
viewItem config candidate =
    li
        [ dataTest "directory-item" ]
        [ div
            [ class "relative px-6 py-5 flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-1 focus-within:ring-inset focus-within:ring-indigo-500" ]
            [ div [ class "flex-shrink-0 text-gray-400" ]
                [ Icons.user ]
            , div
                [ class "flex-1 min-w-0" ]
                [ a
                    [ onClick (config.onSelect candidate)
                    , href "#"
                    , class "focus:outline-none"
                    ]
                    [ span
                        [ class "absolute inset-0", attribute "aria-hidden" "true" ]
                        []
                    , p
                        [ class "text-sm font-medium text-gray-900" ]
                        [ text candidate.firstname
                        , text " "
                        , text candidate.lastname
                        ]
                    , p [ class "text-sm text-gray-500 truncate" ]
                        [ text (maybeDiplomeToString candidate.diplome) ]
                    ]
                ]
            ]
        ]



-- HELPERS


candidateFirstLetter : Candidate -> Char
candidateFirstLetter candidate =
    String.uncons candidate.lastname
        |> Maybe.map (\( firstLetter, _ ) -> Char.toLower firstLetter)
        |> Maybe.withDefault ' '


maybeCityToString : Maybe City -> String
maybeCityToString maybeCity =
    maybeCity |> Maybe.map (\city -> city.label ++ ", " ++ city.region) |> Maybe.withDefault ""


maybeDiplomeToString : Maybe Diplome -> String
maybeDiplomeToString maybeDiplome =
    maybeDiplome |> Maybe.map (\diplome -> diplome.label) |> Maybe.withDefault ""



-- DECODER


diplomeDecoder : Decoder Diplome
diplomeDecoder =
    Decode.succeed Diplome
        |> required "id" Decode.string
        |> required "label" Decode.string


cityDecoder : Decoder City
cityDecoder =
    Decode.succeed City
        |> required "id" Decode.string
        |> required "label" Decode.string
        |> required "region" Decode.string


gradeDecoder : Decoder Grades
gradeDecoder =
    Decode.succeed Grades
        |> required "obtainment" (Decode.string |> Decode.map Grade.fromString)
        |> required "profile" (Decode.string |> Decode.map Grade.fromString)


surveyDecoder : Decoder SurveyEvent
surveyDecoder =
    Decode.succeed SurveyEvent
        |> required "date" Decode.string
        |> optional "grades" gradeDecoder { obtainment = Grade.Unknown, profile = Grade.Unknown }
        |> required "timestamp" Decode.int


statusDecoder : Decoder StatusEvent
statusDecoder =
    Decode.succeed StatusEvent
        |> required "date" Decode.string
        |> required "name" (Decode.string |> Decode.map Status.fromString)
        |> required "timestamp" Decode.int


candidateDecoder : Decoder Candidate
candidateDecoder =
    Decode.succeed Candidate
        |> optional "city" (Decode.maybe cityDecoder) Nothing
        |> optional "diplome" (Decode.maybe diplomeDecoder) Nothing
        |> required "email" Decode.string
        |> required "firstname" Decode.string
        |> required "lastname" Decode.string
        |> required "phoneNumber" Decode.string
        |> required "status" (Decode.list statusDecoder)
        |> required "surveys" (Decode.list surveyDecoder)


candidatesDecoder : Decoder (List Candidate)
candidatesDecoder =
    Decode.list candidateDecoder
