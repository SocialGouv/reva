module Page.Search.Feasibilities exposing
    ( Model
    , Msg
    , init
    , update
    , view
    , withFilters
    )

import Accessibility exposing (button, h1, h2)
import Admin.Enum.FeasibilityCategoryFilter as FeasibilityCategoryFilter exposing (FeasibilityCategoryFilter)
import Admin.Enum.FeasibilityDecisionFilter as FeasibilityDecisionFilter
import Api.Feasibility
import Api.Token
import BetaGouv.DSFR.Button as Button
import BetaGouv.DSFR.Pagination
import Data.Context exposing (Context)
import Data.Feasibility exposing (FeasibilityCountByCategory, FeasibilitySummary, FeasibilitySummaryPage, feasibilityCategoryFilterToReadableString)
import Html exposing (Html, div, form, input, label, nav, p, text, ul)
import Html.Attributes exposing (attribute, class, for, id, name, placeholder, type_)
import Html.Attributes.Extra exposing (role)
import Html.Events exposing (onInput, onSubmit)
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import View
import View.Feasibility.FeasibilityCard
import View.Feasibility.Filters exposing (Filters)
import View.Helpers exposing (dataTest)


type Msg
    = GotFeasibilitiesResponse (RemoteData (List String) FeasibilitySummaryPage)
    | UserUpdatedSearch String
    | UserValidatedSearch
    | UserClearedSearch
    | GotFeasibilitiesCountByCategoryResponse (RemoteData (List String) FeasibilityCountByCategory)


type alias State =
    { currentFeasibilityPage : RemoteData (List String) FeasibilitySummaryPage
    , feasibilityCountByCategory : RemoteData (List String) FeasibilityCountByCategory
    , search : Maybe String
    }


type alias Model =
    { filters : Filters
    , state : State
    }



---


init : Context -> FeasibilityCategoryFilter -> Int -> ( Model, Cmd Msg )
init context categoryFilter page =
    let
        defaultModel : Model
        defaultModel =
            { filters = { search = Nothing, category = categoryFilter, page = page }
            , state = { currentFeasibilityPage = RemoteData.Loading, feasibilityCountByCategory = RemoteData.Loading, search = Nothing }
            }

        decisionFilter =
            FeasibilityDecisionFilter.fromString (FeasibilityCategoryFilter.toString categoryFilter)

        defaultCmd =
            Cmd.batch
                [ Api.Feasibility.getFeasibilities context.endpoint context.token GotFeasibilitiesResponse page decisionFilter defaultModel.filters.search
                , Api.Feasibility.getFeasibilityCountByCategory context.endpoint context.token GotFeasibilitiesCountByCategoryResponse
                ]
    in
    ( defaultModel, defaultCmd )



-- VIEW


view :
    Context
    -> Model
    -> Html Msg
view context model =
    let
        viewWithFilters filterContent =
            View.layout
                "Filtrer les dossiers de faisabilité par catégorie"
                filterContent
                (viewDirectoryPanel context model (feasibilityCategoryFilterToReadableString model.filters.category))
    in
    case ( context.isMobile && context.isScrollingToTop, model.state.feasibilityCountByCategory ) of
        ( _, NotAsked ) ->
            div [] []

        ( _, Loading ) ->
            viewWithFilters []

        ( True, _ ) ->
            viewWithFilters []

        ( _, Failure errors ) ->
            viewWithFilters [ div [ class "m-4 font-medium text-red-500", role "alert" ] <| List.map (\e -> div [] [ text e ]) errors ]

        ( _, Success feasibilityCountByCategory ) ->
            viewWithFilters (View.Feasibility.Filters.view feasibilityCountByCategory model.filters context)


withFilters : Context -> Int -> FeasibilityCategoryFilter -> Model -> ( Model, Cmd Msg )
withFilters context page category model =
    let
        categoryChanged =
            model.filters.category /= category

        pageChanged =
            model.filters.page /= page

        withNewCategory : Filters -> Filters
        withNewCategory filters =
            { filters | category = category }

        withNewPage : Filters -> Filters
        withNewPage filters =
            { filters | page = page }

        decisionFilter =
            FeasibilityDecisionFilter.fromString (FeasibilityCategoryFilter.toString category)

        ( newState, command ) =
            if categoryChanged || pageChanged then
                ( model.state |> withFeasibilityPage Loading
                , Api.Feasibility.getFeasibilities context.endpoint context.token GotFeasibilitiesResponse page decisionFilter model.filters.search
                )

            else
                ( model.state, Cmd.none )
    in
    ( { model
        | filters = model.filters |> withNewPage |> withNewCategory
        , state = newState
      }
    , command
    )


