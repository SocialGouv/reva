module Page.Subscriptions exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Api.Subscription
import Data.Context exposing (Context)
import Data.Subscription as Subscription exposing (SubscriptionSummary)
import Html exposing (Html, a, aside, div, h2, li, node, p, span, text, ul)
import Html.Attributes exposing (attribute, class)
import RemoteData exposing (RemoteData(..))
import String exposing (String)
import View
import View.Helpers exposing (dataTest)
import View.Icons as Icons
import View.Subscription.Filters exposing (Filters)


type Msg
    = GotSubscriptionsResponse (RemoteData String (List SubscriptionSummary))
    | UserAddedFilter String


type alias State =
    { subscriptions : RemoteData String (List SubscriptionSummary)
    }


type alias Model =
    { filters : Filters
    , state : State
    }


init : Context -> Maybe String -> ( Model, Cmd Msg )
init context maybeStatusFilters =
    let
        defaultModel : Model
        defaultModel =
            { filters = { search = Nothing }
            , state = { subscriptions = RemoteData.Loading }
            }

        defaultCmd =
            Api.Subscription.getSubscriptions context.endpoint context.token GotSubscriptionsResponse
    in
    ( defaultModel, defaultCmd )


withSubscriptions : RemoteData String (List SubscriptionSummary) -> State -> State
withSubscriptions subscriptions state =
    { state | subscriptions = subscriptions }



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
            viewMain
                [ viewDirectoryHeader context
                , div
                    [ class "py-3 px-10" ]
                    [ View.skeleton "mb-10 h-6 w-56"
                    , subscriptionSkeleton
                    , subscriptionSkeleton
                    , subscriptionSkeleton
                    , subscriptionSkeleton
                    ]
                ]
                [ View.skeleton "ml-10 mt-8 bg-gray-200 mt-6 h-10 w-[353px]" ]

        Failure errors ->
            div [ class "text-red-500" ] [ text errors ]

        Success subscriptions ->
            let
                filter f field l =
                    case field model.filters of
                        Just value ->
                            List.filter (f value) l

                        Nothing ->
                            l
            in
            subscriptions
                |> filter Subscription.filterByWords .search
                |> viewContent context model.filters subscriptions


viewContent :
    Context
    -> Filters
    -> List SubscriptionSummary
    -> List SubscriptionSummary
    -> Html Msg
viewContent context filters subscriptions filteredSubscriptions =
    viewMain
        (viewDirectoryPanel context filteredSubscriptions)
        []


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
            [ text "Inscriptions en attente" ]
        , p
            []
            [ text "En tant que administrateur des conseillers, vous avez la possibilité d'ajouter ou d'accepter de nouveaux architecte de\n                        parcours ou certificateur." ]
        ]


viewDirectoryPanel : Context -> List SubscriptionSummary -> List (Html Msg)
viewDirectoryPanel context subscriptionsByStatus =
    [ viewDirectoryHeader context
    , List.map (viewItem context) subscriptionsByStatus
        |> ul
            [ dataTest "directory"
            , class "min-h-0 overflow-y-auto"
            , attribute "aria-label" "Candidats"
            ]
    ]


viewItem : Context -> SubscriptionSummary -> Html Msg
viewItem context subscription =
    li
        [ dataTest "directory-item" ]
        [ div
            [ class "relative px-10 py-4 flex items-center space-x-6 hover:bg-gray-50"
            , class "focus-within:ring-1 focus-within:ring-inset focus-within:ring-indigo-500"
            ]
            [ div
                [ class "flex-1 min-w-0" ]
                [ a
                    [ class "focus:outline-none" ]
                    [ span
                        [ class "absolute inset-0", attribute "aria-hidden" "true" ]
                        []
                    , p
                        [ class "text-blue-600 font-medium truncate"
                        ]
                        [ text subscription.companyName
                        , text " - "
                        , text subscription.companyAddress
                        ]
                    , p
                        [ class "flex" ]
                        [ div
                            [ class "flex items-center space-x-12" ]
                            [ div
                                [ class "flex items-center space-x-2" ]
                                [ div
                                    [ class "flex-shrink-0 text-gray-600" ]
                                    [ Icons.user ]
                                , div
                                    [ class "flex text-gray-700 space-x-2" ]
                                    [ text subscription.accountFirstname, text " ", text subscription.accountLastname ]
                                ]
                            , div
                                [ class "flex items-center space-x-2" ]
                                [ div
                                    [ class "flex-shrink-0 text-gray-600 pt-1" ]
                                    [ Icons.location ]
                                , text subscription.accountEmail
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    case msg of
        GotSubscriptionsResponse remoteSubscriptions ->
            ( { model | state = model.state |> withSubscriptions remoteSubscriptions }
            , Cmd.none
            )

        UserAddedFilter search ->
            let
                filters =
                    model.filters
            in
            ( { model | filters = { filters | search = Just search } }, Cmd.none )
