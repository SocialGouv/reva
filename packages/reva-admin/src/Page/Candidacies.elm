module Page.Candidacies exposing
    ( Model
    , Msg
    , init
    , update
    , view
    , withFilters
    )

import Accessibility exposing (a, button, h1, h2, h3)
import Admin.Enum.CandidacyStatusFilter exposing (CandidacyStatusFilter)
import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep)
import Api.Candidacy
import Api.Token exposing (Token)
import BetaGouv.DSFR.Button as Button
import BetaGouv.DSFR.Pagination
import Data.Candidacy exposing (CandidacyCountByStatus, CandidacySummary, CandidacySummaryPage, candidacyStatusFilterToReadableString)
import Data.Certification exposing (Certification)
import Data.Context exposing (Context)
import Data.Organism exposing (Organism)
import Data.Referential exposing (Referential)
import Html exposing (Html, div, form, input, label, li, nav, p, text, ul)
import Html.Attributes exposing (attribute, class, classList, for, href, id, name, placeholder, target, type_)
import Html.Attributes.Extra exposing (role)
import Html.Events exposing (onInput, onSubmit)
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import View
import View.Candidacy
import View.Candidacy.Filters exposing (Filters)
import View.Candidacy.Tab exposing (Value(..))
import View.Helpers exposing (dataTest)


type Msg
    = GotCandidaciesResponse (RemoteData (List String) CandidacySummaryPage)
    | UserUpdatedSearch String
    | UserValidatedSearch
    | UserClearedSearch
    | GotCandidacyCountByStatus (RemoteData (List String) CandidacyCountByStatus)


type alias State =
    { currentCandidacyPage : RemoteData (List String) CandidacySummaryPage
    , candidacyCountByStatus : RemoteData (List String) CandidacyCountByStatus
    , search : Maybe String
    }


type alias Model =
    { filters : Filters
    , state : State
    }


withFilters : Context -> Int -> CandidacyStatusFilter -> Model -> ( Model, Cmd Msg )
withFilters context page status model =
    let
        statusChanged =
            model.filters.status /= status

        pageChanged =
            model.filters.page /= page

        withNewStatus : Filters -> Filters
        withNewStatus filters =
            { filters | status = status }

        withNewPage : Filters -> Filters
        withNewPage filters =
            { filters | page = page }

        ( newState, command ) =
            if statusChanged || pageChanged then
                ( model.state |> withCandidacyPage Loading
                , Api.Candidacy.getCandidacies context.endpoint context.token GotCandidaciesResponse page (Just status) model.filters.search
                )

            else
                ( model.state, Cmd.none )
    in
    ( { model
        | filters = model.filters |> withNewPage |> withNewStatus
        , state = newState
      }
    , command
    )


init : Context -> CandidacyStatusFilter -> Int -> ( Model, Cmd Msg )
init context statusFilter page =
    let
        defaultModel : Model
        defaultModel =
            { filters = { search = Nothing, status = statusFilter, page = page }
            , state = { currentCandidacyPage = RemoteData.Loading, candidacyCountByStatus = RemoteData.Loading, search = Nothing }
            }

        defaultCmd =
            Cmd.batch
                [ Api.Candidacy.getCandidacies context.endpoint context.token GotCandidaciesResponse page (Just statusFilter) defaultModel.filters.search
                , Api.Candidacy.getCandidacyCountByStatus context.endpoint context.token defaultModel.filters.search GotCandidacyCountByStatus
                ]
    in
    ( defaultModel, defaultCmd )


withCandidacyPage : RemoteData (List String) CandidacySummaryPage -> State -> State
withCandidacyPage candidacyPage state =
    { state | currentCandidacyPage = candidacyPage }


withSearch : Maybe String -> State -> State
withSearch search state =
    { state | search = search }


withCandidacyCountByStatus : RemoteData (List String) CandidacyCountByStatus -> State -> State
withCandidacyCountByStatus candidacyCountByStatus state =
    { state | candidacyCountByStatus = candidacyCountByStatus }



-- VIEW


view :
    Context
    -> Model
    -> Html Msg
view context model =
    let
        viewWithFilters filterContent =
            View.layout
                filterByStatusTitle
                (filterContent ++ [ organismHelp ])
                (viewDirectoryPanel context model (candidacyStatusFilterToReadableString model.filters.status))
    in
    case ( context.isMobile && context.isScrollingToTop, model.state.candidacyCountByStatus ) of
        ( _, NotAsked ) ->
            div [] []

        ( _, Loading ) ->
            viewWithFilters []

        ( True, _ ) ->
            viewWithFilters []

        ( _, Failure errors ) ->
            viewWithFilters [ div [ class "m-4 font-medium text-red-500", role "alert" ] <| List.map (\e -> div [] [ text e ]) errors ]

        ( _, Success candidacyCountByStatus ) ->
            viewWithFilters (View.Candidacy.Filters.view candidacyCountByStatus model.filters context)


