module Page.Candidacies exposing
    ( Model
    , Msg
    , init
    , update
    , updateTab
    , view
    )

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Browser.Navigation as Nav
import Data.Candidacy as Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Context exposing (Context)
import Data.Form.Appointment exposing (candidateTypologyToString)
import Data.Form.Helper
import Data.Form.Training
import Data.Referential exposing (Referential)
import Html.Styled as Html exposing (Html, a, article, aside, button, div, h2, h3, input, label, li, nav, node, p, span, text, ul)
import Html.Styled.Attributes exposing (action, attribute, class, for, id, name, placeholder, type_)
import Html.Styled.Events exposing (onInput)
import List.Extra
import Page.Form as Form exposing (Form)
import RemoteData exposing (RemoteData(..))
import Request
import Route
import String exposing (String)
import View
import View.Candidacy exposing (Tab(..))
import View.Helpers exposing (dataTest)
import View.Icons as Icons
import View.Steps


type Msg
    = GotCandidaciesResponse (RemoteData String (List CandidacySummary))
    | GotCandidacyResponse (RemoteData String Candidacy)
    | GotCandidacyDeletionResponse (RemoteData String String)
    | GotCandidacyArchivingResponse (RemoteData String Candidacy)
    | GotCandidacyTakingOverResponse (RemoteData String Candidacy)
    | GotFormMsg (Form.Msg Referential)
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
    , form : Form.Model Referential
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
            , tab = View.Candidacy.Empty
            }

        defaultCmd =
            Cmd.batch
                [ Request.requestCandidacies context.endpoint context.token GotCandidaciesResponse
                , Request.requestReferential context.endpoint context.token GotReferentialResponse
                , Cmd.map GotFormMsg formCmd
                ]
    in
    ( defaultModel, defaultCmd )


initCandidacy : Context -> CandidacyId -> Model -> ( Model, Cmd Msg )
initCandidacy context candidacyId model =
    ( { model | selected = Loading }
    , Request.requestCandidacy context.endpoint context.token GotCandidacyResponse candidacyId
    )


withCandidacies : RemoteData String (List CandidacySummary) -> State -> State
withCandidacies candidacies state =
    { state | candidacies = candidacies }


withReferential : RemoteData String Referential -> State -> State
withReferential referential state =
    { state | referential = referential }


