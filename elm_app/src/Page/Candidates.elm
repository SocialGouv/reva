module Page.Candidates exposing
    ( Model
    , Msg
    , init
    , receiveCandidates
    , update
    , view
    )

import Actions
import Candidate exposing (Candidate)
import Candidate.Status exposing (Status(..))
import Html.Styled as Html exposing (Html, a, aside, button, div, h2, h3, input, label, li, nav, p, span, text, ul)
import Html.Styled.Attributes exposing (action, attribute, class, for, href, id, name, placeholder, type_)
import Html.Styled.Events exposing (onClick, onInput)
import List.Extra
import Page.Candidates.Recognition as Recognition
import View.Candidate exposing (Tab(..))
import View.Helpers exposing (dataTest)
import View.Icons as Icons


type Msg
    = GotRecognitionMsg Recognition.Msg
    | UserAddedFilter String
    | UserSelectedCandidate Candidate
    | UserSelectedCandidateTab View.Candidate.Tab


type alias Model =
    { filter : Maybe String
    , selected : Maybe Candidate
    , tab : Tab
    , state : State
    }


type State
    = Loading
    | Idle (List Candidate)


init : Model
init =
    { filter = Nothing
    , selected = Nothing
    , state = Loading
    , tab = View.Candidate.Recognition Recognition.init
    }


receiveCandidates : Model -> List Candidate -> Model
receiveCandidates model candidates =
    { model | state = Idle candidates, selected = List.head candidates }


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
    Model
    -> Html Msg
view model =
    case model.state of
        Loading ->
            div [] [ text "loading" ]

        Idle candidates ->
            case model.filter of
                Nothing ->
                    viewContent model candidates

                Just filter ->
                    List.filter (filterCandidate filter) candidates
                        |> viewContent model


viewContent :
    Model
    -> List Candidate
    -> Html Msg
viewContent model candidates =
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
            [ viewDirectoryPanel candidates
            , Maybe.map (viewCandidatePanel model) model.selected
                |> Maybe.withDefault (div [ class "h-full w-full bg-gray-500" ] [])
            ]
        ]


viewCandidatePanel : Model -> Candidate -> Html Msg
viewCandidatePanel model candidate =
    View.Candidate.layout
        { onSelectTab = UserSelectedCandidateTab }
        candidate
        model.tab
    <|
        case model.tab of
            Events ->
                View.Candidate.events candidate

            Profil ->
                View.Candidate.profile candidate

            Recognition recoModel ->
                [ Html.map GotRecognitionMsg <|
                    Recognition.view recoModel candidate
                ]


viewDirectoryPanel : List Candidate -> Html Msg
viewDirectoryPanel candidates =
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
                            , onInput UserAddedFilter
                            ]
                            []
                        ]
                    ]
                ]
            ]
        , List.map viewDirectory candidatesByFirstLetter
            |> nav [ dataTest "directory", class "flex-1 min-h-0 overflow-y-auto", attribute "aria-label" "Candidats" ]
        ]


viewDirectory : ( Candidate, List Candidate ) -> Html Msg
viewDirectory ( firstCandidate, candidates ) =
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
        , List.map viewItem (firstCandidate :: candidates)
            |> ul [ attribute "role" "list", class "relative z-0 divide-y divide-gray-200" ]
        ]


viewItem : Candidate -> Html Msg
viewItem candidate =
    li
        [ dataTest "directory-item" ]
        [ div
            [ class "relative px-6 py-5 flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-1 focus-within:ring-inset focus-within:ring-indigo-500" ]
            [ div [ class "flex-shrink-0 text-gray-400" ]
                [ Icons.user ]
            , div
                [ class "flex-1 min-w-0" ]
                [ a
                    [ onClick (UserSelectedCandidate candidate)
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
                        [ text (Candidate.maybeDiplomeToString candidate.diplome) ]
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
        GotRecognitionMsg recoMsg ->
            case ( model.tab, model.selected ) of
                ( Recognition recoModel, Just candidate ) ->
                    let
                        ( newRecoModel, recoCmd, actions ) =
                            Recognition.update candidate recoModel recoMsg

                        newModel =
                            { model | tab = Recognition newRecoModel }
                    in
                    ( List.foldl applyAction newModel actions
                    , Cmd.map GotRecognitionMsg recoCmd
                    )

                _ ->
                    noChange

        UserAddedFilter filter ->
            ( { model | filter = Just filter }, Cmd.none )

        UserSelectedCandidate candidate ->
            ( { model | selected = Just candidate }, Cmd.none )

        UserSelectedCandidateTab tab ->
            ( { model | tab = tab }, Cmd.none )


applyAction : Actions.Action -> Model -> Model
applyAction action model =
    case action of
        Actions.UpdateCandidate candidate ->
            { model | selected = Just candidate }



-- HELPERS


candidateFirstLetter : Candidate -> Char
candidateFirstLetter candidate =
    String.uncons candidate.lastname
        |> Maybe.map (\( firstLetter, _ ) -> Char.toLower firstLetter)
        |> Maybe.withDefault ' '
