module Page.Search.Subscriptions exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Admin.Enum.SubscriptionRequestStatus as SubscriptionRequestStatus exposing (SubscriptionRequestStatus(..))
import Api.Subscription
import Api.Token
import BetaGouv.DSFR.Button as Button
import BetaGouv.DSFR.Pagination
import Data.Context exposing (Context)
import Data.Subscription exposing (SubscriptionSummary, SubscriptionSummaryPage)
import Html exposing (Html, a, button, div, form, h2, h4, input, label, li, p, text, ul)
import Html.Attributes exposing (attribute, class, classList, for, id, name, placeholder, type_)
import Html.Attributes.Extra exposing (role)
import Html.Events exposing (onInput, onSubmit)
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import View
import View.Date exposing (toFullFormat)
import View.Helpers exposing (dataTest)


type Msg
    = GotSubscriptionsResponse (RemoteData (List String) SubscriptionSummaryPage)
    | ClickedViewMore String
    | UserUpdatedSearch String
    | UserValidatedSearch
    | UserClearedSearch


type alias State =
    { subscriptions : RemoteData (List String) SubscriptionSummaryPage
    , errors : List String
    , search : Maybe String
    }


type alias Filters =
    { page : Int, status : SubscriptionRequestStatus, search : Maybe String }


type alias Model =
    { state : State
    , filters : Filters
    }


init : Context -> SubscriptionRequestStatus -> Int -> ( Model, Cmd Msg )
init context statusFilter page =
    let
        defaultModel : Model
        defaultModel =
            { state =
                { subscriptions = RemoteData.Loading
                , errors = []
                , search = Nothing
                }
            , filters = { page = page, status = statusFilter, search = Nothing }
            }

        defaultCmd =
            Api.Subscription.getSubscriptions context.endpoint context.token GotSubscriptionsResponse page statusFilter defaultModel.filters.search
    in
    ( defaultModel, defaultCmd )



-- VIEW


view :
    Context
    -> Model
    -> Html Msg
view context model =
    let
        subscriptionSkeleton =
            div
                []
                [ View.skeleton "h-4 w-120"
                , View.skeleton "mt-2 mb-12 h-12 w-96"
                ]
    in
    case model.state.subscriptions of
        NotAsked ->
            div [] []

        Loading ->
            View.layout
                ""
                [ viewFilterLinks context model.filters.status
                ]
                [ viewDirectoryHeader context 0 model
                , div
                    [ class "py-3 px-10" ]
                    [ View.skeleton "mb-10 h-6 w-56"
                    , subscriptionSkeleton
                    , subscriptionSkeleton
                    , subscriptionSkeleton
                    , subscriptionSkeleton
                    ]
                ]

        Failure errors ->
            View.errors errors

        Success subscriptions ->
            subscriptions
                |> viewContent context model.state.errors model


viewContent :
    Context
    -> List String
    -> Model
    -> SubscriptionSummaryPage
    -> Html Msg
viewContent context actionErrors model subscriptionPage =
    View.layout
        ""
        [ viewFilterLinks context model.filters.status
        ]
        (viewDirectoryPanel context subscriptionPage model actionErrors)


viewDirectoryHeader :
    Context
    -> Int
    -> Model
    -> Html Msg
viewDirectoryHeader context waitingSubscriptionsCount model =
    let
        statusString =
            case model.filters.status of
                Pending ->
                    "en attente"

                Rejected ->
                    "refusées"
    in
    div
        [ class "px-6 mt-6 pb-4" ]
        [ h2
            [ class "text-4xl" ]
            [ if Api.Token.isAdmin context.token then
                text "Espace pro administrateur"

              else
                text "Espace pro architecte de parcours"
            ]
        , p
            []
            [ text "En tant qu'administrateur des conseillers, vous avez la possibilité d'ajouter ou d'accepter de nouveaux architecte de\n                        parcours ou certificateur." ]
        , h4
            [ class "mb-2" ]
            [ text
                ("Inscriptions "
                    ++ statusString
                    ++ " ("
                    ++ String.fromInt waitingSubscriptionsCount
                    ++ ")"
                )
            ]
        , searchBar model
        , searchResults model waitingSubscriptionsCount
        ]


