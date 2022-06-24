port module Main exposing (main)

import Api exposing (Token)
import Browser
import Browser.Navigation as Nav
import Data.Candidate exposing (Candidate)
import Html.Styled as Html exposing (Html, div, toUnstyled)
import Http
import Json.Decode as Decode exposing (..)
import KeycloakConfiguration exposing (KeycloakConfiguration)
import Page.Candidacies as Candidacies exposing (Model)
import Page.Candidates as Candidates exposing (Model)
import Page.Loading
import Page.Login
import RemoteData exposing (RemoteData(..))
import Route exposing (Route(..))
import Url exposing (Url)
import Validate
import View.Candidacy


type alias Flags =
    { endpoint : String
    , baseUrl : String
    , keycloakConfiguration : Decode.Value
    }



-- MODEL


type alias Model =
    { key : Nav.Key
    , baseUrl : String
    , endpoint : String
    , page : Page
    , keycloakConfiguration : Maybe KeycloakConfiguration
    }


type Page
    = Candidacies Candidacies.Model
    | Candidates Candidates.Model
    | Loading Token
    | NotLoggedIn Route Page.Login.Model


type Msg
    = -- Message naming conventions: https://youtu.be/w6OVDBqergc
      BrowserChangedUrl Url
    | UserClickedLink Browser.UrlRequest
    | UserLoggedOut
    | GotCandidatesMsg Candidates.Msg
    | GotCandidaciesMsg Candidacies.Msg
    | GotLoginError String
      -- PROFILE
      --| GotProfileResponse (Result Http.Error ())
      -- LOGIN
    | GotLoginUpdate Page.Login.Model
    | GotLoginSubmit
    | GotLoginResponse (Result Http.Error Token)
    | GotCandidatesResponse (Result Http.Error (List Candidate))
    | GotLoggedIn Token
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
        [ viewPage model
            |> toUnstyled
        , KeycloakConfiguration.iframeKeycloak
            { onLoggedIn = GotLoggedIn
            , onLoggedOut = GotLoggedOut
            }
            model.keycloakConfiguration
            |> toUnstyled
        ]
    }


viewPage : Model -> Html Msg
viewPage model =
    case model.page of
        NotLoggedIn _ _ ->
            Page.Loading.view

        Candidacies candidaciesModel ->
            Candidacies.view { baseUrl = model.baseUrl } candidaciesModel
                |> Html.map GotCandidaciesMsg

        Candidates candidatesModel ->
            Candidates.view candidatesModel
                |> Html.map GotCandidatesMsg

        Loading _ ->
            div [] []



-- UPDATE


