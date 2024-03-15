module Page.Search.Typology exposing
    ( Model
    , Msg
    , init
    , update
    , view
    , withFilters
    )

import Accessibility exposing (h1, h2)
import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Admin.Scalar exposing (Id)
import Api.Candidacy
import Api.CandidacyConventionCollective
import BetaGouv.DSFR.Button as Button
import Browser.Navigation as Nav
import Data.Candidacy exposing (Candidacy, CandidacyId)
import Data.CandidacyConventionCollective exposing (CandidacyConventionCollective)
import Data.Context exposing (Context)
import Data.Form.Training exposing (candidateTypologyFromString, candidateTypologyToString)
import Html exposing (Html, a, div, label, legend, p, text)
import Html.Attributes exposing (attribute, class, href, target, title)
import Page.Search as Search
import Platform.Cmd as Cmd
import RemoteData exposing (RemoteData(..))
import Route exposing (Route)
import View
import View.Candidacy.NavigationSteps as NavigationSteps
import View.Candidacy.Tab exposing (Value(..))
import View.Form exposing (viewSelect)


type Msg
    = GotSearchMsg (Search.Msg CandidacyConventionCollective Msg)
    | GotCandidacyResponse (RemoteData (List String) Candidacy)
    | GotCandidacyUpdateResponse CandidacyId (RemoteData (List String) ())
    | GotConventionCollectiveUpdateResponse CandidacyId (RemoteData (List String) ())
    | UserChangedTypology String String
    | UserClickNext
    | UserSelectConventionCollective CandidacyConventionCollective


type alias Filters =
    { page : Int
    }


type alias Model =
    { candidacyId : CandidacyId
    , filters : Filters
    , search : Search.Model CandidacyConventionCollective Msg
    , submission : RemoteData (List String) ()
    , candidacy : RemoteData (List String) Candidacy
    , errors : List String
    }


type alias Config =
    { candidacyId : CandidacyId
    , page : Int
    }


withFilters : Context -> Config -> Model -> ( Model, Cmd Msg )
withFilters context config model =
    let
        pageChanged =
            model.filters.page /= config.page

        withNewPage : Filters -> Filters
        withNewPage filters =
            { filters | page = config.page }

        ( newSearchModel, searchCmd ) =
            if pageChanged then
                Search.reload context
                    model.search
                    (getCandidacyConventionCollectives config.page)
                    (\p -> Route.Typology config.candidacyId (Route.TypologyFilters p))

            else
                ( model.search, Cmd.none )
    in
    ( { model
        | filters = model.filters |> withNewPage
        , search = newSearchModel
      }
    , Cmd.map GotSearchMsg searchCmd
    )


init : Context -> Config -> ( Model, Cmd Msg )
init context config =
    let
        ( searchModel, searchCmd ) =
            Search.init
                context
                { onSearch = getCandidacyConventionCollectives config.page
                , toMsg = GotSearchMsg
                , toPageRoute = \p -> Route.Typology config.candidacyId (Route.TypologyFilters p)
                , viewItem = viewItem
                }
    in
    ( { candidacyId = config.candidacyId
      , filters = { page = config.page }
      , search = searchModel
      , submission = NotAsked
      , candidacy = NotAsked
      , errors = []
      }
    , Cmd.batch
        [ searchCmd
        , Api.Candidacy.get context.endpoint context.token GotCandidacyResponse config.candidacyId
        ]
    )


getCandidacyConventionCollectives :
    Int
    -> Context
    -> (RemoteData (List String) Data.CandidacyConventionCollective.CandidacyConventionCollectivePaginated -> msg)
    -> Maybe String
    -> Cmd.Cmd msg
getCandidacyConventionCollectives page context =
    Api.CandidacyConventionCollective.getCandidacyConventionCollectives
        context.endpoint
        context.token
        page



-- VIEW


