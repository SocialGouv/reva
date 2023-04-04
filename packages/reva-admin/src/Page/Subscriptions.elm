module Page.Subscriptions exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Api.Subscription
import Api.Token
import BetaGouv.DSFR.Button as Button
import Data.Context exposing (Context)
import Data.Subscription as Subscription exposing (SubscriptionSummary)
import Html exposing (Html, aside, button, div, h2, h4, li, node, p, text, ul)
import Html.Attributes exposing (attribute, class, type_)
import Html.Events exposing (onClick)
import RemoteData exposing (RemoteData(..))
import String exposing (String)
import View
import View.Date exposing (toFullFormat)
import View.Helpers exposing (dataTest)
import View.Subscription.Filters exposing (Filters)


type Msg
    = GotSubscriptionsResponse (RemoteData String (List SubscriptionSummary))
    | UserAddedFilter String
    | ClickedValidation String
    | ClickedRejection String
    | GotValidationResponse (RemoteData String String)
    | GotRejectionResponse (RemoteData String String)


type alias State =
    { subscriptions : RemoteData String (List SubscriptionSummary)
    , errors : Maybe (List String)
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
            , state =
                { subscriptions = RemoteData.Loading
                , errors = Nothing
                }
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
                [ viewDirectoryHeader context 0
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
                |> viewContent context model.filters subscriptions model.state.errors


viewContent :
    Context
    -> Filters
    -> List SubscriptionSummary
    -> Maybe (List String)
    -> List SubscriptionSummary
    -> Html Msg
viewContent context filters subscriptions actionErrors filteredSubscriptions =
    viewMain
        (viewDirectoryPanel context filteredSubscriptions actionErrors)
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


viewDirectoryHeader : Context -> Int -> Html Msg
viewDirectoryHeader context waitingSubscriptionsCount =
    div
        [ class "px-10 pt-10 pb-4" ]
        [ h2
            []
            [ if Api.Token.isAdmin context.token then
                text "Espace pro administrateur"

              else
                text "Espace pro architecte de parcours"
            ]
        , p
            []
            [ text "En tant que administrateur des conseillers, vous avez la possibilité d'ajouter ou d'accepter de nouveaux architecte de\n                        parcours ou certificateur." ]
        , h4
            [ class "mb-2" ]
            [ text
                ("Inscriptions en attente ("
                    ++ String.fromInt waitingSubscriptionsCount
                    ++ ")"
                )
            ]
        ]


viewErrorItem : String -> Html Msg
viewErrorItem error =
    li
        []
        [ text error ]



--viewErrorsPanel : List String -> Html Msg


viewErrorsPanel errors =
    --div [ class "text-red-500" ] [ text errors ]
    div [ class "text-red-500" ]
        [ List.map viewErrorItem errors
            |> ul
                [ class "px-10 pt-10 pb-4"
                , attribute "aria-label" "Errors"
                ]
        ]


viewDirectoryPanel : Context -> List SubscriptionSummary -> Maybe (List String) -> List (Html Msg)
viewDirectoryPanel context subscriptionsByStatus actionErrors =
    [ viewDirectoryHeader context (List.length subscriptionsByStatus)
    , List.map (viewItem context) subscriptionsByStatus
        |> ul
            [ dataTest "directory"
            , class "min-h-0 overflow-y-auto mx-10 px-0"
            , attribute "aria-label" "Inscriptions"
            ]
    , viewErrorsPanel (Maybe.withDefault [] actionErrors)
    ]


viewItem : Context -> SubscriptionSummary -> Html Msg
viewItem _ subscription =
    li
        [ dataTest "directory-item"
        , class
            "list-none mb-4"
        ]
        [ div
            [ class "relative p-6 bg-neutral-100 flex hover:bg-gray-50"
            , class "focus-within:ring-1 focus-within:ring-inset focus-within:ring-indigo-500"
            ]
            [ div [ class "flex flex-col text-sm mb-2" ]
                [ p [ class "font-bold" ] [ text (String.toUpper subscription.accountLastname), text " ", text subscription.accountFirstname ]
                , p [ class "font-bold mb-0" ] [ text "Date d'envoi de l'inscription" ]
                , p [] [ text (toFullFormat subscription.createdAt) ]
                , p [ class "font-bold mb-0" ] [ text "Raison sociale de la structure" ]
                , p [] [ text subscription.companyName ]
                ]
            , div
                [ class "flex items-center space-x-4 ml-auto mt-auto" ]
                [ Button.new { onClick = Just (ClickedRejection subscription.id), label = "Rejeter" }
                    |> Button.secondary
                    |> Button.view
                , Button.new { onClick = Just (ClickedValidation subscription.id), label = "Accepter" }
                    |> Button.view
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

        -- VALIDATION
        ClickedValidation id ->
            ( model, Api.Subscription.validate context.endpoint context.token GotValidationResponse id )

        GotValidationResponse RemoteData.NotAsked ->
            ( model, Cmd.none )

        GotValidationResponse RemoteData.Loading ->
            let
                state =
                    model.state
            in
            ( { model | state = { state | errors = Nothing } }, Cmd.none )

        GotValidationResponse (RemoteData.Success _) ->
            let
                state =
                    model.state
            in
            ( { model | state = { state | errors = Nothing } }, Api.Subscription.getSubscriptions context.endpoint context.token GotSubscriptionsResponse )

        GotValidationResponse (RemoteData.Failure errors) ->
            let
                state =
                    model.state
            in
            ( { model | state = { state | errors = Just [ errors ] } }, Cmd.none )

        -- REJECTION
        ClickedRejection id ->
            ( model, Api.Subscription.reject context.endpoint context.token GotRejectionResponse id )

        GotRejectionResponse RemoteData.NotAsked ->
            ( model, Cmd.none )

        GotRejectionResponse RemoteData.Loading ->
            let
                state =
                    model.state
            in
            ( { model | state = { state | errors = Nothing } }, Cmd.none )

        GotRejectionResponse (RemoteData.Success _) ->
            let
                state =
                    model.state
            in
            ( { model | state = { state | errors = Nothing } }, Api.Subscription.getSubscriptions context.endpoint context.token GotSubscriptionsResponse )

        GotRejectionResponse (RemoteData.Failure errors) ->
            let
                state =
                    model.state
            in
            ( { model | state = { state | errors = Just [ errors ] } }, Cmd.none )
