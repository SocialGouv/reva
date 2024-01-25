module Page.Account exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Accessibility exposing (h1, h2)
import Api.Account
import Api.Form.Account
import Api.Form.CertificationAuthority
import Api.Form.Organism
import Browser.Navigation as Nav
import Data.Account exposing (Account)
import Data.Context exposing (Context)
import Data.Form exposing (FormData)
import Data.Form.Account
import Data.Form.CertificationAuthority
import Data.Form.Organism
import Html exposing (Html, div, text)
import Html.Attributes exposing (class)
import Page.Form as Form exposing (Form)
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import View
import View.Helpers exposing (dataTest)


type Msg
    = GotAccountResponse (RemoteData (List String) Account)
    | GotFormAccountMsg (Form.Msg ())
    | GotFormStructureMsg (Form.Msg ())


type alias State =
    { account : RemoteData (List String) Account
    , errors : List String
    }


type alias Model =
    { formAccount : Form.Model ()
    , formStructure : Form.Model ()
    , state : State
    }


init : Context -> String -> ( Model, Cmd Msg )
init context accountId =
    let
        ( formAccountModel, formAccountCmd ) =
            Form.updateForm context
                { form = formAccount
                , onLoad = Just <| Api.Form.Account.get accountId
                , onSave = Nothing
                , onSubmit = Api.Form.Account.update accountId
                , onRedirect = Nav.pushUrl context.navKey (Route.toString context.baseUrl <| Route.Account accountId)
                , onValidate = \_ _ -> Ok ()
                , status = Form.Editable
                }
                Form.empty

        ( formStructureModel, formStructureCmd ) =
            Form.init

        defaultModel : Model
        defaultModel =
            { formAccount = formAccountModel
            , formStructure = formStructureModel
            , state =
                { account = RemoteData.Loading
                , errors = []
                }
            }

        defaultCmd =
            Api.Account.get context.endpoint context.token GotAccountResponse accountId
    in
    ( defaultModel, Cmd.batch [ Cmd.map GotFormAccountMsg formAccountCmd, defaultCmd, Cmd.map GotFormStructureMsg formStructureCmd ] )



-- VIEW