view : Context -> Model -> Html Msg
view context model =
    let
        newCandidacySummaryPageActive =
            List.member "NEW_CANDIDACY_SUMMARY_PAGE" context.activeFeatures

        url =
            if newCandidacySummaryPageActive then
                "/admin2/candidacies/" ++ Data.Candidacy.candidacyIdToString model.candidacyId ++ "/summary"

            else
                Route.toString context.baseUrl (Route.Candidacy { value = Profile, candidacyId = model.candidacyId })

        viewPage content =
            View.layout
                "Accéder aux étapes du parcours"
                (NavigationSteps.view model.candidacy)
                [ View.article
                    "Définition du parcours"
                    url
                    "Aperçu de la candidature"
                    content
                ]
    in
    case model.candidacy of
        Success candidacy ->
            viewPage [ viewForm context model candidacy ]

        Failure errors ->
            viewPage [ View.popupErrors errors ]

        _ ->
            viewPage
                [ View.skeleton "mt-8 mb-12 w-full sm:w-96 h-12"
                , View.skeleton "mb-12 w-full w-96 h-5"
                , View.skeleton "w-full h-12 mb-6"
                , View.skeleton "w-full h-32 mb-24"
                , View.skeleton "w-full h-12 mb-6"
                , View.skeleton "w-full h-64 mb-12"
                ]


viewForm : Context -> Model -> Candidacy -> Html Msg
viewForm context model candidacy =
    div []
        [ h1
            [ class "text-dsfrBlue-500 text-4xl mb-1" ]
            [ text "Définition du parcours" ]
        , p [ class "text-gray-600 mb-2" ]
            [ text "Sauf mention contraire “(optionnel)” dans le label, tous les champs sont obligatoires." ]
        , legend
            [ class "w-full border-t pt-6" ]
            [ h2 [ class "text-xl" ] [ text "Informations du candidat" ] ]
        , viewSelectTypology context candidacy
        , if candidacy.typology == SalariePrive || candidacy.typology == DemandeurEmploi then
            viewDirectoryPanel context model candidacy

          else
            div
                [ class "mt-8 pb-4 flex justify-end w-full" ]
                [ Button.new { onClick = Just UserClickNext, label = "Suivant" }
                    |> Button.submit
                    |> Button.view
                ]
        , View.popupErrors model.errors
        ]


viewSelectTypology : Context -> Candidacy -> Html Msg
viewSelectTypology _ candidacy =
    let
        elementId =
            "typology"

        filteredTypologyList : List CandidateTypology
        filteredTypologyList =
            [ SalariePrive, DemandeurEmploi, AidantsFamiliaux, Benevole ]

        typology =
            candidacy.typology

        typologies =
            filteredTypologyList

        availableTypologies =
            if typology /= NonSpecifie && (not <| List.member typology typologies) then
                typology :: typologies

            else
                typologies
    in
    viewSelect
        { elementId = elementId
        , label = "Typologie"
        , dataOrDefault = candidateTypologyToString typology
        , choices = availableTypologies |> List.map (\el -> ( candidateTypologyToString el, candidateTypologyToString el ))
        , onInputMsg = UserChangedTypology
        }


viewDirectoryPanel : Context -> Model -> Candidacy -> Html Msg
viewDirectoryPanel context model candidacy =
    case model.submission of
        Failure errors ->
            View.popupErrors errors

        _ ->
            div
                [ attribute "aria-label" "Certifications" ]
                [ div []
                    [ h2 [ class "text-sm font-semibold mb-2" ] [ text "Convention collective sélectionnée" ]
                    , div
                        [ class "mb-10 h-20 flex flex-col justify-center"
                        , class "bg-gray-100 rounded-xl px-5"
                        ]
                      <|
                        if candidacy.conventionCollective == Nothing then
                            [ div
                                [ class "text-center text-gray-400 font-medium text-sm" ]
                                [ text "Aucune convention collective sélectionnée" ]
                            ]

                        else
                            viewConventionCollective candidacy.conventionCollective
                    ]
                , label
                    [ class "block mt-[6px] mb-[10px] uppercase text-xs font-semibold" ]
                    [ text "Convention collective (une seule convention pour un candidat)" ]
                , View.alert View.Info
                    [ class "mb-10" ]
                    "Comment trouver la convention collective ?"
                    [ p []
                        [ text "Vous pouvez retrouver le nom de sa convention collective sur son bulletin de paie ou sur son contrat de travail."
                        ]
                    , a [ class "fr-link", href "https://code.travail.gouv.fr/outils/convention-collective", target "_blank" ] [ text "Retrouvez la liste complète sur le site du code du travail" ]
                    ]
                , p [ class "mb-2" ] [ text "Recherchez parmi les conventions collectives disponibles" ]
                , Search.view context model.search
                , case model.submission of
                    Loading ->
                        div [ class "mt-24 absolute inset-0 opacity-75 bg-white" ] []

                    _ ->
                        text ""
                ]


