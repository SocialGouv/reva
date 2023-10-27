port module Main exposing (main)

import Accessibility exposing (h1)
import Api.FeatureFlipping exposing (getActiveFeatures)
import Api.Token exposing (Token)
import Browser
import Browser.Dom as Dom
import Browser.Events
import Browser.Navigation as Nav
import Data.Context exposing (Context)
import Html exposing (Html, div, text)
import Html.Attributes exposing (class)
import Json.Decode as Decode exposing (..)
import KeycloakConfiguration exposing (KeycloakConfiguration)
import Page.Account as Account
import Page.Accounts as Accounts
import Page.Candidacies as Candidacies exposing (Model)
import Page.Candidacy as Candidacy
import Page.Feasibilities as Feasibilities
import Page.Feasibility as Feasibility
import Page.Loading
import Page.SiteMap as SiteMap
import Page.Subscription as Subscription
import Page.Subscriptions as Subscriptions
import RemoteData exposing (RemoteData(..))
import Route exposing (Route(..), emptyFeasibilityFilters)
import Task
import Url exposing (Url)
import View.Footer
import View.Header
import View.Skiplinks


type alias Flags =
    { endpoint : String
    , baseUrl : String
    , keycloakConfiguration : Decode.Value
    , restApiEndpoint : String
    , feasibilityFeatureEnabled : Bool
    , franceVaeFinanceModuleFeatureEnabled : Bool
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
    | Feasibilities Feasibilities.Model
    | Feasibility Feasibility.Model
    | LoggingOut
    | NotLoggedIn Route
    | NotFound
    | Subscription Subscription.Model
    | Subscriptions Subscriptions.Model
    | Account Account.Model
    | Accounts Accounts.Model
    | SiteMap


type Msg
    = -- Message naming conventions: https://youtu.be/w6OVDBqergc
      BrowserChangedUrl Url
    | UserClickedLink Browser.UrlRequest
    | UserLoggedOut
    | GotCandidaciesMsg Candidacies.Msg
    | GotSubscriptionsMsg Subscriptions.Msg
    | GotSubscriptionMsg Subscription.Msg
    | GotAccountsMsg Accounts.Msg
    | GotAccountMsg Account.Msg
    | GotCandidacyMsg Candidacy.Msg
    | GotLoggedIn Token
    | GotTokenRefreshed Token
    | GotLoggedOut
    | GotViewport Dom.Viewport
    | GotBrowserWidth Float
    | ScrolledToTop
    | GotFeasibilitiesMsg Feasibilities.Msg
    | GotFeasibilityMsg Feasibility.Msg
    | GotActiveFeatures (RemoteData (List String) (List String))


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

        Accounts accountsModel ->
            Accounts.view model.context accountsModel
                |> Html.map GotAccountsMsg

        Account accountModel ->
            Account.view model.context accountModel
                |> Html.map GotAccountMsg

        Candidacy candidacyModel ->
            Candidacy.view model.context candidacyModel
                |> Html.map GotCandidacyMsg

        Feasibilities feasibilitiesModel ->
            Feasibilities.view model.context feasibilitiesModel
                |> Html.map GotFeasibilitiesMsg

        Feasibility feasibilityModel ->
            Feasibility.view model.context feasibilityModel
                |> Html.map GotFeasibilityMsg

        NotFound ->
            h1 [] [ text "Page introuvable" ]

        LoggingOut ->
            Page.Loading.view

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
        ( Route.Home, _ ) ->
            let
                redirectRoute =
                    if Api.Token.isAdmin context.token || Api.Token.isOrganism context.token then
                        Route.Candidacies Route.emptyCandidacyFilters

                    else if Api.Token.isCertificationAuthority context.token then
                        Route.Feasibilities Route.emptyFeasibilityFilters

                    else
                        Route.NotFound
            in
            ( model, Nav.pushUrl model.context.navKey (Route.toString model.context.baseUrl redirectRoute) )

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

        ( Route.Feasibilities filters, Feasibilities feasibilitiesModel ) ->
            feasibilitiesModel
                |> Feasibilities.withFilters context filters.page filters.category
                |> updateWith Feasibilities GotFeasibilitiesMsg model

        ( Route.Feasibilities filters, _ ) ->
            Feasibilities.init model.context filters.category filters.page
                |> updateWith Feasibilities GotFeasibilitiesMsg model

        ( Route.Feasibility feasibilityId, _ ) ->
            Feasibility.init model.context feasibilityId
                |> updateWith Feasibility GotFeasibilityMsg model

        ( Route.Subscriptions filters, _ ) ->
            Subscriptions.init model.context filters.status filters.page
                |> updateWith Subscriptions GotSubscriptionsMsg model

        ( Route.Subscription subscriptionId, _ ) ->
            Subscription.init model.context subscriptionId
                |> updateWith Subscription GotSubscriptionMsg model

        ( Route.Accounts filters, _ ) ->
            Accounts.init model.context filters.group filters.page
                |> updateWith Accounts GotAccountsMsg model

        ( Route.Account accountId, _ ) ->
            Account.init model.context accountId
                |> updateWith Account GotAccountMsg model

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

        -- Accounts
        ( GotAccountsMsg rganismsMsg, Accounts rganismsModel ) ->
            let
                ( newAccountsModel, rganismsCmd ) =
                    Accounts.update model.context rganismsMsg rganismsModel
            in
            ( { model | page = Accounts newAccountsModel }
            , Cmd.map GotAccountsMsg rganismsCmd
            )

        -- Account
        ( GotAccountMsg rganismMsg, Account rganismModel ) ->
            let
                ( newAccountModel, rganismCmd ) =
                    Account.update model.context rganismMsg rganismModel
            in
            ( { model | page = Account newAccountModel }
            , Cmd.map GotAccountMsg rganismCmd
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

        -- Feasibilities
        ( GotFeasibilitiesMsg feasibilitiessMsg, Feasibilities feasibilitiesModel ) ->
            let
                ( newFeasibilitiesModel, feasibilitiesCmd ) =
                    Feasibilities.update model.context feasibilitiessMsg feasibilitiesModel
            in
            ( { model | page = Feasibilities newFeasibilitiesModel }
            , Cmd.map GotFeasibilitiesMsg feasibilitiesCmd
            )

        ( GotFeasibilityMsg feasibilityMsg, Feasibility feasibilityModel ) ->
            let
                ( newFeasibilityModel, feasibilityCmd ) =
                    Feasibility.update model.context feasibilityMsg feasibilityModel
            in
            ( { model | page = Feasibility newFeasibilityModel }
            , Cmd.map GotFeasibilityMsg feasibilityCmd
            )

        -- Auth
        ( GotLoggedIn token, NotLoggedIn route ) ->
            let
                context =
                    model.context

                newContext =
                    { context | token = token }

                getFeaturesCommand =
                    getActiveFeatures context.endpoint token GotActiveFeatures
            in
            if Api.Token.isAdmin token || Api.Token.isOrganism token then
                let
                    redirectRoute =
                        case route of
                            -- When the user is not logged in, we redirect him to the login page
                            -- Then, by default, we redirect him to the candidacies page
                            Login ->
                                Route.Candidacies Route.emptyCandidacyFilters

                            _ ->
                                route
                in
                ( { model | context = newContext }
                , Cmd.batch [ Nav.pushUrl model.context.navKey (Route.toString model.context.baseUrl redirectRoute), getFeaturesCommand ]
                )

            else if Api.Token.isCertificationAuthority token then
                let
                    redirectRoute =
                        case route of
                            -- When the user is not logged in, we redirect him to the login page
                            -- Then, by default, we redirect him to the feasibilities page
                            Login ->
                                Route.Feasibilities emptyFeasibilityFilters

                            _ ->
                                route
                in
                ( { model | context = newContext }
                , Cmd.batch [ Nav.pushUrl model.context.navKey (Route.toString model.context.baseUrl redirectRoute), getFeaturesCommand ]
                )

            else
                ( { model | context = newContext, page = NotFound }
                , Cmd.batch [ Nav.pushUrl model.context.navKey (Route.toString model.context.baseUrl <| Route.NotFound), getFeaturesCommand ]
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

        ( GotActiveFeatures remoteActiveFeatures, _ ) ->
            let
                newActiveFeatures =
                    case remoteActiveFeatures of
                        Success f ->
                            f

                        _ ->
                            []
            in
            ( { model | context = withActiveFeatures newActiveFeatures model.context }, Cmd.none )

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


withActiveFeatures : List String -> Context -> Context
withActiveFeatures activeFeatures context =
    { context | activeFeatures = activeFeatures }


init : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
    initWithoutToken flags url key


initWithoutToken : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
initWithoutToken flags url key =
    let
        redirectTo : Route
        redirectTo =
            case Route.fromUrl flags.baseUrl url of
                Logout ->
                    -- When a user logs out, he is redirected to a login page with a redirect URI set to "auth/logout"
                    -- So, if he logs in again, he would be redirected to the logout page, being logged out immediately.
                    -- To prevent this, we redirect him to the home page instead.
                    Home

                route ->
                    route

        model : Model
        model =
            { context =
                Context
                    flags.baseUrl
                    flags.endpoint
                    key
                    Api.Token.anonymous
                    flags.restApiEndpoint
                    False
                    False
                    flags.feasibilityFeatureEnabled
                    flags.franceVaeFinanceModuleFeatureEnabled
                    []
            , page = NotLoggedIn redirectTo
            , keycloakConfiguration =
                Decode.decodeValue KeycloakConfiguration.keycloakConfiguration flags.keycloakConfiguration
                    |> Result.map Just
                    |> Result.withDefault Nothing
            }
    in
    ( model
    , Task.perform GotViewport Dom.getViewport
    )


subscriptions : Model -> Sub Msg
subscriptions _ =
    Browser.Events.onResize (\w _ -> toFloat w |> GotBrowserWidth)



-- PORT


port removeToken : () -> Cmd msg
