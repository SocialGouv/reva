module Page.Candidacies exposing
    ( Model
    , Msg
    , init
    , update
    , view
    , withStatusFilter
    )

import Api.Candidacy
import Api.Token exposing (Token)
import Data.Candidacy as Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Certification exposing (Certification)
import Data.Context exposing (Context)
import Data.Organism exposing (Organism)
import Data.Referential exposing (Referential)
import Html exposing (Html, a, aside, div, form, h2, h3, input, label, li, nav, node, p, span, text, ul)
import Html.Attributes exposing (action, attribute, class, classList, for, id, name, placeholder, type_)
import Html.Events exposing (onInput)
import List.Extra
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import Time
import View
import View.Candidacy
import View.Candidacy.Filters exposing (Filters)
import View.Candidacy.Tab exposing (Value(..))
import View.Helpers exposing (dataTest)
import View.Icons as Icons


type Msg
    = GotCandidaciesResponse (RemoteData String (List CandidacySummary))
    | UserAddedFilter String


type alias State =
    { candidacies : RemoteData String (List CandidacySummary)
    }


type alias Model =
    { filters : Filters
    , state : State
    }


withStatusFilter : Maybe String -> Model -> ( Model, Cmd Msg )
withStatusFilter status model =
    let
        withNewStatus : Filters -> Filters
        withNewStatus filters =
            { filters | status = status }
    in
    ( { model | filters = model.filters |> withNewStatus }, Cmd.none )


init : Context -> Maybe String -> ( Model, Cmd Msg )
init context maybeStatusFilters =
    let
        defaultModel : Model
        defaultModel =
            { filters = { search = Nothing, status = maybeStatusFilters }
            , state = { candidacies = RemoteData.Loading }
            }

        defaultCmd =
            Api.Candidacy.getCandidacies context.endpoint context.token GotCandidaciesResponse
    in
    ( defaultModel, defaultCmd )


withCandidacies : RemoteData String (List CandidacySummary) -> State -> State
withCandidacies candidacies state =
    { state | candidacies = candidacies }



-- VIEW


view :
    Context
    -> Model
    -> Html Msg
view context model =
    let
        candidacySkeleton =
            div
                []
                [ View.skeleton "h-4 w-120"
                , View.skeleton "mt-2 mb-12 h-12 w-96"
                ]
    in
    case model.state.candidacies of
        NotAsked ->
            div [] []

        Loading ->
            viewMain
                [ viewDirectoryHeader context
                , div
                    [ class "py-3 px-10" ]
                    [ View.skeleton "mb-10 h-6 w-56"
                    , candidacySkeleton
                    , candidacySkeleton
                    , candidacySkeleton
                    , candidacySkeleton
                    ]
                ]
                [ View.skeleton "ml-10 mt-8 bg-gray-200 mt-6 h-10 w-[353px]" ]

        Failure errors ->
            div [ class "text-red-500" ] [ text errors ]

        Success candidacies ->
            let
                preFilteredCandidacies =
                    case model.filters.status of
                        Just "abandon" ->
                            candidacies

                        Just "archive" ->
                            candidacies

                        Just _ ->
                            candidacies |> List.filter (not << .isDroppedOut)

                        Nothing ->
                            -- When not filter is selected, we display only active candidacy
                            candidacies |> List.filter Candidacy.isActive

                filter f field l =
                    case field model.filters of
                        Just value ->
                            List.filter (f value) l

                        Nothing ->
                            l
            in
            preFilteredCandidacies
                |> filter Candidacy.filterByWords .search
                |> filter Candidacy.filterByStatus .status
                |> viewContent context model.filters candidacies


viewContent :
    Context
    -> Filters
    -> List CandidacySummary
    -> List CandidacySummary
    -> Html Msg
viewContent context filters candidacies filteredCandidacies =
    let
        haveBothSameStatusAndNotDroppedOut : CandidacySummary -> CandidacySummary -> Bool
        haveBothSameStatusAndNotDroppedOut c1 c2 =
            c1.lastStatus.status == c2.lastStatus.status && c1.isDroppedOut == False && c2.isDroppedOut == False

        areBothDroppedOut : CandidacySummary -> CandidacySummary -> Bool
        areBothDroppedOut c1 c2 =
            c1.isDroppedOut == True && c2.isDroppedOut == True

        candidaciesByStatus : List ( CandidacySummary, List CandidacySummary )
        candidaciesByStatus =
            filteredCandidacies
                |> List.sortBy (.sentAt >> Maybe.map .posix >> Maybe.map Time.posixToMillis >> Maybe.withDefault 0 >> (*) -1)
                |> List.Extra.gatherWith (\c1 c2 -> haveBothSameStatusAndNotDroppedOut c1 c2 || areBothDroppedOut c1 c2)
                |> List.sortBy (\( c, _ ) -> Candidacy.toDirectoryPosition c)
    in
    viewMain
        (viewDirectoryPanel context candidaciesByStatus)
        (View.Candidacy.Filters.view candidacies filters context)


viewMain : List (Html msg) -> List (Html msg) -> Html msg
viewMain leftContent rightContent =
    node "main"
        [ class "grow flex h-full min-w-0 border-l-[73px] border-black bg-gray-100" ]
    <|
        [ aside
            [ class "hidden md:order-first md:flex md:flex-col flex-shrink-0"
            , class "w-full w-[780px] h-screen"
            , class "bg-white"
            ]
            leftContent
        , div [] rightContent
        ]