filterByStatusTitle : String
filterByStatusTitle =
    "Filtrer les candidatures par statut"


organismHelp : Html msg
organismHelp =
    let
        item s link =
            li
                [ class "my-4" ]
                [ a
                    [ class "hover:text-blue-900"
                    , href link
                    , target "_blank"
                    ]
                    [ text s ]
                ]
    in
    div
        [ class "hidden sm:block"
        , class "mt-2 mr-8 pl-3 pt-6 border-t"
        ]
        [ h3
            [ class "text-lg mt-1 mb-0" ]
            [ text "Notre aide en ligne" ]
        , ul
            []
            [ item "Espace documentaire" "https://france-vae.info/"
            , item "Cahier des charges AAP" "https://france-vae.info/Cahier-des-charges-ea8790303ab447cfb25b5c11c26b0d67"
            , item "Centre d’aide" "https://reva.crisp.help/fr/"
            , item "FAQ AAP" "https://reva.crisp.help/fr/category/architectes-accompagnateurs-de-parcours-1oikyam/"
            , item "Calendrier des webinaires" "https://france-vae.info/82b7cdf15d7b45d1830c8b1024ddfa8c?v=3a2fe0a672f34db9900d7f0bb3ab598f"
            ]
        ]


viewDirectoryHeader : Context -> Html Msg
viewDirectoryHeader context =
    div
        [ class "sm:px-6 sm:mt-6" ]
        [ h1
            []
            [ if Api.Token.isAdmin context.token then
                text "Espace Professionnel - Administrateur"

              else
                text "Espace Professionnel - Architecte Accompagnateur de parcours"
            ]
        , p
            [ class "text-xl" ]
            [ if Api.Token.isAdmin context.token then
                text "En tant qu’administrateur, vous pouvez gérer toutes les candidatures et faire une recherche par architecte de parcours."

              else
                text "En tant qu’architecte accompagnateur de parcours, vous pouvez gérer les différentes candidatures des usagers dans le cadre de leur projet professionnel."
            ]
        ]


viewPager : Context -> Int -> Int -> CandidacyStatusFilter -> Html Msg
viewPager context currentPage totalPages statusFilter =
    BetaGouv.DSFR.Pagination.view currentPage totalPages (\p -> Route.toString context.baseUrl (Route.Candidacies (Route.CandidacyFilters statusFilter p)))


viewDirectoryPanel : Context -> Model -> String -> List (Html Msg)
viewDirectoryPanel context model title =
    [ viewDirectoryHeader context
    , nav
        [ dataTest "directory"
        , class "min-h-0 overflow-y-auto"
        , class "sm:px-6"
        , attribute "aria-label" "Candidats"
        ]
        [ viewDirectory context model title
        , div [ class "flex justify-center" ] <|
            case model.state.currentCandidacyPage of
                Success candidacyPage ->
                    [ viewPager context candidacyPage.info.currentPage candidacyPage.info.totalPages model.filters.status ]

                _ ->
                    []
        ]
    ]


searchBar : Model -> Html Msg
searchBar model =
    div [ class "mt-6" ]
        [ form
            [ onSubmit UserValidatedSearch ]
            [ label
                [ for "search", class "fr-hint-text mb-1" ]
                [ text "" ]
            , div
                [ role "search", class "fr-search-bar w-full" ]
                [ input
                    [ type_ "search"
                    , name "search"
                    , name "search"
                    , id "search"
                    , class "fr-input w-full h-10"
                    , placeholder "Rechercher"
                    , onInput UserUpdatedSearch
                    , Html.Attributes.value <| Maybe.withDefault "" model.state.search
                    ]
                    []
                , button
                    [ type_ "submit"
                    , class "fr-btn"
                    , Html.Attributes.title "Rechercher"
                    ]
                    [ text "Rechercher" ]
                ]
            ]
        ]


searchResults : Model -> Int -> Html Msg
searchResults model totalRows =
    let
        countString =
            if totalRows > 1 then
                String.fromInt totalRows ++ " résultats"

            else
                String.fromInt totalRows ++ " résultat"

        defaultSearchInfo search =
            [ text <| countString ++ " pour « " ++ search ++ " »"
            , Button.new { label = "Réinitialiser le filtre", onClick = Just UserClearedSearch }
                |> Button.secondary
                |> Button.withAttrs [ class "block mt-2" ]
                |> Button.view
            ]
    in
    div [ class "mt-4 text-xl font-semibold" ] <|
        case model.filters.search of
            Just "" ->
                [ text countString ]

            Nothing ->
                [ text countString ]

            Just search ->
                defaultSearchInfo search


