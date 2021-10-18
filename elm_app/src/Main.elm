port module Main exposing (main)

import Api
import Browser
import Browser.Navigation as Nav
import Html.Styled exposing (Html, a, button, div, form, h2, img, input, label, span, text, toUnstyled)
import Html.Styled.Attributes exposing (action, alt, class, for, href, id, method, name, placeholder, src, type_, value)
import Html.Styled.Events exposing (onClick)
import Http
import Page.Candidates as Candidates exposing (Candidate, Model)
import Page.Login
import Route exposing (Route(..))
import Url exposing (Url)
import Validate


type alias Flags =
    { token : Maybe String
    , baseUrl : String
    }



-- MODEL


type Token
    = Token String


type alias Model =
    { key : Nav.Key
    , baseUrl : String
    , state : State
    }


type State
    = NotLoggedIn Page.Login.Model
    | LoggedIn Token Page


type Page
    = Home Candidates.Model
    | Loading


type Msg
    = -- Message naming conventions: https://youtu.be/w6OVDBqergc
      BrowserChangedUrl Url
    | UserClickedLink Browser.UrlRequest
      -- LOGIN
    | GotLoginUpdate Page.Login.Model
    | GotLoginSubmit
    | GotLoginResponse (Result Http.Error String)
    | GotCandidatesResponse (Result Http.Error (List Candidate))


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
    , body = [ div [] [ viewPage model ] |> toUnstyled ]
    }


viewPage : Model -> Html Msg
viewPage model =
    case model.state of
        NotLoggedIn loginModel ->
            Page.Login.view
                { onSubmit = GotLoginSubmit
                , onUpdateModel = GotLoginUpdate
                }
                loginModel

        LoggedIn _ (Home candidateModel) ->
            Candidates.view candidateModel

        _ ->
            div [] []



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model.state ) of
        ( BrowserChangedUrl url, _ ) ->
            -- ( { model | route = Route.fromUrl "app" url }
            ( model
            , Cmd.none
            )

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

        ( GotLoginUpdate loginModel, NotLoggedIn _ ) ->
            ( { model | state = NotLoggedIn loginModel }, Cmd.none )

        ( GotLoginSubmit, NotLoggedIn loginModel ) ->
            case Page.Login.validateLogin loginModel of
                Ok validateModel ->
                    ( model, Validate.fromValid validateModel |> Api.login GotLoginResponse )

                Err errors ->
                    ( model, Cmd.none )

        ( GotLoginResponse (Ok token), NotLoggedIn loginModel ) ->
            ( { model | state = LoggedIn (Token token) (Home Candidates.init) }
            , Cmd.batch
                [ if loginModel.form.rememberMe then
                    storeToken token

                  else
                    Cmd.none
                , Api.fetchCandidates GotCandidatesResponse { token = token }
                , Nav.pushUrl model.key (Route.fromRoute model.baseUrl Route.Home)
                ]
            )

        ( GotLoginResponse (Err _), NotLoggedIn _ ) ->
            -- TODO: Manage the Err
            ( model, Cmd.none )

        ( GotCandidatesResponse (Ok candidates), LoggedIn token _ ) ->
            ( { model
                | state =
                    Candidates.receiveCandidates candidates
                        |> Home
                        |> LoggedIn token
              }
            , Cmd.none
            )

        _ ->
            ( model, Cmd.none )


init : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
    let
        state =
            case flags.token of
                Just token ->
                    LoggedIn (Token token) Loading

                Nothing ->
                    NotLoggedIn Page.Login.init

        route =
            Route.fromUrl flags.baseUrl url
    in
    ( { key = key
      , baseUrl = flags.baseUrl
      , state = state
      }
    , case state of
        NotLoggedIn _ ->
            Nav.pushUrl key (Route.fromRoute flags.baseUrl Route.Login)

        LoggedIn (Token token) _ ->
            Api.fetchCandidates GotCandidatesResponse { token = token }
    )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- PORT


port storeToken : String -> Cmd msg
