module Page.Feasibility exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Accessibility exposing (a, div, h3, h4, h5, h6, p, pre)
import Api.Feasibility
import Api.Form.Feasibility
import Browser.Navigation as Nav
import Data.Context exposing (Context)
import Data.Feasibility exposing (Feasibility, Status(..))
import Data.File exposing (File)
import Data.Form exposing (FormData)
import Data.Form.Feasibility exposing (Decision(..), decisionToString)
import Data.Organism exposing (Organism)
import Html exposing (Html, text)
import Html.Attributes exposing (class, classList, href, target, title)
import Page.Form as Form exposing (Form)
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
            Form.updateForm context
                { form = form
                , onLoad = Nothing
                , onSave = Nothing
                , onSubmit = Api.Form.Feasibility.submitDecision
                , onRedirect =
                    Nav.pushUrl
                        context.navKey
                        (Route.toString context.baseUrl (Route.Feasibility feasibilityId))
                , onValidate = Data.Form.Feasibility.validate
                , status = Form.Editable
                }
                Form.empty

        defaultModel : Model
        defaultModel =
            { form = formModel
            , selected = Loading
            }
    in
    ( defaultModel
    , Cmd.batch
        [ Api.Feasibility.get context.endpoint context.token GotFeasibilityResponse feasibilityId
        , Cmd.map GotFormMsg formCmd
        ]
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
                    [ class "flex flex-col gap-y-8"
                    , classList [ ( "pb-8", feasibility.status /= Pending ) ]
                    ]
                    [ h3
                        [ class "text-4xl mb-0" ]
                        [ text
                            (case feasibility.candidate of
                                Just candidate ->
                                    String.concat [ candidate.firstname, " ", candidate.lastname ]

                                Nothing ->
                                    ""
                            )
                        ]
                    , h4 [ class "mb-0" ] [ text <| Maybe.withDefault "" feasibility.certificationLabel ]
                    , viewFileLink feasibility.file
                    , feasibility.otherFile
                        |> Maybe.map viewFileLink
                        |> Maybe.withDefault (text "")
                    , Maybe.map viewOrganism feasibility.organism
                        |> Maybe.withDefault (text "")
                    , case feasibility.status of
                        Pending ->
                            Form.view (RemoteData.succeed feasibility) model.form
                                |> Html.map GotFormMsg

                        Rejected reason ->
                            viewDecision "Non recevable" reason

                        Admissible reason ->
                            viewDecision "Recevable" reason
                    ]
                ]


viewFileLink : File -> Html msg
viewFileLink file =
    div
        [ class "bg-gray-100 px-8 pt-6 pb-8 border" ]
        [ a
            [ href file.url
            , target "_blank"
            , class "fr-link text-2xl font-semibold"
            , title (file.name ++ " - nouvelle fenêtre")
            ]
            [ text file.name ]
        ]


viewOrganism : Organism -> Accessibility.Html msg
viewOrganism organism =
    viewSection "Architecte accompagnateur de parcours"
        [ h6
            [ class "text-xl mb-4" ]
            [ text organism.label ]
        , p [ class "text-lg mb-0" ] [ text organism.contactAdministrativeEmail ]
        ]


viewDecision : String -> String -> Html msg
viewDecision decision reason =
    div
        [ class "flex flex-col mb-2 gap-y-8" ]
        [ viewSection "Décision prise concernant ce dossier"
            [ p
                [ class "font-semibold text-lg text-gray-900 mb-0" ]
                [ text decision ]
            ]
        , viewSection "Motifs de la décision"
            [ if reason == "" then
                p [ class "mb-0 italic" ] [ text "Motifs non précisés" ]

              else
                p [ class "mb-0" ] [ text reason ]
            ]
        ]


viewSection : String -> List (Html msg) -> Html msg
viewSection title content =
    div
        [ class "bg-gray-100 px-8 pt-6 pb-8" ]
        (h5
            [ class "text-2xl mb-4" ]
            [ text title ]
            :: content
        )


form : FormData -> Feasibility -> Form
form formData _ =
    let
        keys =
            Data.Form.Feasibility.keys

        decisions =
            [ ( "valid", Valid )
            , ( "invalid", Invalid )
            ]
                |> List.map (\( id, decision ) -> ( id, decisionToString decision ))

        status =
            Data.Form.Feasibility.fromDict formData
    in
    { elements =
        [ ( keys.decision, Form.RadioList "Décision prise concernant ce dossier" decisions )
        , ( keys.reason, Form.Textarea "Précisez les motifs de votre décision" Nothing )
        , ( "info"
          , Form.Info "" "Rappel : les motifs de votre décision seront transmis au candidat et à son architecte de parcours."
          )
        ]
    , saveLabel = Nothing
    , submitLabel = "Envoyer la décision"
    , title = ""
    }


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