changeRouteTo : Route -> Model -> ( Model, Cmd Msg )
changeRouteTo route model =
    let
        noChange =
            ( model, Cmd.none )
    in
    case ( route, model.page ) of
        ( Home, _ ) ->
            noChange

        ( Candidacy (View.Candidacy.Profil candidacyId), Candidacies candidaciesModel ) ->
            Candidacies.initCandidacy candidacyId candidaciesModel
                |> updateWith Candidacies GotCandidaciesMsg model

        ( Candidacy (View.Candidacy.Profil candidacyId), _ ) ->
            noChange

        ( Candidacy View.Candidacy.Empty, _ ) ->
            noChange

        ( Candidacy (View.Candidacy.Meetings candidacyId), Candidacies candidaciesModel ) ->
            Candidacies.updateTab (View.Candidacy.Meetings candidacyId) candidaciesModel
                |> updateWith Candidacies GotCandidaciesMsg model

        ( Candidacy (View.Candidacy.Meetings candidacyId), _ ) ->
            noChange

        ( Login, _ ) ->
            noChange

        ( NotFound, _ ) ->
            noChange


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model.page ) of
        ( BrowserChangedUrl url, _ ) ->
            changeRouteTo (Route.fromUrl model.baseUrl url) model

        ( UserClickedLink urlRequest, _ ) ->
            case urlRequest of
                Browser.Internal url ->
                    ( model
                    , Nav.pushUrl model.key (Url.toString url)
                    )

                Browser.External url ->
                    ( model
                    , Nav.load url
                    )

        ( UserLoggedOut, _ ) ->
            ( model, removeToken () )

        ( GotLoginUpdate loginModel, NotLoggedIn route _ ) ->
            ( { model | page = NotLoggedIn route loginModel }, Cmd.none )

        ( GotLoginSubmit, NotLoggedIn route loginModel ) ->
            case Page.Login.validateLogin loginModel of
                Ok validateModel ->
                    ( model, Validate.fromValid validateModel |> Api.login (GotLoginResponse |> withAuthHandle) )

                Err errors ->
                    ( { model | page = Page.Login.withErrors loginModel errors |> NotLoggedIn route }, Cmd.none )

        ( GotLoginResponse (Ok token), NotLoggedIn _ loginModel ) ->
            ( { model | page = Candidates <| Candidates.init token }
            , Cmd.batch
                [ if loginModel.form.rememberMe then
                    storeToken (Api.tokenToString token)

                  else
                    Cmd.none
                , Api.fetchCandidates GotCandidatesResponse { token = token }
                , Nav.pushUrl model.key (Route.toString model.baseUrl Route.Home)
                ]
            )

        ( GotCandidatesMsg candidatesMsg, Candidates candidatesModel ) ->
            let
                ( newCandidatesModel, candidatesCmd ) =
                    Candidates.update candidatesMsg candidatesModel
            in
            ( { model | page = Candidates newCandidatesModel }
            , Cmd.map GotCandidatesMsg candidatesCmd
            )

        ( GotCandidatesResponse (Ok candidates), Candidates candidatesModel ) ->
            ( { model
                | page =
                    Candidates.receiveCandidates candidatesModel candidates
                        |> Candidates
              }
            , Cmd.none
            )

        ( GotCandidatesResponse (Ok candidates), Loading token ) ->
            ( { model
                | page =
                    Candidates.receiveCandidates (Candidates.init token) candidates
                        |> Candidates
              }
            , Cmd.none
            )

        ( GotCandidatesResponse err, _ ) ->
            ( model, Cmd.none )

        ( GotLoginError error, NotLoggedIn route state ) ->
            ( { model | page = Page.Login.withErrors state [ ( Page.Login.Global, error ) ] |> NotLoggedIn route }, Cmd.none )

        -- Candidacies
        ( GotCandidaciesMsg candidaciesMsg, Candidacies candidaciesModel ) ->
            let
                ( newCandidaciesModel, candidaciesCmd ) =
                    Candidacies.update candidaciesMsg candidaciesModel
            in
            ( { model | page = Candidacies newCandidaciesModel }
            , Cmd.map GotCandidaciesMsg candidaciesCmd
            )

        -- Auth
        ( GotLoggedIn token, NotLoggedIn route _ ) ->
            let
                redirectRoute =
                    case route of
                        Login ->
                            Home

                        _ ->
                            route

                ( candidaciesModel, candidaciesCmd ) =
                    Candidacies.init model.endpoint token
            in
            ( { model | page = Candidacies candidaciesModel }
            , Cmd.batch
                [ Cmd.map GotCandidaciesMsg candidaciesCmd
                , Nav.pushUrl model.key (Route.toString model.baseUrl redirectRoute)
                ]
            )

        _ ->
            ( model, Cmd.none )


updateWith : (subModel -> Page) -> (subMsg -> Msg) -> Model -> ( subModel, Cmd subMsg ) -> ( Model, Cmd Msg )
updateWith toModel toMsg model ( subModel, subCmd ) =
    ( { model | page = toModel subModel }
    , Cmd.map toMsg subCmd
    )


withAuthHandle : (Result Http.Error a -> Msg) -> Result Http.Error a -> Msg
withAuthHandle msg result =
    case result of
        Ok _ ->
            msg result

        Err (Http.BadStatus 400) ->
            GotLoginError "Vos identifiants sont incorrects"

        Err (Http.BadStatus 401) ->
            GotLoginError "Vos identifiants sont incorrects"

        Err (Http.BadStatus 403) ->
            GotLoginError "Vous n'êtes pas autorisé à vous connecter"

        Err Http.NetworkError ->
            GotLoginError "Une erreur réseau est survenue, veuillez réitérer"

        _ ->
            GotLoginError "Une erreur technique est survenue, si le problème veuillez contacter votre correspondant REVA."


init : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
    initWithoutToken flags url key


initWithoutToken : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
initWithoutToken flags url key =
    let
        model : Model
        model =
            { key = key
            , baseUrl = flags.baseUrl
            , endpoint = flags.endpoint
            , page = NotLoggedIn (Debug.log "" (Route.fromUrl flags.baseUrl url)) Page.Login.init
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


port storeToken : String -> Cmd msg


port removeToken : () -> Cmd msg
