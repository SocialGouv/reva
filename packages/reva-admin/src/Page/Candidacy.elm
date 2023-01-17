module Page.Candidacy exposing
    ( Model
    , Msg
    , init
    , resetSelected
    , update
    , updateTab
    , view
    )

import Api.Candidacy
import Api.Form.Admissibility
import Api.Form.Appointment
import Api.Form.Candidate
import Api.Form.DropOut
import Api.Form.FundingRequest
import Api.Form.PaymentRequest
import Api.Form.Training
import Api.Referential
import Api.Token exposing (Token)
import Browser.Navigation as Nav
import Data.Candidacy as Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Certification exposing (Certification)
import Data.Context exposing (Context)
import Data.Form.FundingRequest
import Data.Form.PaymentRequest
import Data.Organism exposing (Organism)
import Data.Referential exposing (Referential)
import Html.Styled as Html exposing (Html, a, article, aside, div, h2, h3, input, label, li, nav, node, p, span, text, ul)
import Html.Styled.Attributes exposing (action, attribute, class, classList, for, id, name, placeholder, type_)
import Html.Styled.Events exposing (onInput)
import List.Extra
import Page.Form as Form exposing (Form)
import Page.Form.Admissibility
import Page.Form.Appointment
import Page.Form.Candidate
import Page.Form.DropOut
import Page.Form.FundingRequest
import Page.Form.PaymentRequest
import Page.Form.Training
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import Time
import View
import View.Candidacy
import View.Candidacy.Filters
import View.Candidacy.NavigationSteps as NavigationSteps
import View.Candidacy.Tab exposing (Tab(..))
import View.Helpers exposing (dataTest)
import View.Icons as Icons


type Msg
    = GotCandidacyResponse (RemoteData String Candidacy)
    | GotCandidacyDeletionResponse (RemoteData String String)
    | GotCandidacyArchivingResponse (RemoteData String ())
    | GotCandidacyTakingOverResponse (RemoteData String ())
    | GotFormMsg (Form.Msg ( Candidacy, Referential ))
    | GotReferentialResponse (RemoteData String Referential)
    | UserArchivedCandidacy Candidacy


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
            , state =
                { referential = RemoteData.NotAsked }
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