filterCandidacy : String -> CandidacySummary -> Bool
filterCandidacy filter candidacySummary =
    let
        match s =
            String.toLower s
                |> String.contains (String.toLower filter)
    in
    match (candidacySummary.certification.label ++ " " ++ candidacySummary.certification.acronym)
        || (Maybe.map match candidacySummary.phone |> Maybe.withDefault False)
        || (Maybe.map match candidacySummary.email |> Maybe.withDefault False)



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
            let
                sortedCandidacies =
                    List.sortBy (.lastStatus >> .status >> Candidacy.statusToDirectoryPosition) candidacies
            in
            case model.filter of
                Nothing ->
                    viewContent context model sortedCandidacies

                Just filter ->
                    List.filter (filterCandidacy filter) sortedCandidacies
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
                    [ Route.href context.baseUrl (Route.Candidacy (View.Candidacy.Profil candidacyId))
                    , class "flex items-center text-gray-800"
                    ]
                    [ span [ class "text-[36px] mr-4" ] [ text "← " ]
                    , text "Retour"
                    ]
                , Form.view model.state.referential model.form
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

            Meetings candidacyId ->
                [ viewForm "meetings" candidacyId ]

            Profil candidacyId ->
                [ viewCandidacyPanel context model
                , maybeNavigationSteps
                ]

            Training candidacyId ->
                [ viewForm "training" candidacyId
                ]

            TrainingSent candidacyId ->
                [ viewMain "training-sent" (viewTrainingSent context candidacyId)
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

        expandedView stepTitle status =
            [ View.Steps.item stepTitle
            , div
                []
                [ button
                    [ class "bg-slate-900 text-white text-base"
                    , class "mt-2 w-auto rounded"
                    , class "text-center px-8 py-1"
                    ]
                    [ if Candidacy.isStatusAbove candidacy status then
                        text "Voir"

                      else
                        text "Compléter"
                    ]
                ]
            ]

        appointmentLink =
            Just <| Route.href baseUrl <| Route.Candidacy (View.Candidacy.Meetings candidacy.id)

        trainingLink =
            Just <| Route.href baseUrl <| Route.Candidacy (View.Candidacy.Training candidacy.id)
    in
    View.Steps.view (Candidacy.statusToProgressPosition candidacyStatus)
        [ { content = title, navigation = Nothing }
        , { content = expandedView "Rendez-vous pédagogique" "PARCOURS_ENVOYE", navigation = appointmentLink }
        , { content = expandedView "Définition du parcours" "PARCOURS_ENVOYE", navigation = trainingLink }
        , { content = [ View.Steps.item "Validation du parcours" ], navigation = Nothing }
        , { content = [ View.Steps.item "Gestion de la recevabilité" ], navigation = Nothing }
        , { content = [ View.Steps.item "Demande de prise en charge" ], navigation = Nothing }
        , { content = [ View.Steps.item "Validation du projet" ], navigation = Nothing }
        ]


viewMain : String -> List (Html msg) -> Html msg
viewMain dataTestValue =
    node "main"
        [ class "bg-white w-[762px] px-8 pt-8 pb-24"
        , dataTest dataTestValue
        ]


viewTrainingSent : Context -> CandidacyId -> List (Html msg)
viewTrainingSent context candidacyId =
    [ View.title "Confirmation"
    , div [ class "flex flex-col items-center w-full p-10" ]
        [ View.image [ class "w-[60px]" ] context.baseUrl "confirmation.png"
        , p
            [ class "mt-6 mb-24" ]
            [ text "Le parcours personnalisé a bien été enregistré." ]
        , View.primaryLink
            [ Route.href context.baseUrl (Route.Candidacy <| Profil candidacyId) ]
            "Retour à la candidature"
        ]
    ]


appointmentForm : Form Referential
appointmentForm =
    let
        keys =
            Data.Form.Appointment.keys

        typologies =
            [ SalariePrive
            , DemandeurEmploi
            , AidantsFamiliaux
            , Autre
            ]
                |> List.map (\el -> ( candidateTypologyToString el, candidateTypologyToString el ))
    in
    { elements =
        \referential ->
            [ ( keys.typology, Form.Select "Typologie" typologies )
            , ( keys.additionalInformation, Form.SelectOther "typology" "Autre typologie" )
            , ( keys.firstAppointmentOccurredAt, Form.Date "Date du premier rendez-vous pédagogique" )
            , ( keys.wasPresentAtFirstAppointment, Form.Checkbox "Le candidat a bien effectué le rendez-vous d'étude de faisabilité" )
            , ( keys.appointmentCount, Form.Number "Nombre de rendez-vous réalisés avec le candidat" )
            ]
    , saveLabel = "Enregistrer"
    , title = "Rendez-vous pédagogique"
    }


trainingForm : Form Referential
trainingForm =
    let
        keys =
            Data.Form.Training.keys
    in
    { elements =
        \referential ->
            [ ( keys.individualHourCount, Form.Number "Nombre d'heure d'accompagnement individuel" )
            , ( keys.collectiveHourCount, Form.Number "Nombre d'heure d'accompagnement collectif" )
            , ( keys.additionalHourCount, Form.Number "Nombre d'heures de formations complémentaires" )
            , ( keys.mandatoryTrainings
              , Form.CheckboxList "Formations obligatoires" <|
                    Data.Form.Helper.toIdList referential.mandatoryTrainings
              )
            , ( keys.basicSkills
              , Form.CheckboxList "Savoirs de base" <|
                    Data.Form.Helper.toIdList referential.basicSkills
              )
            , ( keys.certificateSkills, Form.Textarea "Blocs de compétences métier" )
            , ( keys.otherTraining, Form.Textarea "Autres actions de formations complémentaires" )
            , ( keys.consent, Form.Checkbox "Le candidat valide ce parcours et s'engage à poursuivre l'expérimentation" )
            ]
    , saveLabel = "Envoyer le parcours"
    , title = "Définition du parcours"
    }


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
                    { candidacy = candidacy
                    , archiveMsg = UserArchivedCandidacy
                    , deleteMsg = UserDeletedCandidacy
                    , referential = model.state.referential
                    }


viewCandidacyArticle : String -> List (Html msg) -> Html msg
viewCandidacyArticle baseUrl content =
    viewMain "profile"
        [ a
            [ Route.href baseUrl (Route.Candidacy View.Candidacy.Empty)
            , class "flex items-center text-gray-800 p-6"
            ]
            [ span [ class "text-3xl mr-4" ] [ text "← " ]
            , text "Toutes les candidatures"
            ]
        , article
            [ class "px-3 sm:px-6" ]
            content
        ]


viewDirectoryPanel : { a | baseUrl : String } -> List CandidacySummary -> Html Msg
viewDirectoryPanel config candidacies =
    let
        candidaciesByStatus =
            List.Extra.groupWhile
                (\c1 c2 -> c1.lastStatus.status == c2.lastStatus.status)
                candidacies
    in
    aside
        [ class "hidden md:order-first md:flex md:flex-col flex-shrink-0"
        , class "w-2/3 max-w-3xl h-screen"
        , class "bg-white"
        ]
        [ div
            [ class "px-6 pt-8 pb-4" ]
            [ h2
                [ class "text-lg font-semibold text-gray-900 mb-8" ]
                [ text "Candidatures" ]
            , p
                [ class "mt-1 text-sm text-gray-500" ]
                [ text "Recherchez par nom de certification et information de contact (téléphone et email)" ]
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
                            [ class "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" ]
                            [ Icons.search
                            ]
                        , input
                            [ type_ "search"
                            , name "search"
                            , id "search"
                            , class "focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                            , placeholder "Rechercher"
                            , onInput UserAddedFilter
                            ]
                            []
                        ]
                    ]
                ]
            ]
        , List.map (viewDirectory config) candidaciesByStatus
            |> nav
                [ dataTest "directory"
                , class "min-h-0 overflow-y-auto"
                , attribute "aria-label" "Candidats"
                ]
        ]


