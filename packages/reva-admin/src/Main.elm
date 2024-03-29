port module Main exposing (Page)

import Accessibility exposing (h1)
import Admin.Object.CandidacySummaryFilterInfo exposing (active)
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
import Page.Candidacy as Candidacy
import Page.Loading
import Page.Search.Candidacies as Candidacies exposing (Model)
import Page.Search.Certifications as Certifications
import Page.Search.Typology as Typology
import Page.SiteMap as SiteMap
import RemoteData exposing (RemoteData(..))
import Route exposing (Route(..))
import Task
import Url exposing (Url)
import View.Footer
import View.Header as Header
import View.Skiplinks


type alias Flags =
    { endpoint : String
    , baseUrl : String
    , keycloakConfiguration : Decode.Value
    , restApiEndpoint : String
    , adminReactUrl : String
    }



-- MODEL


type alias Model =
    { context : Context
    , page : Page
    , route : Route
    , keycloakConfiguration : Maybe KeycloakConfiguration
    }


type Page
    = Candidacies Candidacies.Model
    | Certifications Certifications.Model
    | Candidacy Candidacy.Model
    | Typology Typology.Model
    | LoggingOut
    | NotLoggedIn Route
    | NotFound
    | SiteMap


type Msg
    = -- Message naming conventions: https://youtu.be/w6OVDBqergc
      BrowserChangedUrl Url
    | UserClickedLink Browser.UrlRequest
    | UserLoggedOut
    | GotCandidaciesMsg Candidacies.Msg
    | GotCertificationsMsg Certifications.Msg
    | GotCandidacyMsg Candidacy.Msg
    | GotTypologyMsg Typology.Msg
    | GotLoggedIn Token
    | GotTokenRefreshed Token
    | GotLoggedOut
    | GotViewport Dom.Viewport
    | GotBrowserWidth Float
    | ScrolledToTop
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
            , Header.view model.context model.route
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

        Certifications certificationsModel ->
            Certifications.view model.context certificationsModel
                |> Html.map GotCertificationsMsg

        Candidacy candidacyModel ->
            Candidacy.view model.context candidacyModel
                |> Html.map GotCandidacyMsg

        Typology typologyModel ->
            Typology.view model.context typologyModel
                |> Html.map GotTypologyMsg

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
                redirectUrl =
                    if Api.Token.isAdmin context.token || Api.Token.isOrganism context.token then
                        Route.toString model.context.baseUrl (Route.Candidacies Route.emptyCandidacyFilters)

                    else if Api.Token.isCertificationAuthority context.token then
                        context.adminReactUrl ++ "/candidacies/feasibilities"

                    else
                        Route.toString model.context.baseUrl Route.NotFound
            in
            ( model, Nav.load redirectUrl )

        ( Route.Candidacies filters, Candidacies candidaciesModel ) ->
            candidaciesModel
                |> Candidacies.withFilters context filters.page filters.status
                |> updateWith Candidacies GotCandidaciesMsg model

        ( Route.Candidacies filters, _ ) ->
            Candidacies.init model.context filters.status filters.page
                |> updateWith Candidacies GotCandidaciesMsg model

        ( Route.Candidacy tab, Candidacy candidacyModel ) ->
            ( candidacyModel, Cmd.none )
                |> Candidacy.resetSelected
                |> Candidacy.updateTab context tab
                |> updateWith Candidacy GotCandidacyMsg model

        ( Route.Certifications filters, Certifications certificationsModel ) ->
            certificationsModel
                |> Certifications.withFilters context
                    { candidacyId = Nothing
                    , organismId = filters.organismId
                    , page = filters.page
                    }
                |> updateWith Certifications GotCertificationsMsg model

        ( Route.Certifications filters, _ ) ->
            Certifications.init context
                { candidacyId = Nothing
                , organismId = filters.organismId
                , page = filters.page
                }
                |> updateWith Certifications GotCertificationsMsg model

        ( Route.Reorientation candidacyId filters, Certifications certificationsModel ) ->
            certificationsModel
                |> Certifications.withFilters context
                    { candidacyId = Just candidacyId
                    , organismId = filters.organismId
                    , page = filters.page
                    }
                |> updateWith Certifications GotCertificationsMsg model

        ( Route.Reorientation candidacyId filters, _ ) ->
            Certifications.init context
                { candidacyId = Just candidacyId
                , organismId = filters.organismId
                , page = filters.page
                }
                |> updateWith Certifications GotCertificationsMsg model

        ( Route.Candidacy tab, _ ) ->
            Candidacy.init model.context tab
                |> updateWith Candidacy GotCandidacyMsg model

        ( Route.Typology candidacyId filters, Typology typologyModel ) ->
            typologyModel
                |> Typology.withFilters context
                    { candidacyId = candidacyId
                    , page = filters.page
                    }
                |> updateWith Typology GotTypologyMsg model

        ( Route.Typology candidacyId filters, _ ) ->
            Typology.init context
                { candidacyId = candidacyId
                , page = filters.page
                }
                |> updateWith Typology GotTypologyMsg model

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
            let
                route =
                    Route.fromUrl model.context.baseUrl url

                ( newModel, cmd ) =
                    changeRouteTo model.context route { model | route = route }
            in
            ( newModel
            , Cmd.batch
                [ cmd
                , Dom.setViewport 0 0 |> Task.perform (\_ -> ScrolledToTop)
                ]
            )

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

        -- Certifications
        ( GotCertificationsMsg candidaciesMsg, Certifications certificationsModel ) ->
            let
                ( newCertificationsModel, certificationsCmd ) =
                    Certifications.update model.context candidaciesMsg certificationsModel
            in
            ( { model | page = Certifications newCertificationsModel }
            , Cmd.map GotCertificationsMsg certificationsCmd
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

        -- Typology
        ( GotTypologyMsg typlogyMsg, Typology typolgyModel ) ->
            let
                ( newTypologyModel, typologyCmd ) =
                    Typology.update model.context typlogyMsg typolgyModel
            in
            ( { model | page = Typology newTypologyModel }
            , Cmd.map GotTypologyMsg typologyCmd
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
                ( { model | context = newContext }
                , Cmd.batch [ Nav.pushUrl model.context.navKey (Route.toString model.context.baseUrl route), getFeaturesCommand ]
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
                    []
                    flags.adminReactUrl
            , page = NotLoggedIn redirectTo
            , route = Route.Home
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
