module Page.Candidacy exposing
    ( Model
    , Msg
    , init
    , resetSelected
    , update
    , updateTab
    , view
    )

import Admin.Enum.CandidacyStatusStep as Step
import Api.Candidacy
import Api.Form.Admissibility
import Api.Form.Appointment
import Api.Form.Archive
import Api.Form.Candidate
import Api.Form.DropOut
import Api.Form.FundingRequest
import Api.Form.PaymentRequest
import Api.Form.PaymentUploads
import Api.Form.Training
import Api.Referential
import Browser.Navigation as Nav
import Data.Candidacy as Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Context exposing (Context)
import Data.Form.Archive
import Data.Form.DropOut
import Data.Form.FundingRequest
import Data.Form.PaymentRequest
import Data.Referential exposing (Referential)
import Html exposing (Html, a, article, div, node, p, span, text)
import Html.Attributes exposing (class, name)
import Page.Form as Form exposing (Form)
import Page.Form.Admissibility
import Page.Form.Appointment
import Page.Form.Archive
import Page.Form.Candidate
import Page.Form.DropOut
import Page.Form.FundingRequest
import Page.Form.PaymentRequest
import Page.Form.PaymentUploads
import Page.Form.Training
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import View
import View.Candidacy
import View.Candidacy.NavigationSteps as NavigationSteps
import View.Candidacy.Tab exposing (Tab, Value(..))
import View.Helpers exposing (dataTest)


type Msg
    = GotCandidacyResponse (RemoteData String Candidacy)
    | GotCandidacyDeletionResponse (RemoteData String String)
    | GotCandidacyArchivingResponse (RemoteData String ())
    | GotCandidacyTakingOverResponse (RemoteData String ())
    | GotFormMsg (Form.Msg ( Candidacy, Referential ))
    | GotReferentialResponse (RemoteData String Referential)


type alias State =
    { referential : RemoteData String Referential
    }


