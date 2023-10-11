module Page.Account exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

-- import Admin.Enum.AccountOrganismTypology exposing (AccountOrganismTypology(..))
-- import Admin.Enum.AccountRequestStatus as AccountRequestStatus

import Accessibility exposing (a, dd, dl, dt, h1, h2, hr, pre)
import Admin.Enum.LegalStatus as LegalStatus exposing (LegalStatus(..))
import Admin.Object.Account exposing (firstname, lastname)
import Api.Account
import Api.Form.Account
import Api.Form.OrganismSubscription
import BetaGouv.DSFR.Button as Button
import Browser.Navigation as Nav
import Data.Account exposing (Account)
import Data.Context exposing (Context)
import Data.Form exposing (FormData)
import Data.Form.Account
import Data.Form.OrganismSubscription exposing (Decision(..), Status(..), decisionToString)
import Data.Referential exposing (DepartmentWithOrganismMethods)
import Html exposing (Html, div, li, text, ul)
import Html.Attributes exposing (class, href)
import Html.Attributes.Extra exposing (role)
import Page.Form as Form exposing (Form)
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import View
import View.Date exposing (toSmallFormat)
import View.Helpers exposing (dataTest)


type Msg
    = GotAccountResponse (RemoteData (List String) Account)
    | GotFormMsg (Form.Msg ())


type alias State =
    { account : RemoteData (List String) Account
    , errors : List String
    }


type alias Model =
    { form : Form.Model ()
    , state : State
    }


init : Context -> String -> ( Model, Cmd Msg )
init context accountId =
    let
        ( formModel, formCmd ) =
            Form.updateForm context
                { form = form
                , onLoad = Just <| Api.Form.Account.get accountId
                , onSave = Nothing
                , onSubmit = Api.Form.Account.update accountId
                , onRedirect = Nav.pushUrl context.navKey (Route.toString context.baseUrl <| Route.Account accountId)
                , onValidate = \_ _ -> Ok ()
                , status = Form.Editable
                }
                Form.empty

        defaultModel : Model
        defaultModel =
            { form = formModel
            , state =
                { account = RemoteData.Loading
                , errors = []
                }
            }
    in
    ( defaultModel, Cmd.batch [ Cmd.map GotFormMsg formCmd ] )



-- VIEW


form : FormData -> () -> Form
form _ _ =
    let
        keys =
            Data.Form.Account.keys
    in
    { elements =
        [ ( keys.firstname, Form.InputRequired "Prénom" )
        , ( keys.lastname, Form.InputRequired "Nom" )
        , ( keys.email, Form.EmailRequired "Email" )
        ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = ""
    }


view :
    Context
    -> Model
    -> Html Msg
view context model =
    case model.state.account of
        NotAsked ->
            div [] []

        Loading ->
            View.layout
                ""
                [ viewAccountsLink context ]
                []
                [ viewContent context model ]

        Failure errors ->
            View.errors errors

        Success account ->
            View.layout
                ""
                [ viewAccountsLink context ]
                []
                [ viewContent context model ]


viewContent : Context -> Model -> Html Msg
viewContent context model =
    View.article
        "account"
        (Route.href context.baseUrl (Route.Accounts Route.emptyAccountFilters))
        "Toutes les comptes"
        [ div
            [ dataTest "directory-item"
            , class "flex flex-wrap"
            ]
            [ h1 [ class "w-full mb-0" ] [ text "Compte utilisateur" ]
            , viewTitle "Informations générales"
            , Form.view (RemoteData.succeed ()) model.form
                |> Html.map GotFormMsg
            ]
        ]


viewTitle : String -> Accessibility.Html msg
viewTitle s =
    h2 [ class "w-full mt-6 mb-1 text-xl" ] [ text s ]


viewInfo : String -> List (Accessibility.Html msg) -> Accessibility.Html msg
viewInfo term content =
    dl
        [ class "w-full sm:w-1/2 my-2" ]
        [ dt [ class "font-normal text-sm text-gray-600 mb-1" ] [ text term ]
        , dd [ class "my-0" ] content
        ]


viewInfoText : String -> List String -> Accessibility.Html msg
viewInfoText term data =
    viewInfo term <| (List.intersperse " " data |> List.map text)



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    case msg of
        GotAccountResponse remoteAccount ->
            ( model, Cmd.none ) |> withAccount remoteAccount

        GotFormMsg formMsg ->
            let
                ( formModel, formCmd ) =
                    Form.update context formMsg model.form
            in
            ( { model | form = formModel }, Cmd.map GotFormMsg formCmd )


withErrors : List String -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
withErrors errors ( model, cmd ) =
    let
        state =
            model.state
    in
    ( { model | state = { state | errors = errors } }, cmd )


withAccount : RemoteData (List String) Account -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
withAccount account ( model, cmd ) =
    let
        state =
            model.state
    in
    ( { model | state = { state | account = account } }, cmd )


viewAccountsLink : Context -> Html msg
viewAccountsLink context =
    Button.new { onClick = Nothing, label = "Voir les comptes" }
        |> Button.linkButton (Route.toString context.baseUrl <| Route.Accounts Route.emptyAccountFilters)
        |> Button.tertiary
        |> Button.view
