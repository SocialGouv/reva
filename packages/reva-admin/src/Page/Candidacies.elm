module Page.Candidacies exposing
    ( Model
    , Msg
    , init
    , update
    , updateTab
    , view
    )

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Admin.Object exposing (Candidacy)
import Api exposing (Token)
import Browser.Navigation as Nav
import Data.Candidacy as Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
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
    { baseUrl : String
    , navKey : Nav.Key
    , endpoint : String
    , token : Token
    , filter : Maybe String
    , form : Form.Model Referential
    , selected : RemoteData String Candidacy
    , state : State
    , tab : Tab
    }


init : Nav.Key -> String -> String -> Token -> ( Model, Cmd Msg )
init navKey baseUrl endpoint token =
    let
        ( formModel, formCmd ) =
            Form.init endpoint token

        defaultModel : Model
        defaultModel =
            { baseUrl = baseUrl
            , endpoint = endpoint
            , navKey = navKey
            , token = token
            , filter = Nothing
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
                [ Request.requestCandidacies endpoint token GotCandidaciesResponse
                , Request.requestReferential endpoint token GotReferentialResponse
                , Cmd.map GotFormMsg formCmd
                ]
    in
    ( defaultModel, defaultCmd )


initCandidacy : CandidacyId -> Model -> ( Model, Cmd Msg )
initCandidacy candidacyId model =
    ( { model | selected = Loading }
    , Request.requestCandidacy model.endpoint model.token GotCandidacyResponse candidacyId
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
    { a | baseUrl : String }
    -> Model
    -> Html Msg
view config model =
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
                    List.sortBy (.lastStatus >> .status >> Candidacy.statusToOrderPosition) candidacies
            in
            case model.filter of
                Nothing ->
                    viewContent config model sortedCandidacies

                Just filter ->
                    List.filter (filterCandidacy filter) sortedCandidacies
                        |> viewContent config model


viewContent :
    { a | baseUrl : String }
    -> Model
    -> List CandidacySummary
    -> Html Msg
viewContent config model candidacies =
    let
        viewForm name candidacyId =
            viewMain name
                [ a
                    [ Route.href model.baseUrl (Route.Candidacy (View.Candidacy.Profil candidacyId))
                    , class "flex items-center text-gray-800 p-6"
                    ]
                    [ span [ class "text-3xl mr-4" ] [ text "← " ]
                    , text "Retour"
                    ]
                , Form.view model.state.referential model.form
                    |> Html.map GotFormMsg
                ]
    in
    div
        [ class "flex min-w-0 overflow-hidden border-l-[40px] border-black" ]
        [ div
            [ class "sm:hidden" ]
            [ div
                [ class "flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-1.5" ]
                [ div
                    []
                    [-- Logo here
                    ]
                , div
                    []
                    [ button
                        [ type_ "button", class "-mr-3 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600" ]
                        [ span
                            [ class "sr-only" ]
                            [ text "Open sidebar" ]
                        , Icons.menu
                        ]
                    ]
                ]
            ]
        , div
            [ class "flex-1 relative z-0 flex overflow-hidden bg-gray-100" ]
          <|
            case model.tab of
                Empty ->
                    [ viewDirectoryPanel config candidacies ]

                Meetings candidacyId ->
                    [ viewForm "meetings" candidacyId ]

                Profil candidacyId ->
                    [ viewCandidacyPanel model
                    , viewNavigationSteps model.baseUrl candidacyId
                    ]

                Training candidacyId ->
                    [ viewForm "training" candidacyId ]
        ]


viewNavigationSteps : String -> CandidacyId -> Html msg
viewNavigationSteps baseUrl candidacyId =
    let
        title =
            [ div
                [ class "h-32 flex items-end -mb-12" ]
                [ span
                    [ class "text-2xl font-medium" ]
                    [ text "Prochaines étapes" ]
                ]
            ]

        expandedView stepTitle buttonLabel =
            [ View.Steps.item stepTitle
            , div
                []
                [ button
                    [ class "bg-slate-900 text-white text-base"
                    , class "mt-2 w-auto rounded"
                    , class "text-center px-8 py-1"
                    ]
                    [ text buttonLabel ]
                ]
            ]

        appointmentLink =
            Just <| Route.href baseUrl <| Route.Candidacy (View.Candidacy.Meetings candidacyId)

        trainingLink =
            Just <| Route.href baseUrl <| Route.Candidacy (View.Candidacy.Training candidacyId)
    in
    View.Steps.view
        [ { content = title, navigation = Nothing }
        , { content = expandedView "Rendez-vous pédagogique" "Compléter", navigation = appointmentLink }
        , { content = expandedView "Définition du parcours" "Compléter", navigation = trainingLink }
        , { content = [ View.Steps.item "Validation du parcours" ], navigation = Nothing }
        , { content = [ View.Steps.item "Gestion de la recevabilité" ], navigation = Nothing }
        , { content = [ View.Steps.item "Demande de prise en charge" ], navigation = Nothing }
        , { content = [ View.Steps.item "Validation du projet" ], navigation = Nothing }
        ]


viewMain : String -> List (Html msg) -> Html msg
viewMain dataTestValue =
    node "main"
        [ dataTest dataTestValue
        , class "relative z-10 overflow-y-auto focus:outline-none"
        , class "h-screen w-2/3 max-w-3xl bg-white"
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
    , title = "Définition du parcours"
    }


viewCandidacyPanel : Model -> Html Msg
viewCandidacyPanel model =
    let
        loading extraClass =
            div
                [ class "animate-pulse rounded bg-gray-100 w-128"
                , class extraClass
                ]
                []
    in
    viewCandidacyArticle model.baseUrl <|
        case model.selected of
            NotAsked ->
                []

            Loading ->
                [ loading "mt-8 mb-20 w-96 h-8"
                , div
                    [ class "mx-8" ]
                    [ loading "mb-2 w-48 h-6"
                    , loading "mb-10 w-128 h-16"
                    , loading "mb-2 w-48 h-6"
                    , loading "w-128 h-64"
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
            [ class "px-6 pt-6 pb-4" ]
            [ h2
                [ class "text-lg font-medium text-gray-900" ]
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
                , class "flex-1 min-h-0 overflow-y-auto"
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


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotCandidaciesResponse remoteCandidacies ->
            ( { model | state = model.state |> withCandidacies remoteCandidacies }
            , Cmd.none
            )

        GotCandidacyResponse remoteCandidacy ->
            ( { model | selected = remoteCandidacy }, Cmd.none )

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
                    Form.update formMsg model.form
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
            , Request.deleteCandidacy model.endpoint model.token GotCandidacyDeletionResponse candidacy.id
            )

        UserArchivedCandidacy candidacy ->
            ( model
            , Request.archiveCandidacy model.endpoint model.token GotCandidacyArchivingResponse candidacy.id
            )


updateTab : Tab -> Model -> ( Model, Cmd Msg )
updateTab tab model =
    let
        newModel =
            { model | tab = tab }
    in
    case tab of
        View.Candidacy.Profil candidacyId ->
            initCandidacy candidacyId newModel
                |> withTakeOver candidacyId

        View.Candidacy.Meetings candidacyId ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm
                        { form = appointmentForm
                        , onLoad = Request.requestAppointment candidacyId
                        , onSave = Request.updateAppointment candidacyId
                        , onRedirect =
                            Nav.pushUrl
                                model.navKey
                                (Route.toString model.baseUrl (Route.Candidacy (View.Candidacy.Profil candidacyId)))
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        View.Candidacy.Training candidacyId ->
            let
                ( formModel, formCmd ) =
                    Form.updateForm
                        { form = trainingForm
                        , onLoad = Request.requestTrainings candidacyId
                        , onSave = Request.updateTrainings candidacyId
                        , onRedirect =
                            Nav.pushUrl
                                model.navKey
                                (Route.toString model.baseUrl (Route.Candidacy (View.Candidacy.Profil candidacyId)))
                        }
                        model.form
            in
            ( { newModel | form = formModel }, Cmd.map GotFormMsg formCmd )

        View.Candidacy.Empty ->
            ( newModel, Cmd.none )


withTakeOver : CandidacyId -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
withTakeOver candidacyId ( model, cmds ) =
    ( model, Cmd.batch [ cmds, Request.takeOverCandidacy model.endpoint model.token GotCandidacyTakingOverResponse candidacyId ] )



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