viewDirectoryHeader : Context -> Html Msg
viewDirectoryHeader context =
    div
        [ class "px-10 pt-10 pb-4" ]
        [ h2
            [ class "text-3xl font-black text-slate-800 mb-6" ]
            [ text "Candidatures" ]
        , p
            [ class "text-base text-gray-500" ]
            [ if Api.Token.isAdmin context.token then
                text "Recherchez par architecte de parcours, date de candidature, certification et information de contact"

              else
                text "Recherchez par date de candidature, certification et information de contact"
            ]
        , div
            [ class "my-2 flex space-x-4", action "#" ]
            [ form
                [ class "fr-search-bar w-full" ]
                [ label
                    [ for "search", class "sr-only" ]
                    [ text "Rechercher" ]
                , div
                    [ class "relative w-full" ]
                    [ div
                        [ class "absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none" ]
                        [ Icons.search
                        ]
                    , input
                        [ type_ "search"
                        , name "search"
                        , id "search"
                        , class "fr-input w-full h-12"
                        , placeholder "Rechercher"
                        , onInput UserAddedFilter
                        ]
                        []
                    ]
                ]
            ]
        ]


viewDirectoryPanel : Context -> List ( CandidacySummary, List CandidacySummary ) -> List (Html Msg)
viewDirectoryPanel context candidaciesByStatus =
    [ viewDirectoryHeader context
    , List.map (viewDirectory context) candidaciesByStatus
        |> nav
            [ dataTest "directory"
            , class "min-h-0 overflow-y-auto"
            , attribute "aria-label" "Candidats"
            ]
    ]


viewDirectory : Context -> ( CandidacySummary, List Candidacy.CandidacySummary ) -> Html Msg
viewDirectory context ( firstCandidacy, candidacies ) =
    div
        [ dataTest "directory-group", class "relative mb-2" ]
        [ div
            [ dataTest "directory-group-name"
            , class "z-10 sticky top-0 text-xl font-semibold text-slate-700"
            , class "bg-white px-10 py-3"
            ]
            [ h3 [] [ text (Candidacy.toCategoryString firstCandidacy) ] ]
        , List.map (viewItem context) (firstCandidacy :: candidacies)
            |> ul [ attribute "role" "list", class "list-none text-lg relative z-0" ]
        ]


viewItem : Context -> CandidacySummary -> Html Msg
viewItem context candidacy =
    let
        displayMaybe maybeInfo =
            Maybe.map (\s -> div [] [ text s ]) maybeInfo
                |> Maybe.withDefault (text "")
    in
    li
        [ dataTest "directory-item" ]
        [ div
            [ class "relative px-10 py-4 flex items-center space-x-6 hover:bg-gray-50"
            , class "focus-within:ring-1 focus-within:ring-inset focus-within:ring-indigo-500"
            ]
            [ div
                [ class "flex-1 min-w-0" ]
                [ a
                    [ Route.href context.baseUrl (Route.Candidacy { value = Profile, candidacyId = candidacy.id })
                    , class "focus:outline-none"
                    ]
                    [ span
                        [ class "absolute inset-0", attribute "aria-hidden" "true" ]
                        []
                    , p
                        [ class "text-blue-600 font-medium truncate"
                        , classList [ ( "italic", candidacy.certification == Nothing ) ]
                        ]
                        [ Maybe.map .label candidacy.certification
                            |> Maybe.withDefault "Certification non sélectionnée"
                            |> text
                        ]
                    , p
                        [ class "flex" ]
                        [ div [ class "flex items-center space-x-12" ]
                            [ div [ class "flex items-center space-x-2" ]
                                [ div
                                    [ class "flex-shrink-0 text-gray-600" ]
                                    [ Icons.user ]
                                , div
                                    [ class "flex text-gray-700 space-x-2" ]
                                  <|
                                    case ( candidacy.firstname, candidacy.lastname ) of
                                        ( Just firstname, Just lastname ) ->
                                            [ text firstname, text " ", text lastname ]

                                        _ ->
                                            [ displayMaybe candidacy.phone
                                            , displayMaybe candidacy.email
                                            ]
                                ]
                            , case candidacy.department of
                                Just department ->
                                    div [ class "flex items-center space-x-2" ]
                                        [ div
                                            [ class "flex-shrink-0 text-gray-600 pt-1" ]
                                            [ Icons.location ]
                                        , div
                                            []
                                            [ Data.Referential.departmentToString department |> text
                                            ]
                                        ]

                                _ ->
                                    div [] []
                            ]
                        ]
                    , div
                        [ class "flex items-end justify-between"
                        , class "text-gray-500"
                        ]
                        [ View.Candidacy.viewSentAt candidacy.sentAt
                        , case ( Api.Token.isAdmin context.token, candidacy.organism ) of
                            ( True, Just organism ) ->
                                div
                                    [ class "text-sm whitespace-nowrap" ]
                                    [ text organism.label ]

                            _ ->
                                text ""
                        ]
                    ]
                ]
            ]
        ]



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    case msg of
        GotCandidaciesResponse remoteCandidacies ->
            ( { model | state = model.state |> withCandidacies remoteCandidacies }
            , Cmd.none
            )

        UserAddedFilter search ->
            let
                filters =
                    model.filters
            in
            ( { model | filters = { filters | search = Just search } }, Cmd.none )
