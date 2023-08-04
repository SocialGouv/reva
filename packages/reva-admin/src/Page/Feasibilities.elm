module Page.Feasibilities exposing
    ( Model
    , Msg
    , init
    , update
    , view
    , withFilters
    )

import Accessibility exposing (h1, h2)
import Admin.Enum.FeasibilityCategoryFilter as FeasibilityCategoryFilter exposing (FeasibilityCategoryFilter)
import Admin.Enum.FeasibilityStatusFilter as FeasibilityStatusFilter exposing (FeasibilityStatusFilter)
import Api.Feasibility
import BetaGouv.DSFR.Pagination
import Data.Context exposing (Context)
import Data.Feasibility exposing (FeasibilityCountByCategory, FeasibilitySummary, FeasibilitySummaryPage, feasibilityCategoryFilterToReadableString)
import Html exposing (Html, div, nav, p, text, ul)
import Html.Attributes exposing (attribute, class)
import Html.Attributes.Extra exposing (role)
import RemoteData exposing (RemoteData(..))
import Route exposing (FeasibilityFilters)
import String exposing (String)
import View
import View.Feasibility.FeasibilityCard
import View.Feasibility.Filters
import View.Helpers exposing (dataTest)


type Msg
    = GotFeasibilitiesResponse (RemoteData (List String) FeasibilitySummaryPage)
    | GotFeasibilitiesCountByCategoryResponse (RemoteData (List String) FeasibilityCountByCategory)


type alias State =
    { currentFeasibilityPage : RemoteData (List String) FeasibilitySummaryPage
    , feasibilityCountByCategory : RemoteData (List String) FeasibilityCountByCategory
    }


type alias Model =
    { filters : FeasibilityFilters
    , state : State
    }



---


withFilters : Context -> Int -> FeasibilityCategoryFilter -> Model -> ( Model, Cmd Msg )
withFilters context page category model =
    let
        categoryChanged =
            model.filters.category /= category

        pageChanged =
            model.filters.page /= page

        withNewCategory : FeasibilityFilters -> FeasibilityFilters
        withNewCategory filters =
            { filters | category = category }

        withNewPage : FeasibilityFilters -> FeasibilityFilters
        withNewPage filters =
            { filters | page = page }

        statusFilter =
            FeasibilityStatusFilter.fromString (FeasibilityCategoryFilter.toString category)

        ( newState, command ) =
            if categoryChanged || pageChanged then
                ( model.state |> withFeasibilityPage Loading
                , Api.Feasibility.getFeasibilities context.endpoint context.token GotFeasibilitiesResponse page statusFilter
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


init : Context -> FeasibilityCategoryFilter -> Int -> ( Model, Cmd Msg )
init context categoryFilter page =
    let
        defaultModel : Model
        defaultModel =
            { filters = { category = categoryFilter, page = page }
            , state = { currentFeasibilityPage = RemoteData.Loading, feasibilityCountByCategory = RemoteData.Loading }
            }

        statusFilter =
            FeasibilityStatusFilter.fromString (FeasibilityCategoryFilter.toString categoryFilter)

        defaultCmd =
            Cmd.batch
                [ Api.Feasibility.getFeasibilities context.endpoint context.token GotFeasibilitiesResponse page statusFilter
                , Api.Feasibility.getFeasibilityCountByCategory context.endpoint context.token GotFeasibilitiesCountByCategoryResponse
                ]
    in
    ( defaultModel, defaultCmd )


withFeasibilityPage : RemoteData (List String) FeasibilitySummaryPage -> State -> State
withFeasibilityPage feasibilityPage state =
    { state | currentFeasibilityPage = feasibilityPage }


withFeasibilityCountByCategory : RemoteData (List String) FeasibilityCountByCategory -> State -> State
withFeasibilityCountByCategory feasibilityCountByCategory state =
    { state | feasibilityCountByCategory = feasibilityCountByCategory }



-- VIEW


view :
    Context
    -> Model
    -> Html Msg
view context model =
    let
        upperNavContent =
            []

        viewWithFilters filterContent =
            View.layout
                "Filtrer les dossiers de faisabilité par catégorie"
                upperNavContent
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


viewDirectoryHeader : Html msg
viewDirectoryHeader =
    div
        [ class "sm:px-6 sm:mt-6" ]
        [ h1
            []
            [ text "Espace certificateur"
            ]
        ]


viewPager : Context -> Int -> Int -> FeasibilityCategoryFilter -> Html Msg
viewPager context currentPage totalPages categoryFilter =
    BetaGouv.DSFR.Pagination.view currentPage totalPages (\p -> Route.toString context.baseUrl (Route.Feasibilities (Route.FeasibilityFilters categoryFilter p)))


viewDirectoryPanel : Context -> Model -> String -> List (Html Msg)
viewDirectoryPanel context model title =
    [ viewDirectoryHeader
    , nav
        [ dataTest "directory"
        , class "min-h-0 overflow-y-auto"
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


viewDirectory : Context -> Model -> String -> Html Msg
viewDirectory context model title =
    div
        [ dataTest "directory-group", class "relative mb-2" ]
        [ div
            [ dataTest "directory-group-name"
            , class "top-0 text-xl font-semibold text-slate-700"
            , class "bg-white text-gray-900"
            ]
            [ h2 [ class "mb-6" ] [ text title ] ]
        , case model.state.currentFeasibilityPage of
            Success feasibilityPage ->
                div []
                    [ List.map (viewItem context) feasibilityPage.rows
                        |> ul [ class "list-none pl-0 mt-0 relative z-0" ]
                    ]

            Failure error ->
                div [ class "my-2 font-medium text-red-500", role "alert" ] <| List.map (\e -> div [] [ text e ]) error

            _ ->
                div []
                    [ View.skeleton "mt-5 mb-3 h-5 w-60"
                    , View.skeleton
                        "h-10 w-48"
                    , View.skeleton "mt-8 h-[198px] w-full"
                    , View.skeleton "mt-8 h-[198px] w-full"
                    ]
        ]


viewItem : Context -> FeasibilitySummary -> Html Msg
viewItem context feasibilitySummary =
    View.Feasibility.FeasibilityCard.view context feasibilitySummary



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update _ msg model =
    case msg of
        GotFeasibilitiesResponse remoteFeasibilityPage ->
            ( { model | state = model.state |> withFeasibilityPage remoteFeasibilityPage }
            , Cmd.none
            )

        GotFeasibilitiesCountByCategoryResponse remoteFeasibilityCountByCategory ->
            ( { model | state = model.state |> withFeasibilityCountByCategory remoteFeasibilityCountByCategory }
            , Cmd.none
            )