formAccount : FormData -> () -> Form
formAccount _ _ =
    let
        keys =
            Data.Form.Account.keys
    in
    { elements =
        [ ( "", Form.Title2 "Informations compte utilisateur" )
        , ( keys.firstname, Form.InputRequired "Prénom" )
        , ( keys.lastname, Form.InputRequired "Nom" )
        , ( keys.email, Form.EmailRequired "Email" )
        ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = ""
    }


formOrganism : FormData -> () -> Form
formOrganism _ _ =
    let
        keys =
            Data.Form.Organism.keys

        radioListOptions =
            [ ( "enabled", Data.Form.Organism.Enabled )
            , ( "disabled", Data.Form.Organism.Disabled )
            ]
                |> List.map (\( id, status ) -> ( id, Data.Form.Organism.organismStatusToString status ))
    in
    { elements =
        [ ( "", Form.Title2 "Informations structure" )
        , ( keys.label, Form.InputRequired "Raison sociale" )
        , ( keys.website, Form.Input "Website" )
        , ( "", Form.Break )
        , ( keys.contactAdministrativeEmail, Form.EmailRequired "Email de contact" )
        , ( keys.contactAdministrativePhone, Form.Input "Téléphone" )
        , ( "", Form.Break )
        , ( keys.isActive, Form.RadioList "Statut de la structure" radioListOptions )
        ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = ""
    }


formCertificationAuthority : FormData -> () -> Form
formCertificationAuthority _ _ =
    let
        keys =
            Data.Form.CertificationAuthority.keys
    in
    { elements =
        [ ( "", Form.Title2 "Informations autorité de certification" )
        , ( keys.label, Form.InputRequired "Raison sociale" )
        , ( keys.contactFullName, Form.Input "Nom complet" )
        , ( keys.contactEmail, Form.EmailRequired "Email de contact" )
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
    View.layout
        ""
        []
        [ viewContent context model ]


viewContent : Context -> Model -> Html Msg
viewContent context model =
    View.article
        "account"
        (Route.toString context.baseUrl (Route.Accounts Route.emptyAccountFilters))
        "Tous les comptes"
        [ div
            [ dataTest "directory-item"
            , class "flex flex-wrap"
            ]
            [ h1 [ class "w-full mb-0" ] [ text "Compte utilisateur" ]
            , Form.view (RemoteData.succeed ()) model.formAccount
                |> Html.map GotFormAccountMsg
            , viewStructure context model
            ]
        ]


viewStructure : Context -> Model -> Html Msg
viewStructure _ model =
    case model.state.account of
        NotAsked ->
            div [] []

        Loading ->
            div [] []

        Failure errors ->
            View.errors errors

        Success _ ->
            Form.view (RemoteData.succeed ()) model.formStructure
                |> Html.map GotFormStructureMsg


viewTitle : String -> Accessibility.Html msg
viewTitle s =
    h2 [ class "w-full mt-6 mb-1 text-xl" ] [ text s ]


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    let
        state =
            model.state
    in
    case msg of
        GotAccountResponse remoteAccount ->
            ( { model | state = { state | account = remoteAccount } }, Cmd.none )
                |> updateStructure context

        GotFormAccountMsg formMsg ->
            let
                ( formModel, formCmd ) =
                    Form.update context formMsg model.formAccount
            in
            ( { model | formAccount = formModel }, Cmd.map GotFormAccountMsg formCmd )

        GotFormStructureMsg formMsg ->
            let
                ( formModel, formCmd ) =
                    Form.update context formMsg model.formStructure
            in
            ( { model | formStructure = formModel }, Cmd.map GotFormStructureMsg formCmd )


updateStructure : Context -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
updateStructure context ( model, cmd ) =
    case model.state.account of
        NotAsked ->
            ( model, Cmd.none )

        Loading ->
            ( model, Cmd.none )

        Failure _ ->
            ( model, Cmd.none )

        Success account ->
            let
                organismId =
                    Maybe.withDefault "" (Maybe.map .id account.organism)

                certificationAuthorityId =
                    Maybe.withDefault "" (Maybe.map .id account.certificationAuthority)
            in
            if account.organism /= Nothing then
                let
                    ( formStructureModel, formStructureCmd ) =
                        Form.updateForm context
                            { form = formOrganism
                            , onLoad = Just <| Api.Form.Organism.get organismId
                            , onSave = Nothing
                            , onSubmit = Api.Form.Organism.update organismId
                            , onRedirect = Nav.pushUrl context.navKey (Route.toString context.baseUrl <| Route.Account account.id)
                            , onValidate = \_ _ -> Ok ()
                            , status = Form.Editable
                            }
                            model.formStructure
                in
                ( { model | formStructure = formStructureModel }, Cmd.batch [ cmd, Cmd.map GotFormStructureMsg formStructureCmd ] )

            else if account.certificationAuthority /= Nothing then
                let
                    ( formStructureModel, formStructureCmd ) =
                        Form.updateForm context
                            { form = formCertificationAuthority
                            , onLoad = Just <| Api.Form.CertificationAuthority.get certificationAuthorityId
                            , onSave = Nothing
                            , onSubmit = Api.Form.CertificationAuthority.update certificationAuthorityId
                            , onRedirect = Nav.pushUrl context.navKey (Route.toString context.baseUrl <| Route.Account account.id)
                            , onValidate = \_ _ -> Ok ()
                            , status = Form.Editable
                            }
                            model.formStructure
                in
                ( { model | formStructure = formStructureModel }, Cmd.batch [ cmd, Cmd.map GotFormStructureMsg formStructureCmd ] )

            else
                ( model, Cmd.none )
