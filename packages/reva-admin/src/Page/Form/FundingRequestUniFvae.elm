module Page.Form.FundingRequestUniFvae exposing (form)

import Accessibility exposing (div, span)
import Admin.Enum.Gender exposing (Gender(..))
import Data.Candidacy exposing (Candidacy)
import Data.Candidate
import Data.Certification exposing (Certification)
import Data.Form exposing (FormData)
import Data.Form.FundingRequestUniFvae exposing (keys)
import Data.Form.Helper
import Data.Referential exposing (Referential)
import Html.Attributes exposing (class)
import Page.Form as Form exposing (Form)
import View.Form


form : Maybe Certification -> FormData -> ( Candidacy, Referential ) -> Form
form maybeCertification formData ( candidacy, referential ) =
    let
        genders =
            [ Undisclosed
            , Man
            , Woman
            ]
                |> List.map (\el -> ( Data.Candidate.genderToString el, Data.Candidate.genderToString el ))

        displayInfo key =
            ( key
            , Data.Form.get key formData
                |> Maybe.map (Form.StaticHtml << View.Form.summary)
                |> Maybe.withDefault Form.Empty
            )
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
        , ( "", Form.Break )
        , ( keys.candidateSecondname, Form.Input "2ième prénom" )
        , ( keys.candidateThirdname, Form.Input "3ième prénom" )
        , ( keys.candidateGender, Form.Select "Genre" genders )
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
        , ( "companion", Form.Title1 "3. Parcours personnalisé" )
        , ( "forfait"
          , Form.StaticHtml <|
                div
                    [ class "w-full flex flex-wrap mb-6"
                    ]
                    [ div
                        [ class "w-full lg:w-2/3 " ]
                        [ div [ class "flex flex-col" ]
                            [ span [ class "text-md font-semibold" ] [ Accessibility.text "Forfait d’étude de faisabilité et entretien post-jury" ]
                            , span [ class "mt-3" ] []
                            , span [ class "text-sm text-orange-500" ] [ Accessibility.text "⚠ Ne pourra être demandé que si l'étude a été réalisée dans sa totalité." ]
                            ]
                        ]
                    , div
                        [ class "w-full lg:w-1/3 pl-6 mb-2 lg:mb-0"
                        , class "text-lg font-medium"
                        ]
                        [ div [ class "flex flex-col mx-auto" ] [ span [] [ Accessibility.text "Forfait" ], span [] [ Accessibility.text "300€ net" ] ] ]
                    ]
          )
        , ( "individual", Form.Title2 "Accompagnement" )
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
        , ( "funding-contact", Form.Title1 "4. Responsable du financement" )
        , ( "funding-contact-title", Form.Title2 "Informations concernant le responsable du financement" )
        , ( keys.fundingContactLastname, Form.Input "Nom" )
        , ( keys.fundingContactFirstname, Form.Input "Prénom" )
        , ( keys.fundingContactPhone, Form.Input "Numéro de téléphone" )
        , ( keys.fundingContactEmail, Form.Input "Adresse email" )
        , ( "", Form.Break )
        ]
    , saveLabel = Nothing
    , submitLabel = "Envoyer"
    , title = "Demande de prise en charge"
    }


keys =
    Data.Form.FundingRequestUniFvae.keys


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