viewDirectoryPanel : Context -> SubscriptionSummaryPage -> Model -> List String -> List (Html Msg)
viewDirectoryPanel context subscriptionSummaryPage model actionErrors =
    [ viewDirectoryHeader context subscriptionSummaryPage.info.totalRows model
    , List.map (viewItem context) subscriptionSummaryPage.rows
        |> ul
            [ dataTest "directory"
            , class "min-h-0 overflow-y-auto mx-8 px-0"
            , attribute "aria-label" "Inscriptions"
            ]
    , div [ class "flex justify-center" ] [ viewPager context subscriptionSummaryPage.info.currentPage subscriptionSummaryPage.info.totalPages model.filters.status ]
    , View.popupErrors actionErrors
    ]


viewPager : Context -> Int -> Int -> SubscriptionRequestStatus -> Html Msg
viewPager context currentPage totalPages statusFilter =
    BetaGouv.DSFR.Pagination.view currentPage totalPages (\p -> Route.toString context.baseUrl (Route.Subscriptions { status = statusFilter, page = p }))


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


withSubscriptionPage : RemoteData (List String) SubscriptionSummaryPage -> State -> State
withSubscriptionPage subscriptionPage state =
    { state | subscriptions = subscriptionPage }


withSearch : Maybe String -> State -> State
withSearch search state =
    { state | search = search }


viewItem : Context -> SubscriptionSummary -> Html Msg
viewItem context subscription =
    li
        [ dataTest "directory-item"
        , class "list-none mb-4"
        ]
        [ div
            [ class "relative p-6 bg-neutral-100 flex hover:bg-gray-50"
            , class "focus-within:ring-1 focus-within:ring-inset focus-within:ring-indigo-500"
            ]
            [ div [ class "flex flex-col text-sm mb-2" ]
                [ p [ class "font-bold mb-0" ] [ text "Raison sociale de la structure" ]
                , p [] [ text subscription.companyName ]
                , p [ class "font-bold mb-0" ] [ text "Date d'envoi de l'inscription" ]
                , p [] [ text (toFullFormat subscription.createdAt) ]
                ]
            , div
                [ class "flex items-center space-x-4 ml-auto mt-auto" ]
                [ Button.new { onClick = Nothing, label = "Voir plus" }
                    |> Button.primary
                    |> Button.linkButton (Route.toString context.baseUrl <| Route.Subscription subscription.id)
                    |> Button.view
                ]
            ]
        ]



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    case msg of
        GotSubscriptionsResponse remoteSubscriptions ->
            ( model, Cmd.none ) |> withSubscriptions remoteSubscriptions

        ClickedViewMore id ->
            ( model, Cmd.none )

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
                , state = model.state |> withSubscriptionPage Loading
              }
            , Api.Subscription.getSubscriptions context.endpoint context.token GotSubscriptionsResponse 1 model.filters.status model.state.search
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
                        |> withSubscriptionPage Loading
                        |> withSearch Nothing
              }
            , Api.Subscription.getSubscriptions context.endpoint context.token GotSubscriptionsResponse 1 model.filters.status Nothing
            )


withErrors : List String -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
withErrors errors ( model, cmd ) =
    let
        state =
            model.state
    in
    ( { model | state = { state | errors = errors } }, cmd )


withSubscriptions : RemoteData (List String) SubscriptionSummaryPage -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
withSubscriptions subscriptions ( model, cmd ) =
    let
        state =
            model.state
    in
    ( { model | state = { state | subscriptions = subscriptions } }, cmd )


viewFilterLinks : Context -> SubscriptionRequestStatus -> Html msg
viewFilterLinks context statusFilter =
    ul
        []
        [ viewFilterLink context statusFilter SubscriptionRequestStatus.Pending "Inscriptions en attente"
        , viewFilterLink context statusFilter SubscriptionRequestStatus.Rejected "Inscriptions refusées"
        ]


viewFilterLink : Context -> SubscriptionRequestStatus -> SubscriptionRequestStatus -> String -> Html msg
viewFilterLink context currentStatus linkStatus label =
    let
        isSelected =
            currentStatus == linkStatus
    in
    li
        []
        [ a
            [ class "block group mb-4 py-1 px-2"
            , class "flex items-start justify-between transition"
            , class "border-l-2 border-transparent"
            , classList
                [ ( "text-blue-900 border-blue-900"
                  , isSelected
                  )
                , ( "hover:text-blue-900"
                  , not isSelected
                  )
                ]
            , Route.href context.baseUrl <|
                Route.Subscriptions { status = linkStatus, page = 1 }
            ]
            [ text label ]
        ]
