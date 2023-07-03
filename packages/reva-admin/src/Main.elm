port module Main exposing (main)

import Admin.Enum.CandidacyStatusFilter as CandidacyStatusFilter exposing (CandidacyStatusFilter)
import Api.Token exposing (Token)
import Browser
import Browser.Dom as Dom
import Browser.Events
import Browser.Navigation as Nav
import Data.Context exposing (Context)
import Html exposing (Html, a, div, text)
import Html.Attributes exposing (class)
import Json.Decode as Decode exposing (..)
import KeycloakConfiguration exposing (KeycloakConfiguration)
import Page.Candidacies as Candidacies exposing (Model)
import Page.Candidacy as Candidacy
import Page.Loading
import Page.SiteMap as SiteMap
import Page.Subscription as Subscription
import Page.Subscriptions as Subscriptions
import Route exposing (Route(..))
import Task
import Url exposing (Url)
import View
import View.Footer
import View.Header
import View.Skiplinks


type alias Flags =
    { endpoint : String
    , baseUrl : String
    , keycloakConfiguration : Decode.Value
    , uploadEndpoint : String
    }



-- MODEL


type alias Model =
    { context : Context
    , page : Page
    , keycloakConfiguration : Maybe KeycloakConfiguration
    }


type Page
    = Candidacies Candidacies.Model
    | Candidacy Candidacy.Model
    | Loading Token
    | LoggingOut
    | NotLoggedIn Route
    | Subscription Subscription.Model
    | Subscriptions Subscriptions.Model
    | SiteMap


type Msg
    = -- Message naming conventions: https://youtu.be/w6OVDBqergc
      BrowserChangedUrl Url
    | UserClickedLink Browser.UrlRequest
    | UserLoggedOut
    | GotCandidaciesMsg Candidacies.Msg
    | GotSubscriptionsMsg Subscriptions.Msg
    | GotSubscriptionMsg Subscription.Msg
    | GotCandidacyMsg Candidacy.Msg
    | GotLoggedIn Token
    | GotTokenRefreshed Token
    | GotLoggedOut
    | GotViewport Dom.Viewport
    | GotBrowserWidth Float
    | ScrolledToTop