-- |> initCandidacy context


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
        viewForm name candidacyId =
            viewMain name
                [ a
                    [ Route.href context.baseUrl (Route.Candidacy (View.Candidacy.Tab.Profil candidacyId))
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
                            NavigationSteps.view context.baseUrl candidacy

                _ ->
                    text ""
    in
    div
        [ class "grow flex h-full min-w-0 border-l-[73px] border-black bg-gray-100" ]
    <|
        case model.tab of
            CandidateInfo candidacyId ->
                [ viewForm "candidate" candidacyId
                , maybeNavigationSteps
                ]

            DropOut candidacyId ->
                [ viewForm "drop-out" candidacyId
                , maybeNavigationSteps
                ]

            FundingRequest candidacyId ->
                [ viewForm "funding" candidacyId
                , maybeNavigationSteps
                ]

            Meetings candidacyId ->
                [ viewForm "meetings" candidacyId
                , maybeNavigationSteps
                ]

            PaymentRequest candidacyId ->
                [ viewForm "payment" candidacyId
                , maybeNavigationSteps
                ]

            Profil _ ->
                [ viewCandidacyPanel context model
                , maybeNavigationSteps
                ]

            Training candidacyId ->
                [ viewForm "training" candidacyId
                , maybeNavigationSteps
                ]

            TrainingSent candidacyId ->
                [ viewMain "training-sent" (viewTrainingSent context candidacyId)
                , maybeNavigationSteps
                ]

            Admissibility candidacyId ->
                [ viewForm "admissibility" candidacyId
                , maybeNavigationSteps
                ]


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
                [ Route.href context.baseUrl (Route.Candidacy <| Profil candidacyId) ]
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
                [ View.skeleton "mt-8 mb-20 w-96 h-8"
                , div
                    [ class "mx-8" ]
                    [ View.skeleton "mb-2 w-48 h-6"
                    , View.skeleton "mb-10 w-128 h-16"
                    , View.skeleton "mb-2 w-48 h-6"
                    , View.skeleton "w-128 h-64"
                    ]
                ]

            Failure err ->
                [ text err ]

            Success candidacy ->
                View.Candidacy.view
                    context
                    { candidacy = candidacy
                    , archiveMsg = UserArchivedCandidacy
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

        UserArchivedCandidacy candidacy ->
            ( model
            , Api.Candidacy.archive context.endpoint context.token GotCandidacyArchivingResponse candidacy.id
            )


updateTab : Context -> Tab -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
updateTab context tab ( model, cmd ) =
    let
        newModel =
            { model | tab = tab }
    in
    case ( tab, model.selected ) of
        ( View.Candidacy.Tab.DropOut candidacyId, Success candidacy ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.DropOut.form
                        , onLoad = Api.Form.DropOut.get candidacyId
                        , onSave = Nothing
                        , onSubmit = Api.Form.DropOut.dropOut candidacyId
                        , onRedirect =
                            Nav.pushUrl
                                context.navKey
                                (Route.toString context.baseUrl (Route.Candidacy (View.Candidacy.Tab.Profil candidacyId)))
                        , onValidate = \_ _ -> Ok ()
                        , status =
                            if candidacy.dropOutDate /= Nothing then
                                Form.ReadOnly

                            else
                                Form.Editable
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Tab.Meetings candidacyId, Success _ ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.Appointment.form
                        , onLoad = Api.Form.Appointment.get candidacyId
                        , onSave = Nothing
                        , onSubmit = Api.Form.Appointment.update candidacyId
                        , onRedirect =
                            Nav.pushUrl
                                context.navKey
                                (Route.toString context.baseUrl (Route.Candidacy (View.Candidacy.Tab.Profil candidacyId)))
                        , onValidate = \_ _ -> Ok ()
                        , status = Form.Editable
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Tab.PaymentRequest candidacyId, Success candidacy ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.PaymentRequest.form candidacy.certification
                        , onLoad = Api.Form.PaymentRequest.get candidacyId
                        , onSave = Just <| Api.Form.PaymentRequest.createOrUpdate candidacyId
                        , onSubmit = Api.Form.PaymentRequest.confirm candidacyId
                        , onRedirect =
                            Nav.pushUrl
                                context.navKey
                                (Route.toString context.baseUrl (Route.Candidacy (View.Candidacy.Tab.Profil candidacyId)))
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

        ( View.Candidacy.Tab.FundingRequest candidacyId, Success candidacy ) ->
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
                        , onLoad = Api.Form.FundingRequest.get candidacyId candidacy
                        , onSave = Nothing
                        , onSubmit = Api.Form.FundingRequest.create candidacyId
                        , onRedirect =
                            Nav.pushUrl
                                context.navKey
                                (Route.toString context.baseUrl (Route.Candidacy (View.Candidacy.Tab.Profil candidacyId)))
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

        ( View.Candidacy.Tab.Training candidacyId, Success candidacy ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.Training.form
                        , onLoad = Api.Form.Training.get candidacyId
                        , onSave = Nothing
                        , onSubmit = Api.Form.Training.update candidacyId
                        , onRedirect =
                            Nav.pushUrl
                                context.navKey
                                (Route.toString context.baseUrl (Route.Candidacy (View.Candidacy.Tab.TrainingSent candidacyId)))
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

        ( View.Candidacy.Tab.CandidateInfo candidacyId, Success candidacy ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.Candidate.form
                        , onLoad =
                            case candidacy.email of
                                Just email ->
                                    Api.Form.Candidate.get email

                                Nothing ->
                                    \_ _ _ -> Cmd.none
                        , onSave = Nothing
                        , onSubmit = Api.Form.Candidate.update
                        , onRedirect =
                            Nav.pushUrl
                                context.navKey
                                (Route.toString context.baseUrl (Route.Candidacy (View.Candidacy.Tab.FundingRequest candidacyId)))
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

        ( View.Candidacy.Tab.Admissibility candidacyId, Success candidacy ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.Admissibility.form
                        , onLoad = Api.Form.Admissibility.get candidacyId
                        , onSave = Nothing
                        , onSubmit = Api.Form.Admissibility.update candidacyId
                        , onRedirect =
                            Nav.pushUrl
                                context.navKey
                                (Route.toString context.baseUrl (Route.Candidacy (View.Candidacy.Tab.Profil candidacyId)))
                        , onValidate = \_ _ -> Ok ()
                        , status =
                            Form.Editable
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Tab.Profil candidacyId, NotAsked ) ->
            initCandidacy context candidacyId ( newModel, cmd )
                |> withTakeOver context candidacyId

        ( View.Candidacy.Tab.DropOut candidacyId, NotAsked ) ->
            initCandidacy context candidacyId ( newModel, cmd )

        ( View.Candidacy.Tab.Meetings candidacyId, NotAsked ) ->
            initCandidacy context candidacyId ( newModel, cmd )

        ( View.Candidacy.Tab.PaymentRequest candidacyId, NotAsked ) ->
            initCandidacy context candidacyId ( newModel, cmd )

        ( View.Candidacy.Tab.Training candidacyId, NotAsked ) ->
            initCandidacy context candidacyId ( newModel, cmd )

        ( View.Candidacy.Tab.CandidateInfo candidacyId, NotAsked ) ->
            initCandidacy context candidacyId ( newModel, cmd )

        ( View.Candidacy.Tab.FundingRequest candidacyId, NotAsked ) ->
            initCandidacy context candidacyId ( newModel, cmd )

        ( View.Candidacy.Tab.Admissibility candidacyId, NotAsked ) ->
            initCandidacy context candidacyId ( newModel, cmd )

        ( View.Candidacy.Tab.DropOut _, _ ) ->
            ( newModel, cmd )

        ( View.Candidacy.Tab.Meetings _, _ ) ->
            ( newModel, cmd )

        ( View.Candidacy.Tab.PaymentRequest _, _ ) ->
            ( newModel, cmd )

        ( View.Candidacy.Tab.Training _, _ ) ->
            ( newModel, cmd )

        ( View.Candidacy.Tab.TrainingSent _, _ ) ->
            ( newModel, cmd )

        ( View.Candidacy.Tab.CandidateInfo _, _ ) ->
            ( newModel, cmd )

        ( View.Candidacy.Tab.FundingRequest _, _ ) ->
            ( newModel, cmd )

        ( View.Candidacy.Tab.Profil _, _ ) ->
            ( newModel, cmd )

        ( View.Candidacy.Tab.Admissibility _, _ ) ->
            ( newModel, cmd )


withTakeOver : Context -> CandidacyId -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
withTakeOver context candidacyId ( model, cmds ) =
    ( model, Cmd.batch [ cmds, Api.Candidacy.takeOver context.endpoint context.token GotCandidacyTakingOverResponse candidacyId ] )
