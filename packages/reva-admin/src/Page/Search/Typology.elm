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
import Admin.Object.Candidacy exposing (conventionCollective, typology)
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
import Route
import View
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
    , typology : Maybe CandidateTypology
    , conventionCollective : Maybe CandidacyConventionCollective
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
                Search.reload model.search
                    (Api.CandidacyConventionCollective.getCandidacyConventionCollectives
                        context.endpoint
                        context.token
                        config.page
                    )
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
                { onSearch =
                    Api.CandidacyConventionCollective.getCandidacyConventionCollectives context.endpoint
                        context.token
                        config.page
                , toMsg = GotSearchMsg
                , toPageRoute = \p -> Route.Typology config.candidacyId (Route.TypologyFilters p)
                , viewItem = viewItem
                }
    in
    ( { candidacyId = config.candidacyId
      , filters = { page = config.page }
      , search = searchModel
      , submission = NotAsked
      , typology = Nothing
      , conventionCollective = Nothing
      , errors = []
      }
    , Cmd.batch
        [ searchCmd
        , Api.Candidacy.get context.endpoint context.token GotCandidacyResponse config.candidacyId
        ]
    )



-- VIEW


view : Context -> Model -> Html Msg
view context model =
    View.layout
        ""
        []
        [ viewDirectoryHeader context model ]


viewDirectoryHeader : Context -> Model -> Html Msg
viewDirectoryHeader context model =
    let
        backRoute =
            Route.Candidacy { value = Profile, candidacyId = model.candidacyId }

        typologyValue =
            candidateTypologyToString <| Maybe.withDefault NonSpecifie model.typology
    in
    View.article
        "Définition du parcours"
        (Route.href context.baseUrl backRoute)
        "Revenir à la candidature"
        [ div []
            [ h1
                [ class "text-dsfrBlue-500 text-4xl mb-1" ]
                [ text "Définition du parcours" ]
            , p [ class "text-gray-600 mb-2" ]
                [ text "Sauf mention contraire “(optionnel)” dans le label, tous les champs sont obligatoires." ]
            , legend
                [ class "w-full border-t pt-6" ]
                [ h2 [ class "text-xl" ] [ text "1 - Informations du candidat" ] ]
            , viewSelectTypology context model
            , if typologyValue == "Salarié du privé" || typologyValue == "Demandeur d’emploi" then
                viewDirectoryPanel context model

              else
                div
                    [ class "mt-8 pb-4 flex justify-end pr-2 w-full" ]
                    [ Button.new { onClick = Just UserClickNext, label = "Suivant" }
                        |> Button.submit
                        |> Button.view
                    ]
            , View.popupErrors model.errors
            ]
        ]


viewSelectTypology : Context -> Model -> Html Msg
viewSelectTypology _ model =
    let
        elementId =
            "typology"

        typologyValue =
            candidateTypologyToString <| Maybe.withDefault NonSpecifie model.typology

        filteredTypologyList : List CandidateTypology
        filteredTypologyList =
            [ SalariePrive, DemandeurEmploi, AidantsFamiliaux, Benevole, Autre ]

        typologies =
            filteredTypologyList
                |> List.map (\el -> ( candidateTypologyToString el, candidateTypologyToString el ))

        availableTypologies =
            if typologyValue /= candidateTypologyToString NonSpecifie && (List.length (List.filter (\( _, v ) -> v == typologyValue) typologies) == 0) then
                List.append [ ( typologyValue, typologyValue ) ] typologies

            else
                typologies
    in
    viewSelect { elementId = elementId, label = "Typologie", dataOrDefault = typologyValue, choices = availableTypologies, onInputMsg = UserChangedTypology }


viewDirectoryPanel : Context -> Model -> Html Msg
viewDirectoryPanel context model =
    case model.submission of
        Failure errors ->
            View.popupErrors errors

        _ ->
            div
                [ attribute "aria-label" "Certifications" ]
                [ if model.conventionCollective == Nothing then
                    div [] []

                  else
                    div []
                        [ h2 [ class "text-sm font-semibold mb-2" ] [ text "Convention collective sélectionnée" ]
                        , div
                            [ class "mb-10 h-20 flex flex-col justify-center"
                            , class "bg-gray-100 rounded-xl px-5"
                            ]
                            (viewConventionCollective model.conventionCollective)
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


viewItem : CandidacyConventionCollective -> List (Html Msg)
viewItem ccn =
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
            ( { model | typology = Just candidacy.typology, conventionCollective = candidacy.conventionCollective }, Cmd.none )

        GotCandidacyResponse _ ->
            ( model, Cmd.none )

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
            ( { model | typology = Just typology }, Cmd.none )

        UserSelectConventionCollective conventionCollective ->
            ( { model | conventionCollective = Just conventionCollective }
            , Api.Candidacy.submitTypologyForm context.endpoint
                context.token
                (GotCandidacyUpdateResponse model.candidacyId)
                model.candidacyId
                (Maybe.withDefault NonSpecifie model.typology)
                (Just "")
                (Just conventionCollective.id)
            )

        UserClickNext ->
            ( model
            , Api.Candidacy.submitTypologyForm context.endpoint
                context.token
                (GotCandidacyUpdateResponse model.candidacyId)
                model.candidacyId
                (Maybe.withDefault NonSpecifie model.typology)
                (Just "")
                Nothing
            )

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
