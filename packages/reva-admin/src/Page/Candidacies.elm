module Page.Candidacies exposing
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
import Api.Form.Training
import Api.Referential
import Api.Token exposing (Token)
import Browser.Navigation as Nav
import Data.Candidacy as Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Certification exposing (Certification)
import Data.Context exposing (Context)
import Data.Form.FundingRequest
import Data.Organism exposing (Organism)
import Data.Referential exposing (Referential)
import Html.Styled as Html exposing (Html, a, article, aside, button, div, h2, h3, input, label, li, nav, node, p, span, text, ul)
import Html.Styled.Attributes exposing (action, attribute, class, classList, for, id, name, placeholder, type_)
import Html.Styled.Events exposing (onInput)
import List.Extra
import Page.Form as Form exposing (Form)
import Page.Form.Admissibility
import Page.Form.Appointment
import Page.Form.Candidate
import Page.Form.DropOut
import Page.Form.FundingRequest
import Page.Form.Training
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import Time
import View
import View.Candidacy
import View.Candidacy.Tab exposing (Tab(..))
import View.Helpers exposing (dataTest)
import View.Icons as Icons
import View.Steps


type Msg
    = GotCandidaciesResponse (RemoteData String (List CandidacySummary))
    | GotCandidacyResponse (RemoteData String Candidacy)
    | GotCandidacyDeletionResponse (RemoteData String String)
    | GotCandidacyArchivingResponse (RemoteData String ())
    | GotCandidacyTakingOverResponse (RemoteData String ())
    | GotFormMsg (Form.Msg ( Candidacy, Referential ))
    | GotReferentialResponse (RemoteData String Referential)
    | UserAddedFilter String
    | UserArchivedCandidacy Candidacy
    | UserDeletedCandidacy Candidacy


type alias State =
    { candidacies : RemoteData String (List CandidacySummary)
    , referential : RemoteData String Referential
    }


type alias Model =
    { filter : Maybe String
    , form : Form.Model ( Candidacy, Referential )
    , selected : RemoteData String Candidacy
    , state : State
    , tab : Tab
    }


init : Context -> ( Model, Cmd Msg )
init context =
    let
        ( formModel, formCmd ) =
            Form.init

        defaultModel : Model
        defaultModel =
            { filter = Nothing
            , form = formModel
            , selected = NotAsked
            , state =
                { candidacies = RemoteData.NotAsked
                , referential = RemoteData.NotAsked
                }
            , tab = View.Candidacy.Tab.Empty
            }

        defaultCmd =
            Cmd.batch
                [ Api.Candidacy.getCandidacies context.endpoint context.token GotCandidaciesResponse
                , Api.Referential.get context.endpoint context.token GotReferentialResponse
                , Cmd.map GotFormMsg formCmd
                ]
    in
    ( defaultModel, defaultCmd )


initCandidacy : Context -> CandidacyId -> Model -> ( Model, Cmd Msg )
initCandidacy context candidacyId model =
    ( { model | selected = Loading }
    , Api.Candidacy.get context.endpoint context.token GotCandidacyResponse candidacyId
    )


resetSelected : Model -> Model
resetSelected model =
    { model | selected = NotAsked }


withCandidacies : RemoteData String (List CandidacySummary) -> State -> State
withCandidacies candidacies state =
    { state | candidacies = candidacies }


withReferential : RemoteData String Referential -> State -> State
withReferential referential state =
    { state | referential = referential }



-- VIEW


view :
    Context
    -> Model
    -> Html Msg
view context model =
    case model.state.candidacies of
        NotAsked ->
            div [] []

        Loading ->
            div [] [ text "loading" ]

        Failure errors ->
            div [ class "text-red-500" ] [ text errors ]

        Success candidacies ->
            case model.filter of
                Nothing ->
                    viewContent context model candidacies

                Just filter ->
                    List.filter (Candidacy.filterByWords filter) candidacies
                        |> viewContent context model


viewContent :
    Context
    -> Model
    -> List CandidacySummary
    -> Html Msg
viewContent context model candidacies =
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
                    viewNavigationSteps context.baseUrl candidacy

                _ ->
                    text ""
    in
    div
        [ class "grow flex h-full min-w-0 border-l-[73px] border-black bg-gray-100" ]
    <|
        case model.tab of
            Empty ->
                [ viewDirectoryPanel context candidacies ]

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


