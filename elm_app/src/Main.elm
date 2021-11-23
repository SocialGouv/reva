port module Main exposing (main)

import Api
import Browser
import Browser.Navigation as Nav
import Html.Styled exposing (Html, div, toUnstyled)
import Http
import Page.Candidates as Candidates exposing (Candidate, Model)
import Page.Login
import Route exposing (Route(..))
import Url exposing (Url)
import Validate
import View


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
    | UserLoggedOut
    | UserSelectedCandidate Candidate
    | UserAddedFilter String
    | GotLoginError String
      -- PROFILE
    | GotProfileResponse (Result Http.Error ())
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
    , body =
        [ viewPage model
            |> toUnstyled
        ]
    }


viewPage : Model -> Html Msg
viewPage model =
    let
        config =
            { onFilter = UserAddedFilter
            , onLogout = UserLoggedOut
            , onSelect = UserSelectedCandidate
            }
    in
    case model.state of
        NotLoggedIn loginModel ->
            Page.Login.view
                { onSubmit = GotLoginSubmit
                , onUpdateModel = GotLoginUpdate
                }
                loginModel

        LoggedIn _ (Home candidateModel) ->
            Candidates.view config candidateModel
                |> View.layout config

        _ ->
            div [] []



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model.state ) of
        ( BrowserChangedUrl _, _ ) ->
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

        ( UserAddedFilter filter, LoggedIn token (Home candidatesModel) ) ->
            ( { model
                | state =
                    Candidates.addFilter candidatesModel filter
                        |> Home
                        |> LoggedIn token
              }
            , Cmd.none
            )

        ( UserSelectedCandidate candidate, LoggedIn token (Home candidatesModel) ) ->
            ( { model
                | state =
                    Candidates.selectCandidate candidatesModel candidate
                        |> Home
                        |> LoggedIn token
              }
            , Cmd.none
            )

        ( UserLoggedOut, LoggedIn _ _ ) ->
            ( model, removeToken () )

        ( GotLoginUpdate loginModel, NotLoggedIn _ ) ->
            ( { model | state = NotLoggedIn loginModel }, Cmd.none )

        ( GotLoginSubmit, NotLoggedIn loginModel ) ->
            case Page.Login.validateLogin loginModel of
                Ok validateModel ->
                    ( model, Validate.fromValid validateModel |> Api.login (GotLoginResponse |> withAuthHandle) )

                Err errors ->
                    ( { model | state = Page.Login.withErrors loginModel errors |> NotLoggedIn }, Cmd.none )

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

        ( GotCandidatesResponse (Ok candidates), LoggedIn token (Home candidatesModel) ) ->
            ( { model
                | state =
                    Candidates.receiveCandidates candidatesModel candidates
                        |> Home
                        |> LoggedIn token
              }
            , Cmd.none
            )

        ( GotCandidatesResponse (Ok candidates), LoggedIn token Loading ) ->
            ( { model
                | state =
                    Candidates.receiveCandidates Candidates.init candidates
                        |> Home
                        |> LoggedIn token
              }
            , Cmd.none
            )

        ( GotCandidatesResponse err, LoggedIn _ _ ) ->
            let
                _ =
                    Debug.log "" err
            in
            ( model, Cmd.none )

        ( GotLoginError error, NotLoggedIn state ) ->
            ( { model | state = Page.Login.withErrors state [ ( Page.Login.Global, error ) ] |> NotLoggedIn }, Cmd.none )

        ( GotLoginError _, _ ) ->
            ( { model | state = NotLoggedIn Page.Login.init }, Cmd.batch [ Nav.pushUrl model.key (Route.fromRoute model.baseUrl Route.Login) ] )

        _ ->
            ( model, Cmd.none )


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
init flags _ key =
    let
        state =
            case flags.token of
                Just token ->
                    LoggedIn (Token token) Loading

                Nothing ->
                    NotLoggedIn Page.Login.init
    in
    ( { key = key
      , baseUrl = flags.baseUrl
      , state = state
      }
    , case state of
        NotLoggedIn _ ->
            Nav.pushUrl key (Route.fromRoute flags.baseUrl Route.Login)

        LoggedIn (Token token) _ ->
            Api.fetchCandidates (GotCandidatesResponse |> withAuthHandle) { token = token }
    )


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none



-- PORT


port storeToken : String -> Cmd msg


port removeToken : () -> Cmd msg