viewDirectory : Context -> Model -> String -> Html Msg
viewDirectory context model title =
    div
        [ class "relative mb-2" ]
        [ div
            [ dataTest "directory-group-name"
            , class "top-0 text-xl font-semibold text-slate-700"
            , class "bg-white text-gray-900"
            ]
            [ h2 [ class "mb-0" ] [ text title ] ]
        , searchBar model
        , case model.state.currentCandidacyPage of
            Success candidacyPage ->
                div []
                    [ searchResults model candidacyPage.info.totalRows
                    , List.map (viewItem context) candidacyPage.rows
                        |> ul
                            [ dataTest "directory-group"
                            , class "list-none pl-0 mt-0 relative z-0"
                            ]
                    ]

            Failure error ->
                div [ class "my-2 font-medium text-red-500", role "alert" ] <| List.map (\e -> div [] [ text e ]) error

            _ ->
                div []
                    [ View.skeleton "mt-5 mb-3 h-5 w-60"
                    , case model.filters.search of
                        Just "" ->
                            text ""

                        Nothing ->
                            text ""

                        _ ->
                            View.skeleton "h-10 w-48"
                    , View.skeleton "mt-8 h-[198px] w-full"
                    , View.skeleton "mt-8 h-[198px] w-full"
                    ]
        ]


viewItem : Context -> CandidacySummary -> Html Msg
viewItem context candidacy =
    let
        candidatureName =
            case ( candidacy.firstname, candidacy.lastname ) of
                ( Just firstname, Just lastname ) ->
                    String.concat [ firstname, " ", lastname ]

                _ ->
                    Maybe.withDefault "" candidacy.email
    in
    li
        [ dataTest "directory-item", attribute "style" "--li-bottom:0" ]
        [ div
            [ class "text-lg flex-1 min-w-0" ]
            [ div
                [ class "border py-5 pl-6 pr-4 my-8" ]
                [ h3
                    [ class "text-xl font-semibold truncate mb-2"
                    , classList [ ( "italic", candidacy.certification == Nothing ) ]
                    ]
                    [ Maybe.map .label candidacy.certification
                        |> Maybe.withDefault "Certification non sélectionnée"
                        |> text
                    ]
                , p
                    [ class "text-lg flex my-3" ]
                    [ div [ class "flex items-center space-x-12" ]
                        [ div [ class "flex items-center space-x-2" ]
                            [ div
                                [ class "flex space-x-2" ]
                                [ text candidatureName ]
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
                    [ class "sm:flex justify-between items-end" ]
                    [ case ( Api.Token.isAdmin context.token, candidacy.organism ) of
                        ( True, Just organism ) ->
                            div
                                [ class "my-4 sm:my-0"
                                , class "text-base text-gray-500 whitespace-nowrap"
                                ]
                                [ text organism.label ]

                        _ ->
                            div [] []
                    , Button.new { onClick = Nothing, label = "Accéder à la candidature" }
                        |> Button.linkButton (Route.toString context.baseUrl (Route.Candidacy { value = Profile, candidacyId = candidacy.id }))
                        |> Button.withAttrs [ attribute "title" ("Accéder à la candidature de " ++ candidatureName) ]
                        |> Button.view
                    ]
                ]
            ]
        ]



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    case msg of
        GotCandidaciesResponse remoteCandidacyPage ->
            ( { model | state = model.state |> withCandidacyPage remoteCandidacyPage }
            , Cmd.none
            )

        UserUpdatedSearch search ->
            let
                state =
                    model.state
            in
            ( { model | state = { state | search = Just search } }, Cmd.none )

        UserValidatedSearch ->
            let
                filters =
                    model.filters
            in
            ( { model
                | filters = { filters | search = model.state.search, page = 1 }
                , state = model.state |> withCandidacyPage Loading
              }
            , Cmd.batch
                [ Api.Candidacy.getCandidacies context.endpoint context.token GotCandidaciesResponse 1 (Just model.filters.status) model.state.search
                , Api.Candidacy.getCandidacyCountByStatus context.endpoint context.token model.state.search GotCandidacyCountByStatus
                ]
            )

        UserClearedSearch ->
            let
                filters =
                    model.filters
            in
            ( { model
                | filters = { filters | search = Nothing, page = 1 }
                , state =
                    model.state
                        |> withCandidacyPage Loading
                        |> withSearch Nothing
              }
            , Cmd.batch
                [ Api.Candidacy.getCandidacies context.endpoint context.token GotCandidaciesResponse 1 (Just model.filters.status) Nothing
                , Api.Candidacy.getCandidacyCountByStatus context.endpoint context.token Nothing GotCandidacyCountByStatus
                ]
            )

        GotCandidacyCountByStatus remoteCandidacyCountByStatus ->
            ( { model | state = model.state |> withCandidacyCountByStatus remoteCandidacyCountByStatus }
            , Cmd.none
            )