main : Program Flags Model Msg
main =
    Browser.application
        { init = init
        , onUrlRequest = UserClickedLink
        , onUrlChange = BrowserChangedUrl
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- VIEW


view : Model -> Browser.Document Msg
view model =
    { title = "France VAE"
    , body =
        [ div
            [ class "min-h-screen flex flex-col" ]
            [ View.Skiplinks.view
            , View.Header.view model.context
            , viewPage model
            , KeycloakConfiguration.iframeKeycloak
                { onLoggedIn = GotLoggedIn
                , onLoggedOut = GotLoggedOut
                , onTokenRefreshed = GotTokenRefreshed
                }
                model.keycloakConfiguration
                (model.page == LoggingOut)
            , View.Footer.view model.context
            ]
        ]
    }


viewPage : Model -> Html Msg
viewPage model =
    case model.page of
        NotLoggedIn _ ->
            Page.Loading.view

        Candidacies candidaciesModel ->
            Candidacies.view model.context candidaciesModel
                |> Html.map GotCandidaciesMsg

        Subscriptions subscriptionsModel ->
            Subscriptions.view model.context subscriptionsModel
                |> Html.map GotSubscriptionsMsg

        Subscription subscriptionModel ->
            Subscription.view model.context subscriptionModel
                |> Html.map GotSubscriptionMsg

        Candidacy candidacyModel ->
            Candidacy.view model.context candidacyModel
                |> Html.map GotCandidacyMsg

        Loading _ ->
            div [] []

        LoggingOut ->
            text "Déconnexion en cours..."

        SiteMap ->
            SiteMap.view model.context



-- UPDATE


changeRouteTo : Context -> Route -> Model -> ( Model, Cmd Msg )
changeRouteTo context route model =
    let
        noChange =
            ( model, Cmd.none )
    in
    case ( route, model.page ) of
        ( Route.Candidacies filters, Candidacies candidaciesModel ) ->
            candidaciesModel
                |> Candidacies.withFilters context filters.page filters.status
                |> updateWith Candidacies GotCandidaciesMsg model

        ( Route.Candidacy tab, Candidacy candidacyModel ) ->
            ( candidacyModel, Cmd.none )
                |> Candidacy.resetSelected
                |> Candidacy.updateTab context tab
                |> updateWith Candidacy GotCandidacyMsg model

        ( Route.Candidacies filters, _ ) ->
            Candidacies.init model.context filters.status filters.page
                |> updateWith Candidacies GotCandidaciesMsg model

        ( Route.Subscriptions, _ ) ->
            Subscriptions.init model.context
                |> updateWith Subscriptions GotSubscriptionsMsg model

        ( Route.Subscription subscriptionId, _ ) ->
            Subscription.init model.context subscriptionId
                |> updateWith Subscription GotSubscriptionMsg model

        ( Route.Candidacy tab, _ ) ->
            Candidacy.init model.context tab
                |> updateWith Candidacy GotCandidacyMsg model

        ( Route.Login, _ ) ->
            noChange

        ( Route.Logout, _ ) ->
            ( { model | page = LoggingOut }, Cmd.none )

        ( Route.NotFound, _ ) ->
            noChange

        ( Route.SiteMap, _ ) ->
            ( { model | page = SiteMap }, Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model.page ) of
        ( BrowserChangedUrl url, _ ) ->
            changeRouteTo model.context (Route.fromUrl model.context.baseUrl url) model

        ( UserClickedLink urlRequest, _ ) ->
            case urlRequest of
                Browser.Internal url ->
                    ( { model | context = scrollingToTop True model.context }
                    , Cmd.batch
                        [ Dom.setViewport 0 0 |> Task.perform (\_ -> ScrolledToTop)
                        , Nav.pushUrl model.context.navKey (Url.toString url)
                        ]
                    )

                Browser.External url ->
                    ( model
                    , Nav.load url
                    )

        ( UserLoggedOut, _ ) ->
            ( model, removeToken () )

        -- Candidacies
        ( GotCandidaciesMsg candidaciesMsg, Candidacies candidaciesModel ) ->
            let
                ( newCandidaciesModel, candidaciesCmd ) =
                    Candidacies.update model.context candidaciesMsg candidaciesModel
            in
            ( { model | page = Candidacies newCandidaciesModel }
            , Cmd.map GotCandidaciesMsg candidaciesCmd
            )

        -- Subscriptions
        ( GotSubscriptionsMsg subscriptionsMsg, Subscriptions subscriptionsModel ) ->
            let
                ( newSubscriptionsModel, subscriptionsCmd ) =
                    Subscriptions.update model.context subscriptionsMsg subscriptionsModel
            in
            ( { model | page = Subscriptions newSubscriptionsModel }
            , Cmd.map GotSubscriptionsMsg subscriptionsCmd
            )

        -- Subscription
        ( GotSubscriptionMsg subscriptionMsg, Subscription subscriptionModel ) ->
            let
                ( newSubscriptionModel, subscriptionCmd ) =
                    Subscription.update model.context subscriptionMsg subscriptionModel
            in
            ( { model | page = Subscription newSubscriptionModel }
            , Cmd.map GotSubscriptionMsg subscriptionCmd
            )

        -- Candidacy
        ( GotCandidacyMsg candidacyMsg, Candidacy candidacyModel ) ->
            let
                ( newCandidacyModel, candidacyCmd ) =
                    Candidacy.update model.context candidacyMsg candidacyModel
            in
            ( { model | page = Candidacy newCandidacyModel }
            , Cmd.map GotCandidacyMsg candidacyCmd
            )

        -- Auth
        ( GotLoggedIn token, NotLoggedIn route ) ->
            let
                context =
                    model.context

                newContext =
                    { context | token = token }

                redirectRoute =
                    case route of
                        Login ->
                            Route.Candidacies Route.emptyFilters

                        _ ->
                            route

                filters =
                    case route of
                        Route.Candidacies f ->
                            f

                        _ ->
                            { status = CandidacyStatusFilter.ActiveHorsAbandon, page = 1 }

                ( candidaciesModel, candidaciesCmd ) =
                    Candidacies.init newContext filters.status filters.page
            in
            ( { model | context = newContext, page = Candidacies candidaciesModel }
            , Cmd.batch
                [ Cmd.map GotCandidaciesMsg candidaciesCmd
                , Nav.pushUrl model.context.navKey (Route.toString model.context.baseUrl redirectRoute)
                ]
            )

        ( GotTokenRefreshed token, _ ) ->
            ( model
                |> withTokenRefreshed token
            , Cmd.none
            )

        ( GotViewport viewport, _ ) ->
            ( model |> withNewBrowserWidth viewport.scene.width, Cmd.none )

        ( GotBrowserWidth width, _ ) ->
            ( model |> withNewBrowserWidth width, Cmd.none )

        ( ScrolledToTop, _ ) ->
            ( { model | context = scrollingToTop False model.context }, Cmd.none )

        _ ->
            ( model, Cmd.none )


scrollingToTop : Bool -> Context -> Context
scrollingToTop isScrolling context =
    { context | isScrollingToTop = isScrolling }


updateWith : (subModel -> Page) -> (subMsg -> Msg) -> Model -> ( subModel, Cmd subMsg ) -> ( Model, Cmd Msg )
updateWith toModel toMsg model ( subModel, subCmd ) =
    ( { model | page = toModel subModel }
    , Cmd.map toMsg subCmd
    )


withTokenRefreshed : Token -> Model -> Model
withTokenRefreshed token ({ context } as model) =
    let
        newContext =
            { context | token = token }
    in
    { model | context = newContext }


withNewBrowserWidth : Float -> Model -> Model
withNewBrowserWidth width ({ context } as model) =
    let
        newContext =
            { context | isMobile = width < 640 }
    in
    { model | context = newContext }


init : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
    initWithoutToken flags url key


initWithoutToken : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
initWithoutToken flags url key =
    let
        model : Model
        model =
            { context =
                Context
                    flags.baseUrl
                    flags.endpoint
                    key
                    Api.Token.anonymous
                    flags.uploadEndpoint
                    False
                    False
            , page = NotLoggedIn (Route.fromUrl flags.baseUrl url)
            , keycloakConfiguration =
                Decode.decodeValue KeycloakConfiguration.keycloakConfiguration flags.keycloakConfiguration
                    |> Result.map Just
                    |> Result.withDefault Nothing
            }
    in
    ( model
    , Cmd.batch
        [ Nav.pushUrl key (Route.toString flags.baseUrl Route.Login)
        , Task.perform GotViewport Dom.getViewport
        ]
    )


subscriptions : Model -> Sub Msg
subscriptions _ =
    Browser.Events.onResize (\w _ -> toFloat w |> GotBrowserWidth)



-- PORT


port removeToken : () -> Cmd msg
