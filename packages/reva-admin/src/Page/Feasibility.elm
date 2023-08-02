module Page.Feasibility exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Accessibility exposing (div, h1, p)
import Api.Feasibility
import Data.Context exposing (Context)
import Data.Feasibility exposing (Feasibility)
import Html exposing (Html, text)
import Html.Attributes exposing (class)
import Page.Form as Form
import RemoteData exposing (RemoteData(..))
import Route exposing (emptyFeasibilityFilters)
import String exposing (String)
import View


type Msg
    = GotFeasibilityResponse (RemoteData (List String) Feasibility)
    | GotFormMsg (Form.Msg Feasibility)


type alias Model =
    { form : Form.Model Feasibility
    , selected : RemoteData (List String) Feasibility
    }


init : Context -> String -> ( Model, Cmd Msg )
init context feasibilityId =
    let
        ( formModel, formCmd ) =
            Form.init

        defaultModel : Model
        defaultModel =
            { form = formModel
            , selected = NotAsked
            }
    in
    ( defaultModel, Cmd.map GotFormMsg formCmd )


initFeasibility : Context -> String -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
initFeasibility context feasibilityId ( model, cmd ) =
    ( { model | selected = Loading }
    , Cmd.batch [ Api.Feasibility.get context.endpoint context.token GotFeasibilityResponse feasibilityId, cmd ]
    )



-- VIEW


view :
    Context
    -> Model
    -> Html Msg
view context model =
    View.layout "" [] [] [ viewFeasibilityPanel context model ]


viewFeasibilityPanel : Context -> Model -> Html Msg
viewFeasibilityPanel context model =
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

            Success feasibility ->
                [ div
                    [ class "p-4" ]
                    [ h1 [] [ text "Dossier de faisabilité" ]
                    , p [] [ text feasibility.id ]
                    ]
                ]


viewMain : Context -> String -> List (Html msg) -> Html msg
viewMain context dataTest content =
    View.article
        dataTest
        (Route.href context.baseUrl (Route.Feasibilities emptyFeasibilityFilters))
        "Tous les dossiers"
        content



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    case msg of
        GotFeasibilityResponse remoteFeasibility ->
            ( { model | selected = remoteFeasibility }, Cmd.none )

        GotFormMsg formMsg ->
            let
                ( formModel, formCmd ) =
                    Form.update context formMsg model.form
            in
            ( { model | form = formModel }, Cmd.map GotFormMsg formCmd )
