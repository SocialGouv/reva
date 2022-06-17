module Page.Candidacies exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Admin.Object exposing (Candidacy)
import Api exposing (Token)
import Css exposing (content)
import Data.Candidacy as Candidacy exposing (Candidacy, CandidacySummary)
import Data.Referential exposing (Referential)
import Html.Styled as Html exposing (Html, a, article, aside, button, div, h2, h3, input, label, li, nav, node, p, span, text, ul)
import Html.Styled.Attributes exposing (action, attribute, class, for, href, id, name, placeholder, type_)
import Html.Styled.Events exposing (onClick, onInput)
import List.Extra
import RemoteData exposing (RemoteData(..))
import Request
import String exposing (String)
import View.Candidacy
import View.Candidate exposing (Tab(..))
import View.Helpers exposing (dataTest)
import View.Icons as Icons


type Msg
    = GotCandidaciesResponse (RemoteData String (List CandidacySummary))
    | GotCandidacyResponse (RemoteData String Candidacy)
    | GotCandidacyDeletionResponse (RemoteData String String)
    | GotCandidacyArchivingResponse (RemoteData String Candidacy)
    | GotReferentialResponse (RemoteData String Referential)
    | UserAddedFilter String
    | UserSelectedCandidacy CandidacySummary
    | UserArchivedCandidacy Candidacy
    | UserDeletedCandidacy Candidacy
    | UserSelectedCandidacyTab View.Candidate.Tab


type alias State =
    { candidacies : RemoteData String (List CandidacySummary)
    , referential : RemoteData String Referential
    }


type alias Model =
    { endpoint : String
    , token : Token
    , filter : Maybe String
    , selected : RemoteData String Candidacy
    , state : State
    , tab : Tab
    }


init : String -> Token -> ( Model, Cmd Msg )
init endpoint token =
    let
        model =
            { endpoint = endpoint
            , token = token
            , filter = Nothing
            , selected = NotAsked
            , state =
                { candidacies = RemoteData.NotAsked
                , referential = RemoteData.NotAsked
                }
            , tab = View.Candidate.Events
            }
    in
    ( model
    , Cmd.batch
        [ Request.requestCandidacies endpoint GotCandidaciesResponse
        , Request.requestReferential endpoint GotReferentialResponse
        ]
    )


withCandidacies : RemoteData String (List CandidacySummary) -> State -> State
withCandidacies candidacies state =
    { state | candidacies = candidacies }


withReferential : RemoteData String Referential -> State -> State
withReferential referential state =
    { state | referential = referential }


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
    case model.state.candidacies of
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
            , viewCandidacyPanel model
            ]
        ]


viewCandidacyPanel : Model -> Html Msg
viewCandidacyPanel model =
    let
        loading extraClass =
            div
                [ class "animate-pulse rounded bg-gray-100 w-128"
                , class extraClass
                ]
                []
    in
    viewCandidacyArticle <|
        case model.selected of
            NotAsked ->
                []

            Loading ->
                [ loading "mt-8 mb-20 w-96 h-8"
                , div
                    [ class "mx-8" ]
                    [ loading "mb-2 w-48 h-6"
                    , loading "mb-10 w-128 h-16"
                    , loading "mb-2 w-48 h-6"
                    , loading "w-128 h-64"
                    ]
                ]

            Failure err ->
                [ text err ]

            Success candidacy ->
                View.Candidacy.view
                    { candidacy = candidacy
                    , archiveMsg = UserArchivedCandidacy
                    , deleteMsg = UserDeletedCandidacy
                    , referential = model.state.referential
                    }


viewCandidacyArticle : List (Html msg) -> Html msg
viewCandidacyArticle content =
    node "main"
        [ dataTest "profile"
        , class "flex-1 relative z-10 overflow-y-auto focus:outline-none xl:order-last bg-gray-100"
        ]
        [ article
            [ class "max-w-2xl bg-white h-screen px-3 py-8 sm:px-6" ]
            content
        ]


viewDirectoryPanel : List CandidacySummary -> Html Msg
viewDirectoryPanel candidacies =
    let
        candidaciesByStatus =
            List.Extra.groupWhile
                (\c1 c2 -> c1.lastStatus.status == c2.lastStatus.status)
                candidacies
    in
    aside
        [ class "hidden md:order-first md:flex md:flex-col flex-shrink-0 w-96 border-r-[40px] border-gray-400" ]
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
    let
        displayMaybe maybeInfo =
            Maybe.map (\s -> div [] [ text s ]) maybeInfo
                |> Maybe.withDefault (text "")
    in
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
                        [ class "flex text-sm font-medium text-blue-600 space-x-2" ]
                        [ displayMaybe candidacy.phone
                        , displayMaybe candidacy.email
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
    case msg of
        GotCandidaciesResponse remoteCandidacies ->
            ( { model | state = model.state |> withCandidacies remoteCandidacies }
            , Cmd.none
            )

        GotCandidacyResponse remoteCandidacy ->
            ( { model | selected = remoteCandidacy }, Cmd.none )

        GotCandidacyDeletionResponse (Failure err) ->
            ( { model | selected = Failure err }, Cmd.none )

        GotCandidacyDeletionResponse _ ->
            ( { model | selected = NotAsked }, Cmd.none )

        GotCandidacyArchivingResponse (Failure err) ->
            ( { model | selected = Failure err }, Cmd.none )

        GotCandidacyArchivingResponse (Success candidacy) ->
            ( archiveCandidacy model candidacy, Cmd.none )

        GotCandidacyArchivingResponse _ ->
            ( { model | selected = NotAsked }, Cmd.none )

        GotReferentialResponse remoteReferentials ->
            ( { model | state = model.state |> withReferential remoteReferentials }
            , Cmd.none
            )

        UserAddedFilter filter ->
            ( { model | filter = Just filter }, Cmd.none )

        UserDeletedCandidacy candidacy ->
            ( removeCandidacy model candidacy
            , Request.deleteCandidacy model.endpoint GotCandidacyDeletionResponse candidacy.id
            )

        UserArchivedCandidacy candidacy ->
            ( model
              -- removeCandidacy model candidacy
            , Request.archiveCandidacy model.endpoint GotCandidacyArchivingResponse candidacy.id
            )

        UserSelectedCandidacy candidacySummary ->
            ( { model | selected = Loading }
            , Request.requestCandidacy model.endpoint GotCandidacyResponse candidacySummary.id
            )

        UserSelectedCandidacyTab tab ->
            ( { model | tab = tab }, Cmd.none )



-- HELPERS


archiveCandidacy : Model -> Candidacy -> Model
archiveCandidacy model candidacy =
    case model.state.candidacies of
        Success candidacies ->
            let
                newCandidacies =
                    List.map
                        (\c ->
                            if c.id /= candidacy.id then
                                c

                            else
                                Candidacy.toCandidacySummary candidacy
                        )
                        candidacies
            in
            { model | state = model.state |> withCandidacies (Success newCandidacies) }

        _ ->
            model


removeCandidacy : Model -> Candidacy -> Model
removeCandidacy model candidacy =
    case model.state.candidacies of
        Success candidacies ->
            let
                newCandidacies =
                    List.filter (\c -> c.id /= candidacy.id) candidacies
            in
            { model | state = model.state |> withCandidacies (Success newCandidacies) }

        _ ->
            model