withFeasibilityPage : RemoteData (List String) FeasibilitySummaryPage -> State -> State
withFeasibilityPage feasibilityPage state =
    { state | currentFeasibilityPage = feasibilityPage }


withSearch : Maybe String -> State -> State
withSearch search state =
    { state | search = search }


withFeasibilityCountByCategory : RemoteData (List String) FeasibilityCountByCategory -> State -> State
withFeasibilityCountByCategory feasibilityCountByCategory state =
    { state | feasibilityCountByCategory = feasibilityCountByCategory }


viewDirectoryHeader : Html msg
viewDirectoryHeader =
    div
        [ class "sm:px-6 sm:mt-6" ]
        [ h1
            []
            [ text "Espace certificateur" ]
        ]


viewPager : Context -> Int -> Int -> FeasibilityCategoryFilter -> Html Msg
viewPager context currentPage totalPages categoryFilter =
    BetaGouv.DSFR.Pagination.view currentPage totalPages (\p -> Route.toString context.baseUrl (Route.Feasibilities (Route.FeasibilityFilters categoryFilter p)))


viewDirectoryPanel : Context -> Model -> String -> List (Html Msg)
viewDirectoryPanel context model title =
    [ if Api.Token.isAdmin context.token then
        text ""

      else
        viewDirectoryHeader
    , nav
        [ dataTest "directory"
        , class "min-h-0 overflow-y-auto mt-6"
        , class "sm:px-6"
        , attribute "aria-label" "dossiers de faisabilité"
        ]
        [ viewDirectory context model title
        , div [ class "flex justify-center" ] <|
            case model.state.currentFeasibilityPage of
                Success feasibilityPage ->
                    [ viewPager context feasibilityPage.info.currentPage feasibilityPage.info.totalPages model.filters.category ]

                _ ->
                    []
        ]
    ]


searchBar : Model -> Html Msg
searchBar model =
    div []
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
        [ dataTest "directory-group", class "relative mb-2" ]
        [ div
            [ dataTest "directory-group-name"
            , class "top-0 text-xl font-semibold text-slate-700"
            , class "bg-white text-gray-900"
            ]
            [ h2 [ class "text-3xl mb-6" ] [ text title ] ]
        , p [ class "mb-2" ] [ text "Recherchez parmi les dossiers de faisabilité" ]
        , searchBar model
        , case model.state.currentFeasibilityPage of
            Success feasibilityPage ->
                div []
                    [ searchResults model feasibilityPage.info.totalRows
                    , List.map (viewItem context) feasibilityPage.rows
                        |> ul [ class "list-none pl-0 mt-0 relative z-0" ]
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


viewItem : Context -> FeasibilitySummary -> Html Msg
viewItem context feasibilitySummary =
    View.Feasibility.FeasibilityCard.view context feasibilitySummary



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    case msg of
        GotFeasibilitiesResponse remoteFeasibilityPage ->
            ( { model | state = model.state |> withFeasibilityPage remoteFeasibilityPage }
            , Cmd.none
            )

        GotFeasibilitiesCountByCategoryResponse remoteFeasibilityCountByCategory ->
            ( { model | state = model.state |> withFeasibilityCountByCategory remoteFeasibilityCountByCategory }
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

                decisionFilter =
                    FeasibilityDecisionFilter.fromString (FeasibilityCategoryFilter.toString model.filters.category)
            in
            ( { model
                | filters = { filters | search = model.state.search, page = 1 }
                , state = model.state |> withFeasibilityPage Loading
              }
            , Api.Feasibility.getFeasibilities context.endpoint context.token GotFeasibilitiesResponse 1 decisionFilter model.state.search
            )

        UserClearedSearch ->
            let
                filters =
                    model.filters

                decisionFilter =
                    FeasibilityDecisionFilter.fromString (FeasibilityCategoryFilter.toString model.filters.category)
            in
            ( { model
                | filters = { filters | search = Nothing, page = 1 }
                , state =
                    model.state
                        |> withFeasibilityPage Loading
                        |> withSearch Nothing
              }
            , Api.Feasibility.getFeasibilities context.endpoint context.token GotFeasibilitiesResponse 1 decisionFilter Nothing
            )