viewNavigationSteps : String -> Candidacy -> Html msg
viewNavigationSteps baseUrl candidacy =
    let
        candidacyStatus =
            (Candidacy.lastStatus >> .status) candidacy.statuses

        title =
            [ div
                [ class "h-32 flex items-end -mb-12" ]
                [ span
                    [ class "text-2xl font-medium" ]
                    [ text "Prochaines étapes" ]
                ]
            ]

        completeButton =
            div
                []
                [ button
                    [ class "bg-slate-900 text-white text-base"
                    , class "mt-2 w-auto rounded"
                    , class "text-center px-8 py-1"
                    ]
                    [ text "Compléter" ]
                ]

        expandedView stepTitle status =
            [ View.Steps.link stepTitle
            , if candidacyStatus == status then
                completeButton

              else
                text ""
            ]

        appointmentLink =
            Just <| Route.href baseUrl <| Route.Candidacy (View.Candidacy.Tab.Meetings candidacy.id)

        trainingLink =
            Just <| Route.href baseUrl <| Route.Candidacy (View.Candidacy.Tab.Training candidacy.id)

        fundingView =
            if candidacyStatus == "DEMANDE_FINANCEMENT_ENVOYE" then
                View.Candidacy.Tab.FundingRequest

            else
                View.Candidacy.Tab.CandidateInfo

        candidateInfoLink =
            if Candidacy.isStatusEqualOrAbove candidacy "PARCOURS_CONFIRME" then
                Just <| Route.href baseUrl <| Route.Candidacy (fundingView candidacy.id)

            else
                Nothing

        admissibilityLink =
            if Candidacy.isStatusEqualOrAbove candidacy "PARCOURS_CONFIRME" then
                Just <| Route.href baseUrl <| Route.Candidacy (View.Candidacy.Tab.Admissibility candidacy.id)

            else
                Nothing
    in
    View.Steps.view (Candidacy.statusToProgressPosition candidacyStatus)
        [ { content = title, navigation = Nothing }
        , { content = expandedView "Rendez-vous pédagogique" "PRISE_EN_CHARGE", navigation = appointmentLink }
        , { content = expandedView "Définition du parcours" "PRISE_EN_CHARGE", navigation = trainingLink }
        , { content = [ View.Steps.info "Validation du parcours" ], navigation = Nothing }
        , { content = expandedView "Gestion de la recevabilité" "PARCOURS_CONFIRME", navigation = admissibilityLink }
        , { content = expandedView "Demande de prise en charge" "PARCOURS_CONFIRME", navigation = candidateInfoLink }
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
                    , deleteMsg = UserDeletedCandidacy
                    , referential = model.state.referential
                    }


viewCandidacyArticle : String -> List (Html msg) -> Html msg
viewCandidacyArticle baseUrl content =
    viewMain "profile"
        [ a
            [ Route.href baseUrl (Route.Candidacy View.Candidacy.Tab.Empty)
            , class "flex items-center text-gray-800 p-6"
            ]
            [ span [ class "text-3xl mr-4" ] [ text "← " ]
            , text "Toutes les candidatures"
            ]
        , article
            [ class "px-16" ]
            content
        ]


viewDirectoryPanel : Context -> List CandidacySummary -> Html Msg
viewDirectoryPanel context candidacies =
    let
        candidaciesByStatus : List ( CandidacySummary, List CandidacySummary )
        candidaciesByStatus =
            candidacies
                |> List.sortBy (.sentAt >> Maybe.map Time.posixToMillis >> Maybe.withDefault 0 >> (*) -1)
                |> List.Extra.gatherWith (\c1 c2 -> c1.lastStatus.status == c2.lastStatus.status)
                |> List.sortBy (\( c, _ ) -> Candidacy.toDirectoryPosition c)
    in
    aside
        [ class "hidden md:order-first md:flex md:flex-col flex-shrink-0"
        , class "w-full w-[780px] h-screen"
        , class "bg-white"
        ]
        [ div
            [ class "px-10 pt-10 pb-4" ]
            [ h2
                [ class "text-3xl font-black text-slate-800 mb-6" ]
                [ text "Candidatures" ]
            , p
                [ class "text-base text-gray-500" ]
                [ if Api.Token.isAdmin context.token then
                    text "Recherchez par architecte de parcours, certification et information de contact"

                  else
                    text "Recherchez par certification et information de contact"
                ]
            , div
                [ class "my-2 flex space-x-4", action "#" ]
                [ div
                    [ class "flex-1 min-w-0" ]
                    [ label
                        [ for "search", class "sr-only" ]
                        [ text "Rechercher" ]
                    , div
                        [ class "relative rounded-md shadow-sm" ]
                        [ div
                            [ class "absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none" ]
                            [ Icons.search
                            ]
                        , input
                            [ type_ "search"
                            , name "search"
                            , id "search"
                            , class "block w-full pl-6 pr-12 py-5 bg-gray-100"
                            , class "border-b-[3px] border-0 border-b-gray-800"
                            , class "focus:ring-blue-500 focus:ring-0 focus:border-blue-600"
                            , class "text-xl placeholder:text-gray-400"
                            , placeholder "Rechercher"
                            , onInput UserAddedFilter
                            ]
                            []
                        ]
                    ]
                ]
            ]
        , List.map (viewDirectory context) candidaciesByStatus
            |> nav
                [ dataTest "directory"
                , class "min-h-0 overflow-y-auto"
                , attribute "aria-label" "Candidats"
                ]
        ]