viewItem : Context -> CandidacyConventionCollective -> List (Html Msg)
viewItem _ ccn =
    [ div
        [ class "flex items-end justify-between"
        , class "my-6 border-b pb-6 px-4"
        ]
        [ div
            []
            [ div [ class "text-sm text-gray-500" ] [ text ccn.idcc ]
            , div [ class "text-lg font-semibold" ] [ text ccn.label ]
            ]
        , div
            []
            [ Button.new
                { onClick = Just (UserSelectConventionCollective ccn)
                , label = "Choisir"
                }
                |> Button.tertiary
                |> Button.view
            ]
        ]
    ]


viewConventionCollective : Maybe CandidacyConventionCollective -> List (Html msg)
viewConventionCollective conventionCollective =
    case conventionCollective of
        Nothing ->
            [ text "" ]

        Just ccn ->
            [ div
                [ class "text-sm text-gray-600" ]
                [ text ccn.idcc ]
            , div
                [ class "text-lg font-semibold"
                , class "truncate"
                , title ccn.label
                ]
                [ text ccn.label ]
            ]



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    let
        updateCandidacy f =
            RemoteData.map f model.candidacy
    in
    case msg of
        GotSearchMsg searchMsg ->
            let
                ( newSearchModel, searchCmd ) =
                    Search.update context searchMsg model.search
            in
            ( { model | search = newSearchModel }
            , Cmd.map GotSearchMsg searchCmd
            )

        GotCandidacyResponse (Success candidacy) ->
            ( { model | candidacy = Success candidacy }, Cmd.none )

        GotCandidacyResponse remoteCandidacy ->
            ( { model | candidacy = remoteCandidacy }, Cmd.none )

        GotConventionCollectiveUpdateResponse candidacyId response ->
            ( { model | submission = response }
            , if response == Success () then
                Nav.pushUrl
                    context.navKey
                    (Route.toString context.baseUrl
                        (Route.Candidacy
                            (View.Candidacy.Tab.Tab candidacyId Profile)
                        )
                    )

              else
                Cmd.none
            )

        UserChangedTypology _ elementValue ->
            let
                typology =
                    candidateTypologyFromString elementValue
            in
            ( { model | candidacy = updateCandidacy (\c -> { c | typology = typology }) }, Cmd.none )

        UserSelectConventionCollective conventionCollective ->
            ( { model | candidacy = updateCandidacy (\c -> { c | conventionCollective = Just conventionCollective }) }
            , submitTypology context model (Just conventionCollective.id)
            )

        UserClickNext ->
            ( model, submitTypology context model Nothing )

        GotCandidacyUpdateResponse candidacyId (Success _) ->
            ( model
            , Nav.pushUrl
                context.navKey
                (Route.toString context.baseUrl
                    (Route.Candidacy
                        (View.Candidacy.Tab.Tab candidacyId Training)
                    )
                )
            )

        GotCandidacyUpdateResponse _ (Failure errors) ->
            ( { model | errors = errors }, Cmd.none )

        GotCandidacyUpdateResponse _ _ ->
            ( model, Cmd.none )


submitTypology : Context -> Model -> Maybe Id -> Cmd Msg
submitTypology context model ccnId =
    case model.candidacy of
        Success candidacy ->
            Api.Candidacy.submitTypologyForm context.endpoint
                context.token
                (GotCandidacyUpdateResponse candidacy.id)
                model.candidacyId
                candidacy.typology
                (Just "")
                ccnId

        _ ->
            Cmd.none
