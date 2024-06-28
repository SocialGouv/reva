module Page.Candidacy exposing
    ( Model
    , Msg
    , init
    , resetSelected
    , update
    , updateTab
    , view
    )

import Accessibility exposing (h1)
import Admin.Enum.FinanceModule as FinanceModule
import Api.Candidacy
import Api.Form.Admissibility
import Api.Form.PaymentRequestUniFvae
import Api.Form.PaymentRequestUniReva
import Api.Form.PaymentUploadsAndConfirmationUniFvae
import Api.Form.PaymentUploadsUniReva
import Api.Referential
import Api.Token
import Browser.Navigation as Nav
import Data.Candidacy as Candidacy exposing (Candidacy, CandidacyId, candidacyIdToString)
import Data.Context exposing (Context)
import Data.Form.PaymentRequestUniFvae
import Data.Form.PaymentRequestUniReva
import Data.Form.PaymentUploadsAndConfirmationUniFvae
import Data.Referential exposing (Referential)
import Html exposing (Html, div, text)
import Html.Attributes exposing (class, name)
import Page.Form as Form
import Page.Form.Admissibility
import Page.Form.PaymentRequestUniFvae
import Page.Form.PaymentRequestUniReva
import Page.Form.PaymentUploadsAndConfirmationUniFvae
import Page.Form.PaymentUploadsUniReva
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import View
import View.Candidacy
import View.Candidacy.NavigationSteps as NavigationSteps
import View.Candidacy.Tab exposing (Tab, Value(..))
import View.Tabs


type Msg
    = GotCandidacyResponse (RemoteData (List String) Candidacy)
    | GotCandidacyDeletionResponse (RemoteData (List String) String)
    | GotCandidacyArchivingResponse (RemoteData (List String) ())
    | GotCandidacyUnarchivingResponse (RemoteData (List String) ())
    | GotCandidacyTakingOverResponse (RemoteData (List String) ())
    | GotFormMsg (Form.Msg ( Candidacy, Referential ))
    | GotReferentialResponse (RemoteData (List String) Referential)


type alias State =
    { referential : RemoteData (List String) Referential
    }


type alias Model =
    { form : Form.Model ( Candidacy, Referential )
    , selected : RemoteData (List String) Candidacy
    , state : State
    , tab : Tab
    }


init : Context -> Tab -> ( Model, Cmd Msg )
init context tab =
    let
        ( formModel, formCmd ) =
            Form.init

        defaultModel : Model
        defaultModel =
            { form = formModel
            , selected = NotAsked
            , state = { referential = RemoteData.NotAsked }
            , tab = tab
            }

        defaultCmd =
            Cmd.batch
                [ Api.Referential.get context.endpoint context.token GotReferentialResponse
                , Cmd.map GotFormMsg formCmd
                ]
    in
    ( defaultModel, defaultCmd )
        |> updateTab context tab


initCandidacy : Context -> CandidacyId -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
initCandidacy context candidacyId ( model, cmd ) =
    ( { model | selected = Loading }
    , Cmd.batch [ Api.Candidacy.get context.endpoint context.token GotCandidacyResponse candidacyId, cmd ]
    )


resetSelected : ( Model, Cmd msg ) -> ( Model, Cmd msg )
resetSelected ( model, cmd ) =
    ( { model | selected = NotAsked }, cmd )


withReferential : RemoteData (List String) Referential -> State -> State
withReferential referential state =
    { state | referential = referential }



-- VIEW


view :
    Context
    -> Model
    -> Html Msg