viewDirectory : Context -> ( CandidacySummary, List Candidacy.CandidacySummary ) -> Html Msg
viewDirectory context ( firstCandidacy, candidacies ) =
    div
        [ dataTest "directory-group", class "relative mb-2" ]
        [ div
            [ dataTest "directory-group-name"
            , class "z-10 sticky top-0 text-xl font-semibold text-slate-700"
            , class "bg-white px-10 py-3"
            , class "flex justify-between"
            ]
            [ h3 [] [ text (Candidacy.toCategoryString firstCandidacy) ]
            , div
                [ class "flex items-center justify-center"
                , class "rounded-full px-2 h-6 bg-gray-200"
                , class "text-sm text-gray-600"
                ]
                -- + 1 to count the firstCandidacy not included in the group
                [ text <| String.fromInt (List.length candidacies + 1) ]
            ]
        , List.map (viewItem context) (firstCandidacy :: candidacies)
            |> ul [ attribute "role" "list", class "text-lg relative z-0" ]
        ]


viewItem : Context -> CandidacySummary -> Html Msg
viewItem context candidacy =
    let
        displayMaybe maybeInfo =
            Maybe.map (\s -> div [] [ text s ]) maybeInfo
                |> Maybe.withDefault (text "")
    in
    li
        [ dataTest "directory-item" ]
        [ div
            [ class "relative px-10 py-4 flex items-center space-x-6 hover:bg-gray-50"
            , class "focus-within:ring-1 focus-within:ring-inset focus-within:ring-indigo-500"
            ]
            [ div
                [ class "flex-1 min-w-0" ]
                [ a
                    [ Route.href context.baseUrl (Route.Candidacy <| Profil candidacy.id)
                    , class "focus:outline-none"
                    ]
                    [ span
                        [ class "absolute inset-0", attribute "aria-hidden" "true" ]
                        []
                    , p
                        [ class "text-blue-600 font-medium truncate"
                        , classList [ ( "italic", candidacy.certification == Nothing ) ]
                        ]
                        [ Maybe.map .label candidacy.certification
                            |> Maybe.withDefault "Certification non sélectionnée"
                            |> text
                        ]
                    , p
                        [ class "flex" ]
                        [ div [ class "flex items-center space-x-12" ]
                            [ div [ class "flex items-center space-x-2" ]
                                [ div
                                    [ class "flex-shrink-0 text-gray-600" ]
                                    [ Icons.user ]
                                , div
                                    [ class "flex text-gray-700 space-x-2" ]
                                  <|
                                    case ( candidacy.firstname, candidacy.lastname ) of
                                        ( Just firstname, Just lastname ) ->
                                            [ text firstname, text " ", text lastname ]

                                        _ ->
                                            [ displayMaybe candidacy.phone
                                            , displayMaybe candidacy.email
                                            ]
                                ]
                            , case candidacy.department of
                                Just department ->
                                    div [ class "flex items-center space-x-2" ]
                                        [ div
                                            [ class "flex-shrink-0 text-gray-600 pt-1" ]
                                            [ Icons.location ]
                                        , div
                                            []
                                            [ Data.Referential.departmentToString department |> text
                                            ]
                                        ]

                                _ ->
                                    div [] []
                            ]
                        ]
                    , div
                        [ class "flex items-end justify-between"
                        , class "text-gray-500"
                        ]
                        [ View.Candidacy.viewSentAt candidacy.sentAt
                        , case ( Api.Token.isAdmin context.token, candidacy.organism ) of
                            ( True, Just organism ) ->
                                div
                                    [ class "text-sm whitespace-nowrap" ]
                                    [ text organism.label ]

                            _ ->
                                text ""
                        ]
                    ]
                ]
            ]
        ]



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    case msg of
        GotCandidaciesResponse remoteCandidacies ->
            ( { model | state = model.state |> withCandidacies remoteCandidacies }
            , Cmd.none
            )

        GotCandidacyResponse remoteCandidacy ->
            { model | selected = remoteCandidacy }
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

        UserAddedFilter filter ->
            ( { model | filter = Just filter }, Cmd.none )

        UserDeletedCandidacy candidacy ->
            ( removeCandidacy model candidacy
            , Api.Candidacy.delete context.endpoint context.token GotCandidacyDeletionResponse candidacy.id
            )

        UserArchivedCandidacy candidacy ->
            ( model
            , Api.Candidacy.archive context.endpoint context.token GotCandidacyArchivingResponse candidacy.id
            )


