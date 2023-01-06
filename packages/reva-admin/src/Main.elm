port module Main exposing (main)

import Api.Token exposing (Token)
import Browser
import Browser.Navigation as Nav
import Data.Context exposing (Context)
import Html.Styled as Html exposing (Html, a, div, text, toUnstyled)
import Html.Styled.Attributes exposing (class)
import Json.Decode as Decode exposing (..)
import KeycloakConfiguration exposing (KeycloakConfiguration)
import Page.Candidacies as Candidacies exposing (Model)
import Page.Loading
import Route exposing (Route(..))
import Url exposing (Url)
import View


type alias Flags =
    { endpoint : String
    , baseUrl : String
    , keycloakConfiguration : Decode.Value
    }



-- MODEL


type alias Model =
    { context : Context
    , page : Page
    , keycloakConfiguration : Maybe KeycloakConfiguration
    }


type Page
    = Candidacies Candidacies.Model
    | Loading Token
    | LoggingOut
    | NotLoggedIn Route


type Msg
    = -- Message naming conventions: https://youtu.be/w6OVDBqergc
      BrowserChangedUrl Url
    | UserClickedLink Browser.UrlRequest
    | UserLoggedOut
    | GotCandidaciesMsg Candidacies.Msg
    | GotLoggedIn Token
    | GotTokenRefreshed Token
    | GotLoggedOut


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
    { title = "REVA"
    , body =
        [ div
            [ class "min-h-screen flex flex-col" ]
            [ viewHeader model
            , viewPage model
            , KeycloakConfiguration.iframeKeycloak
                { onLoggedIn = GotLoggedIn
                , onLoggedOut = GotLoggedOut
                , onTokenRefreshed = GotTokenRefreshed
                }
                model.keycloakConfiguration
                (model.page == LoggingOut)
            ]
            |> toUnstyled
        ]
    }


viewHeader : Model -> Html msg
viewHeader model =
    div
        [ class "sticky top-0 z-40 bg-white"
        , class "flex justify-between p-6 w-full"
        , class "text-gray-900 font-medium"
        , class "border-b border-gray-200"
        ]
        [ View.image [ class "w-[73px]" ] model.context.baseUrl "logo.png"
        , a
            [ Route.href model.context.baseUrl Logout ]
            [ text "Se déconnecter" ]
        ]


viewPage : Model -> Html Msg
viewPage model =
    case model.page of
        NotLoggedIn _ ->
            Page.Loading.view

        Candidacies candidaciesModel ->
            Candidacies.view model.context candidaciesModel
                |> Html.map GotCandidaciesMsg

        Loading _ ->
            div [] []

        LoggingOut ->
            text "Déconnexion en cours..."



-- UPDATE


changeRouteTo : Context -> Route -> Model -> ( Model, Cmd Msg )
changeRouteTo context route model =
    let
        noChange =
            ( model, Cmd.none )
    in
    case ( route, model.page ) of
        ( Home, _ ) ->
            noChange

        ( Candidacy tab, Candidacies candidaciesModel ) ->
            candidaciesModel
                |> Candidacies.resetSelected
                |> Candidacies.updateTab context tab
                |> updateWith Candidacies GotCandidaciesMsg model

        ( Candidacy _, _ ) ->
            noChange

        ( Login, _ ) ->
            noChange

        ( Logout, _ ) ->
            ( { model | page = LoggingOut }, Cmd.none )

        ( NotFound, _ ) ->
            noChange


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model.page ) of
        ( BrowserChangedUrl url, _ ) ->
            changeRouteTo model.context (Route.fromUrl model.context.baseUrl url) model

        ( UserClickedLink urlRequest, _ ) ->
            case urlRequest of
                Browser.Internal url ->
                    ( model
                    , Nav.pushUrl model.context.navKey (Url.toString url)
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
                            Home

                        _ ->
                            route

                ( candidaciesModel, candidaciesCmd ) =
                    Candidacies.init newContext
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

        _ ->
            ( model, Cmd.none )


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
            , page = NotLoggedIn (Route.fromUrl flags.baseUrl url)
            , keycloakConfiguration =
                Decode.decodeValue KeycloakConfiguration.keycloakConfiguration flags.keycloakConfiguration
                    |> Result.map Just
                    |> Result.withDefault Nothing
            }
    in
    ( model
    , Nav.pushUrl key (Route.toString flags.baseUrl Route.Login)
    )


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none



-- PORT


port removeToken : () -> Cmd msg