view context model =
    let
        newCandidacySummaryPageActive =
            List.member "NEW_CANDIDACY_SUMMARY_PAGE" context.activeFeatures

        urlAndTarget =
            if newCandidacySummaryPageActive then
                ( context.adminReactUrl ++ "/candidacies/" ++ candidacyIdToString model.tab.candidacyId ++ "/summary", "_self" )

            else
                ( Route.toString context.baseUrl (Route.Candidacy (Tab model.tab.candidacyId View.Candidacy.Tab.Profile)), "" )

        viewArticle name c =
            View.article
                name
                (Tuple.first urlAndTarget)
                "Aperçu de la candidature"
                c

        viewWithTabs name title tabs activeTabContent =
            viewArticle name
                [ h1 [ class "text-dsfrBlack-500 text-4xl mb-8" ] [ text title ]
                , View.Tabs.view tabs activeTabContent
                ]

        viewForm name =
            viewArticle
                name
                [ Form.view (RemoteData.map2 Tuple.pair model.selected model.state.referential) model.form
                    |> Html.map GotFormMsg
                ]

        candidacyLink candidacyId tab =
            Route.toString context.baseUrl (Route.Candidacy <| Tab candidacyId tab)

        displayWithCandidacy f =
            case model.selected of
                Success candidacy ->
                    f candidacy

                _ ->
                    div [ class "h-[800px]" ] []

        juryDateTab candidacyId isActive =
            { label = "Date de jury"
            , href = candidacyLink candidacyId JuryDate
            , isActive = isActive
            }

        juryResultTab candidacyId isActive =
            { label = "Résultat"
            , href = candidacyLink candidacyId JuryResult
            , isActive = isActive
            }

        content =
            case model.tab.value of
                Archive ->
                    viewForm "archive"

                Unarchive ->
                    viewForm "unarchive"

                DropOut ->
                    viewForm "drop-out"

                CancelDropOut ->
                    viewForm "cancel-drop-out"

                FundingRequest ->
                    case model.selected of
                        Success candidacy ->
                            viewForm "funding"

                        _ ->
                            div [] []

                PaymentRequest ->
                    case model.selected of
                        Success candidacy ->
                            case candidacy.financeModule of
                                FinanceModule.Unireva ->
                                    viewForm "payment"

                                FinanceModule.Unifvae ->
                                    viewForm "payment"

                                FinanceModule.Hors_plateforme ->
                                    div [] []

                        _ ->
                            div [] []

                PaymentRequestConfirmation ->
                    viewForm "payment-confirmation"

                PaymentUploads ->
                    viewForm "payment-uploads"

                Profile ->
                    viewCandidacyPanel context model

                Admissibility ->
                    viewForm "admissibility"

                JuryDate ->
                    displayWithCandidacy <|
                        \candidacy ->
                            viewWithTabs "jury"
                                "Jury"
                                [ juryDateTab candidacy.id True
                                , juryResultTab candidacy.id False
                                ]
                                []

                JuryResult ->
                    displayWithCandidacy <|
                        \candidacy ->
                            viewWithTabs "jury"
                                "Jury"
                                [ juryDateTab candidacy.id False
                                , juryResultTab candidacy.id True
                                ]
                                []
    in
    View.layout context
        "Accéder aux étapes du parcours"
        (NavigationSteps.view model.selected)
        [ content ]


viewCandidacyPanel : Context -> Model -> Html Msg
viewCandidacyPanel context model =
    viewMain context "profile" <|
        case model.selected of
            NotAsked ->
                []

            Loading ->
                [ View.skeleton "mt-6 mb-10 w-full sm:w-96 h-8"
                , View.skeleton "mb-12 w-full w-96 h-5"
                , View.skeleton "w-full h-32 mb-6"
                , View.skeleton "w-full h-64 mb-6"
                , View.skeleton "w-full h-64 mb-12"
                ]

            Failure errors ->
                List.map text errors

            Success candidacy ->
                View.Candidacy.view
                    context
                    { candidacy = candidacy
                    , referential = model.state.referential
                    }


viewMain : Context -> String -> List (Html msg) -> Html msg
viewMain context dataTest content =
    View.article
        dataTest
        (Route.toString context.baseUrl (Route.Candidacies Route.emptyCandidacyFilters))
        "Toutes les candidatures"
        content



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    case msg of
        GotCandidacyResponse remoteCandidacy ->
            ( { model | selected = remoteCandidacy }, Cmd.none )
                |> updateTab context model.tab

        GotCandidacyDeletionResponse (Failure err) ->
            ( { model | selected = Failure err }, Cmd.none )

        GotCandidacyDeletionResponse _ ->
            ( { model | selected = NotAsked }, Cmd.none )

        GotCandidacyArchivingResponse _ ->
            ( { model | selected = NotAsked }, Cmd.none )

        GotCandidacyUnarchivingResponse _ ->
            ( { model | selected = NotAsked }, Cmd.none )

        GotCandidacyTakingOverResponse _ ->
            ( model, Cmd.none )

        GotFormMsg formMsg ->
            let
                ( formModel, formCmd ) =
                    Form.update context formMsg model.form
            in
            ( { model | form = formModel }, Cmd.map GotFormMsg formCmd )

        GotReferentialResponse remoteReferentials ->
            ( { model | state = model.state |> withReferential remoteReferentials }
            , Cmd.none
            )


