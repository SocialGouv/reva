module Page.Candidacies exposing
    ( Model
    , Msg
    , demoModel
    , init
    , receiveRemoteCandidacies
    , update
    , view
    )

import Admin.Object exposing (Candidacy)
import Api exposing (Token)
import Data.Candidacy as Candidacy exposing (Candidacy, CandidacySummary)
import Html.Styled as Html exposing (Html, a, aside, button, div, h2, h3, input, label, li, nav, p, span, text, ul)
import Html.Styled.Attributes exposing (action, attribute, class, for, href, id, name, placeholder, type_)
import Html.Styled.Events exposing (onClick, onInput)
import List.Extra
import RemoteData exposing (RemoteData(..))
import String exposing (String)
import View.Candidate exposing (Tab(..))
import View.Helpers exposing (dataTest)
import View.Icons as Icons


type Msg
    = GotCandidacyResponse Candidacy
    | UserAddedFilter String
    | UserSelectedCandidacy CandidacySummary
    | UserSelectedCandidacyTab View.Candidate.Tab


type SelectedCandidacy
    = LoadingSelection CandidacySummary
    | LoadedSelection Candidacy
    | CandidacyNotSelected


type alias Model =
    { token : Token
    , filter : Maybe String
    , selected : SelectedCandidacy
    , tab : Tab
    , state : RemoteData String (List CandidacySummary)
    }


init : Token -> Model
init token =
    { token = token
    , filter = Nothing
    , selected = CandidacyNotSelected
    , state = RemoteData.NotAsked
    , tab = View.Candidate.Events
    }


demoModel : Model
demoModel =
    let
        initialModel =
            init (Api.stringToToken "")
    in
    { initialModel | state = RemoteData.NotAsked }


receiveRemoteCandidacies : Model -> RemoteData String (List CandidacySummary) -> Model
receiveRemoteCandidacies model remoteCandidacies =
    { model | state = remoteCandidacies }


filterCandidacy : String -> CandidacySummary -> Bool
filterCandidacy filter candidacySummary =
    let
        match s =
            String.toLower s
                |> String.contains (String.toLower filter)
    in
    match (candidacySummary.certification.label ++ " " ++ candidacySummary.certification.acronym)
        || (Maybe.map match candidacySummary.phone |> Maybe.withDefault False)
        || (Maybe.map match candidacySummary.email |> Maybe.withDefault False)



-- VIEW


view :
    Model
    -> Html Msg
view model =
    case model.state of
        NotAsked ->
            div [] []

        Loading ->
            div [] [ text "loading" ]

        Failure errors ->
            div [ class "text-red-500" ] [ text errors ]

        Success candidacies ->
            let
                sortedCandidacies =
                    List.sortBy (.lastStatus >> .status) candidacies
                        |> List.reverse
            in
            case model.filter of
                Nothing ->
                    viewContent model sortedCandidacies

                Just filter ->
                    List.filter (filterCandidacy filter) sortedCandidacies
                        |> viewContent model


viewContent :
    Model
    -> List CandidacySummary
    -> Html Msg
viewContent model candidacies =
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
            [ viewDirectoryPanel candidacies
            , div [ class "h-full w-full bg-gray-500" ] []
            ]
        ]


viewCandidacyPanel : Model -> Candidacy -> Html Msg
viewCandidacyPanel model candidacy =
    case model.tab of
        _ ->
            div [] []


viewDirectoryPanel : List CandidacySummary -> Html Msg
viewDirectoryPanel candidacies =
    let
        candidaciesByStatus =
            List.Extra.groupWhile
                (\c1 c2 -> c1.lastStatus.status == c2.lastStatus.status)
                candidacies
    in
    aside
        [ class "hidden md:order-first md:flex md:flex-col flex-shrink-0 w-96 border-r border-gray-200" ]
        [ div
            [ class "px-6 pt-6 pb-4" ]
            [ h2
                [ class "text-lg font-medium text-gray-900" ]
                [ text "Candidatures" ]
            , p
                [ class "mt-1 text-sm text-gray-500" ]
                [ text "Recherchez par nom de certification et information de contact (téléphone et email)" ]
            , div
                [ class "my-2 flex space-x-4", action "#" ]
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
                            , onInput UserAddedFilter
                            ]
                            []
                        ]
                    ]
                ]
            ]
        , List.map viewDirectory candidaciesByStatus
            |> nav [ dataTest "directory", class "flex-1 min-h-0 overflow-y-auto", attribute "aria-label" "Candidats" ]
        ]


viewDirectory : ( CandidacySummary, List Candidacy.CandidacySummary ) -> Html Msg
viewDirectory ( firstCandidacy, candidacies ) =
    div
        [ dataTest "directory-group", class "relative" ]
        [ div
            [ dataTest "directory-group-name"
            , class "z-10 sticky top-0 border-t border-b border-gray-200 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-800"
            ]
            [ h3 [] [ text (Candidacy.statusToString firstCandidacy.lastStatus.status) ] ]
        , List.map viewItem (firstCandidacy :: candidacies)
            |> ul [ attribute "role" "list", class "relative z-0 divide-y divide-gray-200" ]
        ]


viewItem : CandidacySummary -> Html Msg
viewItem candidacy =
    li
        [ dataTest "directory-item" ]
        [ div
            [ class "relative px-6 py-5 flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-1 focus-within:ring-inset focus-within:ring-indigo-500" ]
            [ div [ class "flex-shrink-0 text-gray-400" ]
                [ Icons.user ]
            , div
                [ class "flex-1 min-w-0" ]
                [ a
                    [ onClick (UserSelectedCandidacy candidacy)
                    , href "#"
                    , class "focus:outline-none"
                    ]
                    [ span
                        [ class "absolute inset-0", attribute "aria-hidden" "true" ]
                        []
                    , p
                        [ class "text-sm font-medium text-blue-600 space-x-4" ]
                        [ text (candidacy.phone |> Maybe.withDefault "")
                        , text (candidacy.email |> Maybe.withDefault "")
                        ]
                    , p [ class "text-sm text-gray-500 truncate" ]
                        [ text candidacy.certification.label ]
                    ]
                ]
            ]
        ]



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        noChange =
            ( model, Cmd.none )
    in
    case msg of
        GotCandidacyResponse candidacy ->
            ( { model | selected = LoadedSelection candidacy }, Cmd.none )

        UserAddedFilter filter ->
            ( { model | filter = Just filter }, Cmd.none )

        UserSelectedCandidacy candidacySummary ->
            ( { model | selected = LoadingSelection candidacySummary }
            , Cmd.none
              -- TODO: fetch candidacy
            )

        UserSelectedCandidacyTab tab ->
            ( { model | tab = tab }, Cmd.none )



-- HELPERS


candidacyFirstLetter : CandidacySummary -> Char
candidacyFirstLetter candidacy =
    String.uncons candidacy.certification.label
        |> Maybe.map (\( firstLetter, _ ) -> Char.toLower firstLetter)
        |> Maybe.withDefault ' '