updateTab : Context -> Tab -> Model -> ( Model, Cmd Msg )
updateTab context tab model =
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
                        , onSave = Api.Form.DropOut.dropOut candidacyId
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

        ( View.Candidacy.Tab.Profil candidacyId, NotAsked ) ->
            initCandidacy context candidacyId newModel
                |> withTakeOver context candidacyId

        ( View.Candidacy.Tab.Meetings candidacyId, Success _ ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.Appointment.form
                        , onLoad = Api.Form.Appointment.get candidacyId
                        , onSave = Api.Form.Appointment.update candidacyId
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

        ( View.Candidacy.Tab.FundingRequest candidacyId, Success candidacy ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = Page.Form.FundingRequest.form candidacy.certification
                        , onLoad = Api.Form.FundingRequest.get candidacyId
                        , onSave = Api.Form.FundingRequest.create candidacyId
                        , onRedirect =
                            Nav.pushUrl
                                context.navKey
                                (Route.toString context.baseUrl (Route.Candidacy (View.Candidacy.Tab.Profil candidacyId)))
                        , onValidate = Data.Form.FundingRequest.validate
                        , status =
                            if Candidacy.isFundingRequestSent candidacy then
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
                        , onSave = Api.Form.Training.update candidacyId
                        , onRedirect =
                            Nav.pushUrl
                                context.navKey
                                (Route.toString context.baseUrl (Route.Candidacy (View.Candidacy.Tab.TrainingSent candidacyId)))
                        , onValidate = \_ _ -> Ok ()
                        , status =
                            if Candidacy.isTrainingSent candidacy then
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
                        , onSave = Api.Form.Candidate.update
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
                        , onSave = Api.Form.Admissibility.update candidacyId
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

        ( View.Candidacy.Tab.DropOut candidacyId, NotAsked ) ->
            initCandidacy context candidacyId newModel

        ( View.Candidacy.Tab.Meetings candidacyId, NotAsked ) ->
            initCandidacy context candidacyId newModel

        ( View.Candidacy.Tab.Training candidacyId, NotAsked ) ->
            initCandidacy context candidacyId newModel

        ( View.Candidacy.Tab.CandidateInfo candidacyId, NotAsked ) ->
            initCandidacy context candidacyId newModel

        ( View.Candidacy.Tab.FundingRequest candidacyId, NotAsked ) ->
            initCandidacy context candidacyId newModel

        ( View.Candidacy.Tab.Admissibility candidacyId, NotAsked ) ->
            initCandidacy context candidacyId newModel

        ( View.Candidacy.Tab.DropOut _, _ ) ->
            ( newModel, Cmd.none )

        ( View.Candidacy.Tab.Meetings _, _ ) ->
            ( newModel, Cmd.none )

        ( View.Candidacy.Tab.Training _, _ ) ->
            ( newModel, Cmd.none )

        ( View.Candidacy.Tab.TrainingSent _, _ ) ->
            ( newModel, Cmd.none )

        ( View.Candidacy.Tab.CandidateInfo _, _ ) ->
            ( newModel, Cmd.none )

        ( View.Candidacy.Tab.FundingRequest candidacyId, _ ) ->
            ( newModel, Cmd.none )

        ( View.Candidacy.Tab.Profil _, _ ) ->
            ( newModel, Cmd.none )

        ( View.Candidacy.Tab.Admissibility _, _ ) ->
            ( newModel, Cmd.none )

        ( View.Candidacy.Tab.Empty, _ ) ->
            ( { newModel | selected = NotAsked }, Cmd.none )


withTakeOver : Context -> CandidacyId -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
withTakeOver context candidacyId ( model, cmds ) =
    ( model, Cmd.batch [ cmds, Api.Candidacy.takeOver context.endpoint context.token GotCandidacyTakingOverResponse candidacyId ] )



-- HELPERS


refreshCandidacy : Model -> Candidacy -> Model
refreshCandidacy model candidacy =
    case model.state.candidacies of
        Success candidacies ->
            let
                newCandidacies =
                    List.map
                        (\c ->
                            if c.id /= candidacy.id then
                                c

                            else
                                Candidacy.toCandidacySummary candidacy
                        )
                        candidacies
            in
            { model | state = model.state |> withCandidacies (Success newCandidacies) }

        _ ->
            model


removeCandidacy : Model -> Candidacy -> Model
removeCandidacy model candidacy =
    case model.state.candidacies of
        Success candidacies ->
            let
                newCandidacies =
                    List.filter (\c -> c.id /= candidacy.id) candidacies
            in
            { model | state = model.state |> withCandidacies (Success newCandidacies) }

        _ ->
            model