updateTab : Context -> Tab -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
updateTab context tab ( model, cmd ) =
    let
        newModel =
            { model | tab = tab }

        candidacyTab tabValue =
            Route.Candidacy (Tab tab.candidacyId tabValue)

        pushUrl tabValue =
            Nav.pushUrl
                context.navKey
                (Route.toString context.baseUrl tabValue)

        newCandidacySummaryPageActive =
            List.member "NEW_CANDIDACY_SUMMARY_PAGE" context.activeFeatures

        redirectToProfile =
            if newCandidacySummaryPageActive then
                Nav.load (context.adminReactUrl ++ "/candidacies/" ++ candidacyIdToString tab.candidacyId ++ "/summary")

            else
                pushUrl <| candidacyTab Profile
    in
    case ( tab.value, model.selected ) of
        ( View.Candidacy.Tab.PaymentRequest, Success candidacy ) ->
            let
                ( formModel, formCmd ) =
                    if candidacy.financeModule == FinanceModule.Unifvae then
                        Form.updateForm context
                            { form = Page.Form.PaymentRequestUniFvae.form candidacy.certification
                            , onLoad = Just <| Api.Form.PaymentRequestUniFvae.get tab.candidacyId
                            , onSave = Nothing
                            , onSubmit = Api.Form.PaymentRequestUniFvae.createOrUpdate tab.candidacyId
                            , onRedirect = pushUrl <| candidacyTab PaymentUploads
                            , onValidate = Data.Form.PaymentRequestUniFvae.validate
                            , status =
                                if Candidacy.isPaymentRequestSent candidacy then
                                    Form.ReadOnly

                                else
                                    Form.Editable
                            }
                            model.form

                    else
                        Form.updateForm context
                            { form = Page.Form.PaymentRequestUniReva.form candidacy.certification
                            , onLoad = Just <| Api.Form.PaymentRequestUniReva.get tab.candidacyId
                            , onSave = Nothing
                            , onSubmit = Api.Form.PaymentRequestUniReva.createOrUpdate tab.candidacyId
                            , onRedirect = pushUrl <| candidacyTab PaymentUploads
                            , onValidate = Data.Form.PaymentRequestUniReva.validate
                            , status =
                                if Candidacy.isPaymentRequestSent candidacy then
                                    Form.ReadOnly

                                else
                                    Form.Editable
                            }
                            model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Tab.PaymentUploads, Success candidacy ) ->
            let
                ( formModel, formCmd ) =
                    if candidacy.financeModule == FinanceModule.Unifvae then
                        Form.updateForm context
                            { form =
                                Page.Form.PaymentUploadsAndConfirmationUniFvae.form
                                    { backUrl =
                                        Route.toString context.baseUrl <|
                                            Route.Candidacy (Tab candidacy.id View.Candidacy.Tab.PaymentRequest)
                                    }
                            , onLoad = Just <| Api.Form.PaymentRequestUniFvae.get tab.candidacyId
                            , onSave = Nothing
                            , onSubmit = Api.Form.PaymentUploadsAndConfirmationUniFvae.submit tab.candidacyId context.restApiEndpoint
                            , onRedirect = redirectToProfile
                            , onValidate = Data.Form.PaymentUploadsAndConfirmationUniFvae.validateConfirmation
                            , status = Form.Editable
                            }
                            model.form

                    else
                        Form.updateForm context
                            { form = Page.Form.PaymentUploadsUniReva.form
                            , onLoad = Nothing
                            , onSave = Nothing
                            , onSubmit = Api.Form.PaymentUploadsUniReva.submit tab.candidacyId context.restApiEndpoint
                            , onRedirect = pushUrl <| candidacyTab PaymentRequestConfirmation
                            , onValidate = \_ _ -> Ok ()
                            , status = Form.Editable
                            }
                            model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Tab.PaymentRequestConfirmation, Success _ ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.PaymentRequestUniReva.confirmationForm
                        , onLoad = Just <| Api.Form.PaymentRequestUniReva.get tab.candidacyId
                        , onSave = Nothing
                        , onSubmit = Api.Form.PaymentRequestUniReva.confirm tab.candidacyId
                        , onRedirect = redirectToProfile
                        , onValidate = Data.Form.PaymentRequestUniReva.validateConfirmation
                        , status = Form.Editable
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Tab.Admissibility, Success _ ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.Admissibility.form
                        , onLoad = Just <| Api.Form.Admissibility.get tab.candidacyId
                        , onSave = Nothing
                        , onSubmit = Api.Form.Admissibility.update tab.candidacyId
                        , onRedirect = redirectToProfile
                        , onValidate = \_ _ -> Ok ()
                        , status = Form.Editable
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Tab.Profile, NotAsked ) ->
            initCandidacy context tab.candidacyId ( newModel, cmd )
                |> withTakeOver context tab.candidacyId


        ( _, NotAsked ) ->
            initCandidacy context tab.candidacyId ( newModel, cmd )

        _ ->
            ( newModel, cmd )


withTakeOver : Context -> CandidacyId -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
withTakeOver context candidacyId ( model, cmds ) =
    let
        isAdmin =
            Api.Token.isAdmin context.token

        -- admins can never take over a candidacy
        commands =
            if not isAdmin then
                [ cmds, Api.Candidacy.takeOver context.endpoint context.token GotCandidacyTakingOverResponse candidacyId ]

            else
                [ cmds ]
    in
    ( model, Cmd.batch commands )