viewDirectory : { a | baseUrl : String } -> ( CandidacySummary, List Candidacy.CandidacySummary ) -> Html Msg
viewDirectory config ( firstCandidacy, candidacies ) =
    div
        [ dataTest "directory-group", class "relative" ]
        [ div
            [ dataTest "directory-group-name"
            , class "z-10 sticky top-0 border-t border-b border-gray-200 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-800"
            ]
            [ h3 [] [ text (Candidacy.statusToString firstCandidacy.lastStatus.status) ] ]
        , List.map (viewItem config) (firstCandidacy :: candidacies)
            |> ul [ attribute "role" "list", class "relative z-0 divide-y divide-gray-200" ]
        ]


viewItem : { a | baseUrl : String } -> CandidacySummary -> Html Msg
viewItem config candidacy =
    let
        displayMaybe maybeInfo =
            Maybe.map (\s -> div [] [ text s ]) maybeInfo
                |> Maybe.withDefault (text "")
    in
    li
        [ dataTest "directory-item" ]
        [ div
            [ class "relative px-6 py-5 flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-1 focus-within:ring-inset focus-within:ring-indigo-500" ]
            [ div [ class "flex-shrink-0 text-gray-400" ]
                [ Icons.user ]
            , div
                [ class "flex-1 min-w-0" ]
                [ a
                    [ Route.href config.baseUrl (Route.Candidacy <| Profil candidacy.id)
                    , class "focus:outline-none"
                    ]
                    [ span
                        [ class "absolute inset-0", attribute "aria-hidden" "true" ]
                        []
                    , p
                        [ class "flex text-sm font-medium text-blue-600 space-x-2" ]
                        [ displayMaybe candidacy.phone
                        , displayMaybe candidacy.email
                        ]
                    , p [ class "text-sm text-gray-500 truncate" ]
                        [ text candidacy.certification.label ]
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

        GotCandidacyArchivingResponse (Failure err) ->
            ( { model | selected = Failure err }, Cmd.none )

        GotCandidacyArchivingResponse (Success candidacy) ->
            ( refreshCandidacy model candidacy, Cmd.none )

        GotCandidacyArchivingResponse _ ->
            ( { model | selected = NotAsked }, Cmd.none )

        GotCandidacyTakingOverResponse (Failure err) ->
            ( model, Cmd.none )

        GotCandidacyTakingOverResponse (Success candidacy) ->
            ( refreshCandidacy model candidacy, Cmd.none )

        GotCandidacyTakingOverResponse _ ->
            ( { model | selected = NotAsked }, Cmd.none )

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
            , Request.deleteCandidacy context.endpoint context.token GotCandidacyDeletionResponse candidacy.id
            )

        UserArchivedCandidacy candidacy ->
            ( model
            , Request.archiveCandidacy context.endpoint context.token GotCandidacyArchivingResponse candidacy.id
            )


updateTab : Context -> Tab -> Model -> ( Model, Cmd Msg )
updateTab context tab model =
    let
        newModel =
            { model | tab = tab }
    in
    case ( tab, model.selected ) of
        ( View.Candidacy.Profil candidacyId, NotAsked ) ->
            initCandidacy context candidacyId newModel
                |> withTakeOver context candidacyId

        ( View.Candidacy.Meetings candidacyId, _ ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = appointmentForm
                        , onLoad = Request.requestAppointment candidacyId
                        , onSave = Request.updateAppointment candidacyId
                        , onRedirect =
                            Nav.pushUrl
                                context.navKey
                                (Route.toString context.baseUrl (Route.Candidacy (View.Candidacy.Profil candidacyId)))
                        , status = Form.Editable
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Training candidacyId, Success candidacy ) ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm context
                        { form = trainingForm
                        , onLoad = Request.requestTrainings candidacyId
                        , onSave = Request.updateTrainings candidacyId
                        , onRedirect =
                            Nav.pushUrl
                                context.navKey
                                (Route.toString context.baseUrl (Route.Candidacy (View.Candidacy.TrainingSent candidacyId)))
                        , status =
                            if Candidacy.isStatusAbove candidacy "PARCOURS_ENVOYE" then
                                Form.ReadOnly

                            else
                                Form.Editable
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        ( View.Candidacy.Training candidacyId, NotAsked ) ->
            initCandidacy context candidacyId newModel

        ( View.Candidacy.Training _, _ ) ->
            ( newModel, Cmd.none )

        ( View.Candidacy.TrainingSent _, _ ) ->
            ( newModel, Cmd.none )

        ( View.Candidacy.Profil _, _ ) ->
            ( newModel, Cmd.none )

        ( View.Candidacy.Empty, _ ) ->
            ( { newModel | selected = NotAsked }, Cmd.none )


withTakeOver : Context -> CandidacyId -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
withTakeOver context candidacyId ( model, cmds ) =
    ( model, Cmd.batch [ cmds, Request.takeOverCandidacy context.endpoint context.token GotCandidacyTakingOverResponse candidacyId ] )



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
