module Page.Subscription exposing
    ( Model
    , Msg
    , init
    , update
    , view
    )

import Accessibility exposing (a, dd, dl, dt, h1, h2, hr)
import Admin.Enum.LegalStatus as LegalStatus exposing (LegalStatus(..))
import Admin.Enum.OrganismTypology exposing (OrganismTypology(..))
import Api.Form.OrganismSubscription
import Api.Subscription
import Browser.Navigation as Nav
import Data.Context exposing (Context)
import Data.Form exposing (FormData)
import Data.Form.OrganismSubscription exposing (Decision(..), Status(..), decisionToString)
import Data.Referential exposing (DepartmentWithOrganismMethods)
import Data.Subscription exposing (Subscription, SubscriptionSummary)
import Html exposing (Html, div, li, text, ul)
import Html.Attributes exposing (class, href)
import Page.Form as Form exposing (Form)
import RemoteData exposing (RemoteData(..))
import Route
import String exposing (String)
import View
import View.Date exposing (toSmallFormat)
import View.Helpers exposing (dataTest)


type Msg
    = GotSubscriptionResponse (RemoteData (List String) Subscription)
    | GotFormMsg (Form.Msg ())


type alias State =
    { subscription : RemoteData (List String) Subscription
    , errors : List String
    }


type alias Model =
    { form : Form.Model ()
    , state : State
    }


init : Context -> String -> ( Model, Cmd Msg )
init context subscriptionId =
    let
        ( formModel, formCmd ) =
            Form.updateForm context
                { form = form
                , onLoad = Nothing
                , onSave = Nothing
                , onSubmit = Api.Form.OrganismSubscription.submitDecision subscriptionId
                , onRedirect =
                    Nav.pushUrl
                        context.navKey
                        (Route.toString context.baseUrl (Route.Subscriptions { page = 1 }))
                , onValidate = Data.Form.OrganismSubscription.validate
                , status = Form.Editable
                }
                Form.empty

        defaultModel : Model
        defaultModel =
            { form = formModel
            , state =
                { subscription = RemoteData.Loading
                , errors = []
                }
            }

        defaultCmd =
            Api.Subscription.get context.endpoint context.token GotSubscriptionResponse subscriptionId
    in
    ( defaultModel, Cmd.batch [ Cmd.map GotFormMsg formCmd, defaultCmd ] )



-- VIEW


form : FormData -> () -> Form
form formData _ =
    let
        keys =
            Data.Form.OrganismSubscription.keys

        decisions =
            [ ( "valid", Valid )
            , ( "invalid", Invalid )
            ]
                |> List.map (\( id, decision ) -> ( id, decisionToString decision ))

        status =
            Data.Form.OrganismSubscription.fromDict formData
    in
    { elements =
        ( keys.decision, Form.RadioList "Décision prise concernant cette inscription" decisions )
            :: (case status of
                    Rejected _ ->
                        [ ( keys.comment, Form.Textarea "Précisez les motifs de votre décision" Nothing ) ]

                    _ ->
                        []
               )
    , saveLabel = Nothing
    , submitLabel = "Valider la décision"
    , title = ""
    }


view :
    Context
    -> Model
    -> Html Msg
view context model =
    case model.state.subscription of
        NotAsked ->
            div [] []

        Loading ->
            View.layout
                ""
                [ viewCandidaciesLink context ]
                []
                [ View.skeleton "ml-10 mt-8 bg-gray-100 mt-24 h-10 w-[353px]" ]

        Failure errors ->
            View.errors errors

        Success subscription ->
            View.layout
                ""
                [ viewCandidaciesLink context ]
                []
                [ viewContent context model subscription ]


