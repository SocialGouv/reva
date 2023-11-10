module Page.Form.PaymentRequestUniFvae exposing (confirmationForm, form)

import Accessibility exposing (Html, div, h3, h4, p, span, text)
import Accessibility.Aria as Aria
import Admin.Enum.Gender exposing (Gender(..))
import Admin.Object.FundingRequest exposing (numAction)
import Data.Candidacy exposing (Candidacy)
import Data.Candidate
import Data.Certification exposing (Certification)
import Data.Feasibility exposing (Decision(..))
import Data.Form exposing (FormData)
import Data.Form.Helper
import Data.Form.PaymentRequestUniFvae exposing (keys)
import Data.Referential exposing (Referential)
import Html.Attributes exposing (class)
import Page.Form as Form exposing (Form)
import View.Form


form : Maybe Certification -> FormData -> ( Candidacy, Referential ) -> Form
form maybeCertification formData ( candidacy, referential ) =
    let
        displayInfo key =
            ( key
            , Data.Form.get key formData
                |> Maybe.map (Form.StaticHtml << View.Form.summary)
                |> Maybe.withDefault Form.Empty
            )

        showCustomFundingFields =
            case candidacy.feasibility of
                Just f ->
                    case f.decision of
                        Admissible _ ->
                            True

                        _ ->
                            False

                Nothing ->
                    False
    in
    { elements =
        [ ( "candidate-info", Form.Title1 "1. Informations du candidat" )
        , ( "nom"
          , candidacy.candidate
                |> Maybe.map (.lastname >> Form.Info "Nom")
                |> Maybe.withDefault Form.Empty
          )
        , ( "prénom"
          , candidacy.candidate
                |> Maybe.map (.firstname >> Form.Info "Prénom")
                |> Maybe.withDefault Form.Empty
          )
        , ( "genre"
          , candidacy.candidate
                |> Maybe.andThen .gender
                |> Maybe.map Data.Candidate.genderToString
                |> Maybe.map (Form.Info "Genre")
                |> Maybe.withDefault Form.Empty
          )
        , ( "selected-organism", Form.Title1 "2. Choix du candidat" )
        , ( "certification"
          , maybeCertification
                |> Maybe.map (.label >> Form.Info "Certification choisie")
                |> Maybe.withDefault Form.Empty
          )
        , ( "certification"
          , candidacy.organism
                |> Maybe.map (.label >> Form.Info "Accompagnateur choisi")
                |> Maybe.withDefault Form.Empty
          )
        , ( "num-action", Form.Title1 "3. Numéro de prise en charge France VAE" )
        , ( "numAction", Form.Text (Maybe.withDefault "" <| Data.Form.get keys.numAction formData) Nothing )
        , ( "companion", Form.Title1 ". Accompagnement" )
        , ( "forfait", Form.StaticHtml forfaitInfo )
        ]
            ++ (if showCustomFundingFields then
                    [ ( "individual", Form.Title2 "Accompagnement (au moins une ligne obligatoire)" )
                    , ( "collective", Form.TitleInlined "Individuel" )
                    , ( keys.individualHourCount, hourCountElement )
                    , ( keys.individualCost, costElement )
                    , ( "collective", Form.TitleInlined "Collectif" )
                    , ( keys.collectiveHourCount, hourCountElement )
                    , ( keys.collectiveCost, costElement )
                    , ( "", Form.Break )
                    , ( "companionSubTotal"
                      , Form.StaticHtml <|
                            View.Form.intermediateTotal "Sous-total des accompagnements"
                                (totalCompanionHourCount formData |> displayHours)
                                (totalCompanionCost formData |> displayEuros)
                      )
                    , ( "training", Form.Title2 "Compléments formatifs" )
                    , ( "mandatory-training", Form.Title3 "Formation obligatoire" )
                    , ( keys.mandatoryTrainingIds
                      , Form.ReadOnlyElement <|
                            Form.CheckboxList "" <|
                                Data.Form.Helper.toIdList referential.mandatoryTrainings
                      )
                    , ( keys.mandatoryTrainingsHourCount, hourCountElement )
                    , ( keys.mandatoryTrainingsCost, costElement )
                    , ( "basic-skills", Form.Title3 "Savoir de base" )
                    , ( keys.basicSkillsIds
                      , Form.ReadOnlyElement <|
                            Form.CheckboxList "" <|
                                Data.Form.Helper.toIdList referential.basicSkills
                      )
                    , ( keys.basicSkillsHourCount, hourCountElement )
                    , ( keys.basicSkillsCost, costElement )
                    , ( "skills", Form.Title3 "Bloc de compétences" )
                    , displayInfo keys.certificateSkills
                    , ( keys.certificateSkillsHourCount, hourCountElement )
                    , ( keys.certificateSkillsCost, costElement )
                    , ( "other", Form.Title3 "Autres" )
                    , displayInfo keys.otherTraining
                    , ( keys.otherTrainingHourCount, hourCountElement )
                    , ( keys.otherTrainingCost, costElement )
                    , ( "", Form.Break )
                    , ( "trainingSubTotal"
                      , Form.StaticHtml <|
                            View.Form.intermediateTotal "Sous-total des compléments formatifs"
                                (totalTrainingHourCount formData |> displayHours)
                                (totalTrainingCost formData |> displayEuros)
                      )
                    , ( "", Form.BreakToplevel )
                    , ( "grandTotal"
                      , Form.StaticHtml <|
                            View.Form.total "Total"
                                (totalHourCount formData |> displayHours)
                                (totalCost formData |> displayEuros)
                      )
                    , ( "", Form.BreakToplevel )
                    ]

                else
                    []
               )
    , saveLabel = Nothing
    , submitLabel = "Envoyer"
    , title = "Demande de paiement"
    }


