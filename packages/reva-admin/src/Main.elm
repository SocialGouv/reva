port module Main exposing (main)

import Api exposing (Token)
import Browser
import Browser.Navigation as Nav
import Data.Candidacy exposing (CandidacySummary)
import Data.Candidate exposing (Candidate)
import Html.Styled as Html exposing (Html, div, toUnstyled)
import Http
import Page.Candidacies as Candidacies exposing (Model)
import Page.Candidates as Candidates exposing (Model)
import Page.Login
import RemoteData exposing (RemoteData)
import Request
import Route exposing (Route(..))
import Url exposing (Url)
import Validate
import View


type alias Flags =
    { token : Maybe String
    , baseUrl : String
    }



-- MODEL


type alias Model =
    { key : Nav.Key
    , baseUrl : String
    , state : State
    }


type State
    = NotLoggedIn Page.Login.Model
    | LoggedIn Token Page


type Page
    = Candidacies Candidacies.Model
    | Candidates Candidates.Model
    | Loading


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
    | GotCandidaciesResponse (RemoteData String (List CandidacySummary))


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
    case model.state of
        NotLoggedIn loginModel ->
            Page.Login.view
                { onSubmit = GotLoginSubmit
                , onUpdateModel = GotLoginUpdate
                }
                loginModel

        LoggedIn _ (Candidacies candidaciesModel) ->
            Candidacies.view candidaciesModel
                |> Html.map GotCandidaciesMsg
                |> View.layout
                    { onLogout = UserLoggedOut
                    }

        LoggedIn _ (Candidates candidateModel) ->
            Candidates.view candidateModel
                |> Html.map GotCandidatesMsg
                |> View.layout
                    { onLogout = UserLoggedOut
                    }

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
            ( { model | state = LoggedIn token (Candidates <| Candidates.init token) }
            , Cmd.batch
                [ if loginModel.form.rememberMe then
                    storeToken (Api.tokenToString token)

                  else
                    Cmd.none
                , Api.fetchCandidates GotCandidatesResponse { token = token }
                , Nav.pushUrl model.key (Route.fromRoute model.baseUrl Route.Home)
                ]
            )

        ( GotCandidatesMsg candidatesMsg, LoggedIn token (Candidates candidatesModel) ) ->
            let
                ( newCandidatesModel, candidatesCmd ) =
                    Candidates.update candidatesMsg candidatesModel
            in
            ( { model | state = LoggedIn token (Candidates newCandidatesModel) }
            , Cmd.map GotCandidatesMsg candidatesCmd
            )

        ( GotCandidatesResponse (Ok candidates), LoggedIn token (Candidates candidatesModel) ) ->
            ( { model
                | state =
                    Candidates.receiveCandidates candidatesModel candidates
                        |> Candidates
                        |> LoggedIn token
              }
            , Cmd.none
            )

        ( GotCandidatesResponse (Ok candidates), LoggedIn token Loading ) ->
            ( { model
                | state =
                    Candidates.receiveCandidates (Candidates.init token) candidates
                        |> Candidates
                        |> LoggedIn token
              }
            , Cmd.none
            )

        ( GotCandidatesResponse err, LoggedIn _ _ ) ->
            ( model, Cmd.none )

        ( GotLoginError error, NotLoggedIn state ) ->
            ( { model | state = Page.Login.withErrors state [ ( Page.Login.Global, error ) ] |> NotLoggedIn }, Cmd.none )

        ( GotLoginError _, _ ) ->
            ( { model | state = NotLoggedIn Page.Login.init }, Cmd.batch [ Nav.pushUrl model.key (Route.fromRoute model.baseUrl Route.Login) ] )

        -- Candidacies
        ( GotCandidaciesMsg candidaciesMsg, LoggedIn token (Candidacies candidaciesModel) ) ->
            let
                ( newCandidaciesModel, candidaciesCmd ) =
                    Candidacies.update candidaciesMsg candidaciesModel
            in
            ( { model | state = LoggedIn token (Candidacies newCandidaciesModel) }
            , Cmd.map GotCandidaciesMsg candidaciesCmd
            )

        ( GotCandidaciesResponse remoteCandidacies, LoggedIn token Loading ) ->
            ( { model
                | state =
                    Candidacies.receiveRemoteCandidacies (Candidacies.init token) remoteCandidacies
                        |> Candidacies
                        |> LoggedIn token
              }
            , Cmd.none
            )

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
            Loading
                |> LoggedIn (Api.stringToToken "")

        --case flags.token of
        --    Just token ->
        --        LoggedIn (Api.stringToToken token) Loading
        --    Nothing ->
        --        NotLoggedIn Page.Login.init
    in
    ( { key = key
      , baseUrl = flags.baseUrl
      , state = state
      }
    , case state of
        NotLoggedIn _ ->
            Nav.pushUrl key (Route.fromRoute flags.baseUrl Route.Login)

        LoggedIn token _ ->
            Request.requestCandidacies "http://localhost:8080/graphql" GotCandidaciesResponse
    )


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none



-- PORT


port storeToken : String -> Cmd msg


port removeToken : () -> Cmd msg
