module Page.Subscriptions exposing
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
import Html exposing (Html, a, div, h2, h4, li, p, text, ul)
import Html.Attributes exposing (attribute, class, classList)
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import View
import View.Date exposing (toFullFormat)
import View.Helpers exposing (dataTest)


type Msg
    = GotSubscriptionsResponse (RemoteData (List String) SubscriptionSummaryPage)
    | ClickedViewMore String


type alias State =
    { subscriptions : RemoteData (List String) SubscriptionSummaryPage
    , errors : List String
    }


type alias Filters =
    { page : Int, status : SubscriptionRequestStatus }


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
                }
            , filters = { page = page, status = statusFilter }
            }

        defaultCmd =
            Api.Subscription.getSubscriptions context.endpoint context.token GotSubscriptionsResponse page statusFilter
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
                [ viewCandidaciesLink context ]
                [ viewFilterLinks context model.filters.status
                ]
                [ viewDirectoryHeader context 0 model.filters.status
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
                |> viewContent context model.state.errors model.filters.status


viewContent :
    Context
    -> List String
    -> SubscriptionRequestStatus
    -> SubscriptionSummaryPage
    -> Html Msg
viewContent context actionErrors statusFilter subscriptionPage =
    View.layout
        ""
        [ viewCandidaciesLink context ]
        [ viewFilterLinks context statusFilter
        ]
        (viewDirectoryPanel context subscriptionPage statusFilter actionErrors)


viewDirectoryHeader :
    Context
    -> Int
    -> SubscriptionRequestStatus
    -> Html Msg
viewDirectoryHeader context waitingSubscriptionsCount statusFilter =
    let
        statusString =
            case statusFilter of
                Pending ->
                    "en attente"

                Rejected ->
                    "refusées"
    in
    div
        [ class "px-8 pt-10 pb-4" ]
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
                ("Inscriptions "
                    ++ statusString
                    ++ " ("
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


viewDirectoryPanel : Context -> SubscriptionSummaryPage -> SubscriptionRequestStatus -> List String -> List (Html Msg)
viewDirectoryPanel context subscriptionSummaryPage statusFilter actionErrors =
    [ viewDirectoryHeader context subscriptionSummaryPage.info.totalRows statusFilter
    , List.map (viewItem context) subscriptionSummaryPage.rows
        |> ul
            [ dataTest "directory"
            , class "min-h-0 overflow-y-auto mx-8 px-0"
            , attribute "aria-label" "Inscriptions"
            ]
    , div [ class "flex justify-center" ] [ viewPager context subscriptionSummaryPage.info.currentPage subscriptionSummaryPage.info.totalPages statusFilter ]
    , View.popupErrors actionErrors
    ]


viewPager : Context -> Int -> Int -> SubscriptionRequestStatus -> Html Msg
viewPager context currentPage totalPages statusFilter =
    BetaGouv.DSFR.Pagination.view currentPage totalPages (\p -> Route.toString context.baseUrl (Route.Subscriptions { status = statusFilter, page = p }))


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


viewCandidaciesLink : Context -> Html msg
viewCandidaciesLink context =
    Button.new { onClick = Nothing, label = "Voir les candidatures" }
        |> Button.linkButton (Route.toString context.baseUrl <| Route.Candidacies Route.emptyCandidacyFilters)
        |> Button.tertiary
        |> Button.view


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
            [ class "block group my-4 py-1 px-2"
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
