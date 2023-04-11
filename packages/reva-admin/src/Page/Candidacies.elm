module Page.Candidacies exposing
    ( Model
    , Msg
    , init
    , update
    , view
    , withStatusFilter
    )

import Accessibility exposing (button, h2, h4)
import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep)
import Api.Candidacy
import Api.Token exposing (Token)
import BetaGouv.DSFR.Button as Button
import Data.Candidacy as Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Certification exposing (Certification)
import Data.Context exposing (Context)
import Data.Organism exposing (Organism)
import Data.Referential exposing (Referential)
import Html exposing (Html, aside, div, input, label, li, nav, node, p, text, ul)
import Html.Attributes exposing (action, attribute, class, classList, for, id, name, placeholder, type_)
import Html.Attributes.Extra exposing (role)
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
                [ class "border border-gray-100 p-6 mb-8" ]
                [ View.skeleton "h-4 w-120"
                , View.skeleton "my-4 h-6 w-96"
                , View.skeleton "my-4 mb-10 h-6 w-96"
                ]
    in
    case model.state.candidacies of
        NotAsked ->
            div [] []

        Loading ->
            viewMain
                [ View.skeleton "ml-3 mt-8 mb-6 h-5 w-[240px]"
                , View.skeleton "ml-5 my-6 h-5 w-[160px]"
                ]
                [ viewDirectoryHeader context
                , div
                    [ class "px-6" ]
                    [ View.skeleton "mt-2 mb-8 h-6 w-[300px]"
                    , candidacySkeleton
                    , candidacySkeleton
                    , candidacySkeleton
                    , candidacySkeleton
                    ]
                ]

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
        (View.Candidacy.Filters.view candidacies filters context)
        (viewDirectoryPanel context candidaciesByStatus)


viewMain : List (Html msg) -> List (Html msg) -> Html msg
viewMain navContent content =
    node "main"
        [ role "main"
        , class "flex relative"
        ]
        [ div [ class "bg-blue-900 w-screen inset-x absolute z-0 pb-[400px]" ] []
        , div
            [ class "z-1 relative fr-container" ]
            [ div
                [ class "fr-grid-row" ]
                [ div
                    [ class "fr-col-12 fr-col-md-4" ]
                    [ nav
                        [ role "navigation"
                        , class "hidden md:order-first md:flex md:flex-col flex-shrink-0"
                        , attribute "aria-labelledby" "fr-sidemenu-title"
                        , class "mt-12 fr-sidemenu"
                        ]
                        [ div
                            [ class "fr-sidemenu__inner"
                            , class "text-sm text-gray-600"
                            , class "min-h-[480px] bg-white shadow pl-4"
                            ]
                            navContent
                        ]
                    ]
                , div
                    [ class "mt-12 bg-white shadow"
                    , class "fr-col-12 fr-col-md-8"
                    ]
                    content
                ]
            ]
        ]


viewDirectoryHeader : Context -> Html Msg
viewDirectoryHeader context =
    div
        [ class "px-6 py-4" ]
        [ h2
            []
            [ if Api.Token.isAdmin context.token then
                text "Espace pro administrateur"

              else
                text "Espace pro architecte de parcours"
            ]
        , p
            []
            [ if Api.Token.isAdmin context.token then
                text "En tant qu’administrateur, vous pouvez gérer toutes les candidatures et faire une recherche par architecte de parcours."

              else
                text "En tant qu’architecte de parcours, vous pouvez gérer les différentes candidatures des usagers dans le cadre de leur projet professionnel."
            ]
        , div
            [ class "my-2 flex space-x-4", action "#" ]
            [ div
                [ role "search", class "fr-search-bar w-full" ]
                [ label
                    [ for "search", class "fr-label" ]
                    [ text "Rechercher" ]
                , input
                    [ type_ "search"
                    , name "search"
                    , id "search"
                    , class "fr-input w-full h-10"
                    , placeholder "Recherchez par date de candidature, certification et information de contact"
                    , onInput UserAddedFilter
                    ]
                    []
                , button
                    [ class "fr-btn sr-only", Html.Attributes.title "Rechercher" ]
                    [ text "Rechercher" ]
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
            , class "px-6"
            , attribute "aria-label" "Candidats"
            ]
    ]


viewDirectory : Context -> ( CandidacySummary, List Candidacy.CandidacySummary ) -> Html Msg
viewDirectory context ( firstCandidacy, candidacies ) =
    div
        [ dataTest "directory-group", class "relative mb-2" ]
        [ div
            [ dataTest "directory-group-name"
            , class "top-0 text-xl font-semibold text-slate-700"
            , class "bg-white"
            ]
            [ h4 [ class "mb-0" ] [ text (Candidacy.toCategoryString firstCandidacy) ] ]
        , List.map (viewItem context) (firstCandidacy :: candidacies)
            |> ul [ role "list", class "list-none pl-0 mt-0 relative z-0" ]
        ]


viewItem : Context -> CandidacySummary -> Html Msg
viewItem context candidacy =
    let
        displayMaybe maybeInfo =
            Maybe.map (\s -> div [] [ text s ]) maybeInfo
                |> Maybe.withDefault (text "")
    in
    li
        [ dataTest "directory-item", attribute "style" "--li-bottom:0" ]
        [ div
            [ class "flex-1 min-w-0" ]
            [ div
                [ class "border py-5 pl-6 pr-4 my-8" ]
                [ p
                    [ class "font-semibold truncate mb-2"
                    , classList [ ( "italic", candidacy.certification == Nothing ) ]
                    ]
                    [ Maybe.map .label candidacy.certification
                        |> Maybe.withDefault "Certification non sélectionnée"
                        |> text
                    ]
                , p
                    [ class "flex my-3" ]
                    [ div [ class "flex items-center space-x-12" ]
                        [ div [ class "flex items-center space-x-2" ]
                            [ div
                                [ class "flex space-x-2" ]
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
                                        []
                                        [ Data.Referential.departmentToString department |> text
                                        ]
                                    ]

                            _ ->
                                div [] []
                        ]
                    ]
                , div
                    [ class "flex items-end justify-between mb-2" ]
                    [ if candidacy.lastStatus.status == Admin.Enum.CandidacyStatusStep.Projet then
                        div [ class "mb-2" ] [ View.Candidacy.viewCreatedAt candidacy.createdAt ]

                      else
                        View.Candidacy.viewSentAt candidacy.sentAt
                    ]
                , div
                    [ class "flex justify-between items-end" ]
                    [ case ( Api.Token.isAdmin context.token, candidacy.organism ) of
                        ( True, Just organism ) ->
                            div
                                [ class "text-sm whitespace-nowrap" ]
                                [ text organism.label ]

                        _ ->
                            text ""
                    , Button.new { onClick = Nothing, label = "Accéder à la candidature" }
                        |> Button.linkButton (Route.toString context.baseUrl (Route.Candidacy { value = Profile, candidacyId = candidacy.id }))
                        |> Button.view
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