forfaitInfo : Html msg
forfaitInfo =
    div
        [ class "w-full flex flex-wrap mb-3" ]
        [ div
            [ class "w-full lg:w-2/3 " ]
            [ div [ class "flex flex-col" ]
                [ h3 [ class "text-base font-medium mb-2" ] [ text "Forfait d’étude de faisabilité et entretien post-jury" ]
                , p [ class "text-xs text-dsfrOrange-500" ]
                    [ span [ class "fr-icon-warning-fill fr-icon--sm mr-1", Aria.hidden True ] []
                    , text "Ne pourra être demandé que si l'étude a été réalisée dans sa totalité."
                    ]
                ]
            ]
        , div
            [ class "flex flex-col items-end lg:items-start"
            , class "w-full lg:w-[200px] pl-6 mb-2 lg:mb-0 mr-2 lg:mr-0"
            ]
            [ h4
                [ class "hidden lg:block"
                , class "uppercase text-xs font-semibold mb-2"
                ]
                [ text "Forfait" ]
            , span [ class "font-medium" ] [ text "300€ net" ]
            ]
        ]


keys =
    Data.Form.PaymentRequestUniFvae.keys


costElement : Form.Element
costElement =
    Form.Price "Coût horaire"


hourCountElement : Form.Element
hourCountElement =
    Form.HourCount "Nombre d'heures"


displayHours : Float -> String
displayHours hours =
    String.fromFloat hours ++ " h"


displayEuros : Float -> String
displayEuros euros =
    String.fromFloat euros ++ " €"


roundCost : Float -> Float
roundCost =
    (\x -> x * 100)
        >> truncate
        >> toFloat
        >> (\x -> x / 100)


totalCompanionHourCount : FormData -> Float
totalCompanionHourCount formData =
    let
        decode =
            Data.Form.Helper.decode keys formData

        float f =
            decode.float f 0
    in
    float .individualHourCount
        + float .collectiveHourCount


totalCompanionCost : FormData -> Float
totalCompanionCost formData =
    let
        decode =
            Data.Form.Helper.decode keys formData

        float f =
            decode.float f 0

        cost =
            (float .individualHourCount * float .individualCost)
                + (float .collectiveHourCount * float .collectiveCost)
    in
    roundCost cost


totalTrainingHourCount : FormData -> Float
totalTrainingHourCount formData =
    let
        decode =
            Data.Form.Helper.decode keys formData

        float f =
            decode.float f 0
    in
    float .mandatoryTrainingsHourCount
        + float .basicSkillsHourCount
        + float .certificateSkillsHourCount
        + float .otherTrainingHourCount


totalTrainingCost : FormData -> Float
totalTrainingCost formData =
    let
        decode =
            Data.Form.Helper.decode keys formData

        float f =
            decode.float f 0

        cost =
            (float .mandatoryTrainingsHourCount * float .mandatoryTrainingsCost)
                + (float .basicSkillsHourCount * float .basicSkillsCost)
                + (float .certificateSkillsHourCount * float .certificateSkillsCost)
                + (float .otherTrainingHourCount * float .otherTrainingCost)
    in
    roundCost cost


totalHourCount : FormData -> Float
totalHourCount formData =
    let
        decode =
            Data.Form.Helper.decode keys formData

        float f =
            decode.float f 0
    in
    float .individualHourCount
        + float .collectiveHourCount
        + float .mandatoryTrainingsHourCount
        + float .basicSkillsHourCount
        + float .certificateSkillsHourCount
        + float .otherTrainingHourCount


totalCost : FormData -> Float
totalCost formData =
    let
        decode =
            Data.Form.Helper.decode keys formData

        float f =
            decode.float f 0

        cost =
            300
                + (float .individualHourCount * float .individualCost)
                + (float .collectiveHourCount * float .collectiveCost)
                + (float .mandatoryTrainingsHourCount * float .mandatoryTrainingsCost)
                + (float .basicSkillsHourCount * float .basicSkillsCost)
                + (float .certificateSkillsHourCount * float .certificateSkillsCost)
                + (float .otherTrainingHourCount * float .otherTrainingCost)
    in
    roundCost cost


confirmationForm : FormData -> ( Candidacy, Referential ) -> Form
confirmationForm formData ( _, _ ) =
    { elements =
        [ ( "num-action"
          , Data.Form.get keys.numAction formData
                |> Maybe.map (Form.Info "Numéro de prise en charge France VAE")
                |> Maybe.withDefault Form.Empty
          )
        ]
    , saveLabel = Nothing
    , submitLabel = "Envoyer"
    , title = "Demande de paiement"
    }
