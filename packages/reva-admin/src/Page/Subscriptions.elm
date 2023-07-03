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
import Html exposing (Html, aside, div, h2, h4, li, node, p, text, ul)
import Html.Attributes exposing (attribute, class)
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import View
import View.Date exposing (toFullFormat)
import View.Helpers exposing (dataTest)


type Msg
    = GotSubscriptionsResponse (RemoteData (List String) (List SubscriptionSummary))
    | ClickedViewMore String


type alias State =
    { subscriptions : RemoteData (List String) (List SubscriptionSummary)
    , errors : List String
    }


type alias Model =
    { state : State
    }


init : Context -> ( Model, Cmd Msg )
init context =
    let
        defaultModel : Model
        defaultModel =
            { state =
                { subscriptions = RemoteData.Loading
                , errors = []
                }
            }

        defaultCmd =
            Api.Subscription.getSubscriptions context.endpoint context.token GotSubscriptionsResponse
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
                []
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

        Failure errors ->
            View.errors errors

        Success subscriptions ->
            subscriptions
                |> viewContent context model.state.errors


viewContent :
    Context
    -> List String
    -> List SubscriptionSummary
    -> Html Msg
viewContent context actionErrors filteredSubscriptions =
    View.layout
        ""
        [ viewCandidaciesLink context ]
        []
        (viewDirectoryPanel context filteredSubscriptions actionErrors)


viewDirectoryHeader : Context -> Int -> Html Msg
viewDirectoryHeader context waitingSubscriptionsCount =
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


viewDirectoryPanel : Context -> List SubscriptionSummary -> List String -> List (Html Msg)
viewDirectoryPanel context subscriptionsByStatus actionErrors =
    [ viewDirectoryHeader context (List.length subscriptionsByStatus)
    , List.map (viewItem context) subscriptionsByStatus
        |> ul
            [ dataTest "directory"
            , class "min-h-0 overflow-y-auto mx-8 px-0"
            , attribute "aria-label" "Inscriptions"
            ]
    , View.popupErrors actionErrors
    ]


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


withSubscriptions : RemoteData (List String) (List SubscriptionSummary) -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
withSubscriptions subscriptions ( model, cmd ) =
    let
        state =
            model.state
    in
    ( { model | state = { state | subscriptions = subscriptions } }, cmd )


viewCandidaciesLink : Context -> Html msg
viewCandidaciesLink context =
    Html.a
        [ class "fr-link"
        , class "md:text-lg text-gray-900 hover:text-blue-900"
        , Route.href context.baseUrl (Route.Candidacies Route.emptyFilters)
        ]
        [ text "Voir les candidatures" ]