viewContent : Context -> Model -> Subscription -> Html Msg
viewContent context model subscription =
    let
        toLegalStatusString ls =
            case ls of
                AssociationLoi1901 ->
                    "Association loi 1901"

                EtablissementPublic ->
                    "Établissement public (EPIC...)"

                _ ->
                    LegalStatus.toString ls
    in
    View.article
        "subscription"
        (Route.href context.baseUrl (Route.Subscriptions { page = 1 }))
        "Toutes les inscriptions"
        [ div
            [ dataTest "directory-item"
            , class "flex flex-wrap"
            ]
            [ h1 [ class "w-full mb-0" ] [ text subscription.companyName ]
            , viewTitle "Informations générales"
            , viewInfoText "Nom de l'architecte de parcours" [ subscription.accountFirstname, subscription.accountLastname ]
            , viewInfoText "Adresse email de l'architecte de parcours" [ subscription.accountEmail ]
            , viewInfoText "Téléphone de l'architecte de parcours" [ subscription.accountPhoneNumber ]
            , viewInfo "Site internet de la structure"
                [ subscription.companyWebsite
                    |> Maybe.map (\website -> a [ href website ] [ text website ])
                    |> Maybe.withDefault (text "Non spécifié")
                ]
            , viewInfo "Date d'expiration de la certification Qualiopi VAE\n" [ text (toSmallFormat subscription.qualiopiCertificateExpiresAt) ]
            , viewTitle "Informations juridiques de la structure"
            , viewInfoText "SIRET de la structure" [ subscription.companySiret ]
            , viewInfoText "Forme juridique" [ subscription.companyLegalStatus |> toLegalStatusString ]
            , viewInfoText "Adresse de la structure"
                [ subscription.companyAddress
                , subscription.companyZipCode
                , subscription.companyCity
                ]
            , viewTitle "Typologie et zone d'intervention"
            , viewInfoText "Typologie" [ subscription.typology |> typologyToString ]
            , case subscription.typology of
                ExpertBranche ->
                    viewInfo "Conventions collectives" [ viewCategory subscription.ccns ]

                ExpertFiliere ->
                    viewInfo "Filière(s)" [ viewCategory subscription.domains ]

                Generaliste ->
                    div [ class "w-full" ] []
            , viewInfo "Zone d'intervention en présentiel"
                [ viewDepartements subscription.departmentsWithOrganismMethods .isOnSite ]
            , viewInfo "Zone d'intervention en distanciel"
                [ viewDepartements subscription.departmentsWithOrganismMethods .isRemote ]
            ]
        , hr [ class "mt-8" ] []
        , Form.view (RemoteData.succeed ()) model.form
            |> Html.map GotFormMsg
        ]


typologyToString : OrganismTypology -> String
typologyToString typology =
    case typology of
        Generaliste ->
            "Généraliste"

        ExpertFiliere ->
            "Expert de filière(s)"

        ExpertBranche ->
            "Expert de branche(s)"


viewDepartements : List DepartmentWithOrganismMethods -> (DepartmentWithOrganismMethods -> Bool) -> Html msg
viewDepartements departments predicate =
    departments
        |> List.filter predicate
        |> List.map (\d -> li [] [ text <| Data.Referential.departmentToString d.department ])
        |> ul [ class "my-0" ]


viewCategory : List { a | label : String } -> Html msg
viewCategory category =
    category
        |> List.map (\c -> li [] [ text c.label ])
        |> ul [ class "my-0" ]


viewTitle : String -> Accessibility.Html msg
viewTitle s =
    h2 [ class "w-full mt-6 mb-1 text-xl" ] [ text s ]


viewInfo : String -> List (Accessibility.Html msg) -> Accessibility.Html msg
viewInfo term content =
    dl
        [ class "w-full sm:w-1/2 my-2" ]
        [ dt [ class "font-normal text-sm text-gray-600 mb-1" ] [ text term ]
        , dd [ class "my-0" ] content
        ]


viewInfoText : String -> List String -> Accessibility.Html msg
viewInfoText term data =
    viewInfo term <| (List.intersperse " " data |> List.map text)



-- UPDATE


update : Context -> Msg -> Model -> ( Model, Cmd Msg )
update context msg model =
    case msg of
        GotSubscriptionResponse remoteSubscription ->
            ( model, Cmd.none ) |> withSubscription remoteSubscription

        GotFormMsg formMsg ->
            let
                ( formModel, formCmd ) =
                    Form.update context formMsg model.form
            in
            ( { model | form = formModel }, Cmd.map GotFormMsg formCmd )


withErrors : List String -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
withErrors errors ( model, cmd ) =
    let
        state =
            model.state
    in
    ( { model | state = { state | errors = errors } }, cmd )


withSubscription : RemoteData (List String) Subscription -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
withSubscription subscription ( model, cmd ) =
    let
        state =
            model.state
    in
    ( { model | state = { state | subscription = subscription } }, cmd )


viewCandidaciesLink : Context -> Html msg
viewCandidaciesLink context =
    Html.a
        [ class "fr-link"
        , class "md:text-lg text-gray-900 hover:text-blue-900"
        , Route.href context.baseUrl (Route.Candidacies Route.emptyCandidacyFilters)
        ]
        [ text "Voir les candidatures" ]