type alias Model =
    { form : Form.Model ( Candidacy, Referential )
    , selected : RemoteData String Candidacy
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


withReferential : RemoteData String Referential -> State -> State
withReferential referential state =
    { state | referential = referential }



-- VIEW


view :
    Context
    -> Model
    -> Html Msg
view context model =
    let
        viewForm name =
            viewMain name
                [ a
                    [ Route.href context.baseUrl (Route.Candidacy (Tab model.tab.candidacyId View.Candidacy.Tab.Profile))
                    , class "flex items-center text-gray-800"
                    , class "mt-6 ml-6"
                    ]
                    [ span [ class "text-3xl mr-4" ] [ text "← " ]
                    , text "Retour"
                    ]
                , Form.view (RemoteData.map2 Tuple.pair model.selected model.state.referential) model.form
                    |> Html.map GotFormMsg
                ]

        maybeNavigationSteps =
            case model.selected of
                Success candidacy ->
                    case candidacy.dropOutDate of
                        Just droppedOutDate ->
                            NavigationSteps.dropOutView context.baseUrl candidacy droppedOutDate

                        Nothing ->
                            if (Candidacy.lastStatus candidacy.statuses |> .status) == Step.Archive then
                                NavigationSteps.archiveView context.baseUrl candidacy

                            else
                                NavigationSteps.view context.baseUrl candidacy

                _ ->
                    text ""

        content =
            case model.tab.value of
                CandidateInfo ->
                    viewForm "candidate"

                Archive ->
                    viewForm "archive"

                DropOut ->
                    viewForm "drop-out"

                FundingRequest ->
                    viewForm "funding"

                Meetings ->
                    viewForm "meetings"

                PaymentRequest ->
                    viewForm "payment"

                PaymentRequestConfirmation ->
                    viewForm "payment-confirmation"

                PaymentUploads ->
                    viewForm "payment-uploads"

                Profile ->
                    viewCandidacyPanel context model

                Training ->
                    viewForm "training"

                TrainingSent ->
                    viewMain "training-sent" (viewTrainingSent context model.tab.candidacyId)

                Admissibility ->
                    viewForm "admissibility"
    in
    div
        [ class "grow flex h-full min-w-0 border-l-[73px] border-black bg-gray-100" ]
        [ content, maybeNavigationSteps ]


viewMain : String -> List (Html msg) -> Html msg
viewMain dataTestValue =
    node "main"
        [ class "bg-white w-[780px] px-2 pt-2 pb-24"
        , dataTest dataTestValue
        ]


viewTrainingSent : Context -> CandidacyId -> List (Html msg)
viewTrainingSent context candidacyId =
    [ div
        [ class "mt-12 px-20" ]
        [ View.title "Confirmation"
        , div [ class "flex flex-col items-center w-full p-10" ]
            [ View.image [ class "w-[60px]" ] context.baseUrl "confirmation.png"
            , p
                [ class "mt-6 mb-24" ]
                [ text "Le parcours personnalisé a bien été envoyé." ]
            , View.primaryLink
                [ Route.href context.baseUrl (Route.Candidacy <| Tab candidacyId Profile) ]
                "Retour à la candidature"
            ]
        ]
    ]


viewCandidacyPanel : Context -> Model -> Html Msg
viewCandidacyPanel context model =
    viewCandidacyArticle context.baseUrl <|
        case model.selected of
            NotAsked ->
                []

            Loading ->
                [ View.skeleton "mt-6 mb-10 w-96 h-8"
                , View.skeleton "mb-3 w-48 h-6"
                , View.skeleton "mb-10 w-128 h-24"
                , View.skeleton "mb-3 w-48 h-6"
                , View.skeleton "w-128 h-64"
                ]

            Failure err ->
                [ text err ]

            Success candidacy ->
                View.Candidacy.view
                    context
                    { candidacy = candidacy
                    , referential = model.state.referential
                    }


viewCandidacyArticle : String -> List (Html msg) -> Html msg
viewCandidacyArticle baseUrl content =
    viewMain "profile"
        [ a
            [ Route.href baseUrl (Route.Candidacies Route.emptyFilters)
            , class "flex items-center text-gray-800 p-6"
            ]
            [ span [ class "text-3xl mr-4" ] [ text "← " ]
            , text "Toutes les candidatures"
            ]
        , article
            [ class "px-16" ]
            content
        ]



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
    in
    case ( tab.value, model.selected ) of
        ( View.Candidacy.Tab.Archive, Success candidacy ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.Archive.form
                        , onLoad = Just <| Api.Form.Archive.get tab.candidacyId
                        , onSave = Nothing
                        , onSubmit = Api.Form.Archive.archive tab.candidacyId
                        , onRedirect = pushUrl <| candidacyTab Profile
                        , onValidate = Data.Form.Archive.validate
                        , status =
                            if (Candidacy.lastStatus candidacy.statuses |> .status) == Step.Archive then
                                Form.ReadOnly

                            else
                                Form.Editable
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Tab.DropOut, Success candidacy ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.DropOut.form
                        , onLoad = Just <| Api.Form.DropOut.get tab.candidacyId
                        , onSave = Nothing
                        , onSubmit = Api.Form.DropOut.dropOut tab.candidacyId
                        , onRedirect = pushUrl <| candidacyTab Profile
                        , onValidate = Data.Form.DropOut.validate
                        , status =
                            if candidacy.dropOutDate /= Nothing then
                                Form.ReadOnly

                            else
                                Form.Editable
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Tab.Meetings, Success _ ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.Appointment.form
                        , onLoad = Just <| Api.Form.Appointment.get tab.candidacyId
                        , onSave = Nothing
                        , onSubmit = Api.Form.Appointment.update tab.candidacyId
                        , onRedirect = pushUrl <| candidacyTab Profile
                        , onValidate = \_ _ -> Ok ()
                        , status = Form.Editable
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Tab.PaymentRequest, Success candidacy ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.PaymentRequest.form candidacy.certification
                        , onLoad = Just <| Api.Form.PaymentRequest.get tab.candidacyId
                        , onSave = Nothing
                        , onSubmit = Api.Form.PaymentRequest.createOrUpdate tab.candidacyId
                        , onRedirect = pushUrl <| candidacyTab PaymentUploads
                        , onValidate = Data.Form.PaymentRequest.validate
                        , status =
                            if Candidacy.isPaymentRequestSent candidacy then
                                Form.ReadOnly

                            else
                                Form.Editable
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Tab.PaymentUploads, Success _ ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.PaymentUploads.form
                        , onLoad = Nothing
                        , onSave = Nothing
                        , onSubmit = Api.Form.PaymentUploads.submit tab.candidacyId context.uploadEndpoint
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
                        { form = Page.Form.PaymentRequest.confirmationForm
                        , onLoad = Just <| Api.Form.PaymentRequest.get tab.candidacyId
                        , onSave = Nothing
                        , onSubmit = Api.Form.PaymentRequest.confirm tab.candidacyId
                        , onRedirect = pushUrl <| candidacyTab Profile
                        , onValidate = Data.Form.PaymentRequest.validateConfirmation
                        , status = Form.Editable
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Tab.FundingRequest, Success candidacy ) ->
            let
                isReadOnly =
                    Candidacy.isFundingRequestSent candidacy

                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form =
                            if candidacy.dropOutDate == Nothing || isReadOnly then
                                Page.Form.FundingRequest.form candidacy.certification

                            else
                                Page.Form.FundingRequest.droppedOutForm candidacy.certification
                        , onLoad = Just <| Api.Form.FundingRequest.get tab.candidacyId candidacy
                        , onSave = Nothing
                        , onSubmit = Api.Form.FundingRequest.create tab.candidacyId
                        , onRedirect = pushUrl <| candidacyTab Profile
                        , onValidate = Data.Form.FundingRequest.validate
                        , status =
                            if isReadOnly then
                                Form.ReadOnly

                            else
                                Form.Editable
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Tab.Training, Success candidacy ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.Training.form
                        , onLoad = Just <| Api.Form.Training.get tab.candidacyId
                        , onSave = Nothing
                        , onSubmit = Api.Form.Training.update tab.candidacyId
                        , onRedirect = pushUrl <| candidacyTab TrainingSent
                        , onValidate = \_ _ -> Ok ()
                        , status =
                            if Candidacy.isFundingRequestSent candidacy then
                                Form.ReadOnly

                            else
                                Form.Editable
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Tab.CandidateInfo, Success candidacy ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.Candidate.form
                        , onLoad = candidacy.email |> Maybe.map Api.Form.Candidate.get
                        , onSave = Nothing
                        , onSubmit = Api.Form.Candidate.update
                        , onRedirect = pushUrl <| candidacyTab FundingRequest
                        , onValidate = \_ _ -> Ok ()
                        , status =
                            if Candidacy.isFundingRequestSent candidacy then
                                Form.ReadOnly

                            else
                                Form.Editable
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
                        , onRedirect = pushUrl <| candidacyTab Profile
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
    ( model, Cmd.batch [ cmds, Api.Candidacy.takeOver context.endpoint context.token GotCandidacyTakingOverResponse candidacyId ] )
