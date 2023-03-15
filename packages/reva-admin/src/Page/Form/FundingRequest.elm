module Page.Form.FundingRequest exposing (droppedOutForm, form, totalCostSection, totalTrainingHourCount)

import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep(..))
import Data.Candidacy as Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Candidate
import Data.Certification exposing (Certification)
import Data.Form exposing (FormData)
import Data.Form.FundingRequest
import Data.Form.Helper
import Data.Referential exposing (Referential)
import Dict exposing (Dict)
import List.Extra
import Page.Form as Form exposing (Form)
import String exposing (String)


form : Maybe Certification -> FormData -> ( Candidacy, Referential ) -> Form
form maybeCertification formData ( candidacy, referential ) =
    let
        availableCompanions : List ( String, String )
        availableCompanions =
            candidacy.availableCompanions
                |> Data.Form.Helper.toIdList

        maybeReadOnlyTraining : Form.Element -> Form.Element
        maybeReadOnlyTraining formElement =
            if
                candidacy.candidate
                    |> Maybe.map (hasAccessTrainingFunding referential)
                    |> Maybe.withDefault False
            then
                formElement

            else
                Form.ReadOnlyElement formElement

        checked : List { a | id : String } -> List String
        checked ids =
            Data.Form.Helper.selection formData ids

        withCheckedRequired : List { a | id : String } -> Form.Element -> Form.Element
        withCheckedRequired ids formElement =
            withRequired (List.length (checked ids) /= 0) formElement

        hasCertificateSkills : Bool
        hasCertificateSkills =
            Data.Form.get keys.certificateSkills formData
                |> Maybe.map ((/=) "")
                |> Maybe.withDefault False

        withRequired : Bool -> Form.Element -> Form.Element
        withRequired condition formElement =
            case formElement of
                Form.ReadOnlyElement _ ->
                    formElement

                _ ->
                    if condition then
                        formElement

                    else
                        Form.ReadOnlyElement formElement
    in
    { elements =
        commonFields maybeCertification
            ++ [ ( "post-exam", Form.Title "Entretien post jury" )
               , ( keys.postExamHourCount, hourCountElement )
               , ( keys.postExamCost, costElement )
               , ( "companion", Form.Section "Accompagnement méthodologique" )
               , ( keys.companionId, Form.Select "Accompagnateur choisi par le candidat" availableCompanions )
               , ( "individual", Form.Title "Accompagnement individuel" )
               , ( keys.individualHourCount, hourCountElement )
               , ( keys.individualCost, costElement )
               , ( "collective", Form.Title "Accompagnement collectif" )
               , ( keys.collectiveHourCount, hourCountElement )
               , ( keys.collectiveCost, costElement )
               , ( "training", Form.Section "Actes formatifs" )
               , ( "mandatory", Form.Title "Formations obligatoires" )
               , ( keys.mandatoryTrainingIds
                 , Form.ReadOnlyElement <|
                    Form.CheckboxList "Formations obligatoires sélectionnées" <|
                        Data.Form.Helper.toIdList referential.mandatoryTrainings
                 )
               , ( keys.mandatoryTrainingsHourCount
                 , hourCountElement
                    |> maybeReadOnlyTraining
                    |> withCheckedRequired referential.mandatoryTrainings
                 )
               , ( keys.mandatoryTrainingsCost
                 , costElement
                    |> maybeReadOnlyTraining
                    |> withCheckedRequired referential.mandatoryTrainings
                 )
               , ( "basic-skills", Form.Title "Formations savoirs de base" )
               , ( keys.basicSkillsIds
                 , Form.ReadOnlyElement <|
                    Form.CheckboxList "Formations savoirs de base sélectionnées" <|
                        Data.Form.Helper.toIdList referential.basicSkills
                 )
               , ( keys.basicSkillsHourCount
                 , hourCountElement
                    |> maybeReadOnlyTraining
                    |> withCheckedRequired referential.basicSkills
                 )
               , ( keys.basicSkillsCost
                 , costElement
                    |> maybeReadOnlyTraining
                    |> withCheckedRequired referential.basicSkills
                 )
               , ( "skills", Form.Title "Bloc de compétences certifiant" )
               , ( keys.certificateSkills, Form.ReadOnlyElement <| Form.Textarea "" Nothing )
               , ( keys.certificateSkillsHourCount
                 , hourCountElement
                    |> maybeReadOnlyTraining
                    |> withRequired hasCertificateSkills
                 )
               , ( keys.certificateSkillsCost
                 , costElement
                    |> maybeReadOnlyTraining
                    |> withRequired hasCertificateSkills
                 )
               , ( "other", Form.Title "Autres actions de formations complémentaires" )
               , ( keys.otherTraining, Form.ReadOnlyElement <| Form.Textarea "" Nothing )
               , ( keys.totalTrainingHourCount
                 , Form.Info "Nombre d'heures total actes formatifs" <|
                    String.fromInt (totalTrainingHourCount formData)
                 )
               , ( "jury", Form.Title "Prestation jury" )
               , ( keys.examHourCount, hourCountElement )
               , ( keys.examCost, costElement )
               , totalSection
               , totalCostSection totalCostTitle formData
               , confirmationSection candidacy
               ]
    , saveLabel = Nothing
    , submitLabel = saveLabel
    , title = title formData
    }


droppedOutForm : Maybe Certification -> FormData -> ( Candidacy, Referential ) -> Form
droppedOutForm maybeCertification formData ( candidacy, referential ) =
    { elements =
        commonFields maybeCertification
            ++ [ totalSection
               , totalCostSection totalCostTitle formData
               , confirmationSection candidacy
               ]
    , saveLabel = Nothing
    , submitLabel = saveLabel
    , title = title formData
    }


totalCostTitle : String
totalCostTitle =
    "Coût total de la demande de prise en charge"


costElement : Form.Element
costElement =
    Form.Price "Coût horaire"


hourCountElement : Form.Element
hourCountElement =
    Form.Number "Nombre d'heures"


commonFields : Maybe Certification -> List ( String, Form.Element )
commonFields maybeCertification =
    [ ( "heading", Form.Heading "2 - Parcours personnalisé" )
    , ( "selected-certification", Form.Section "Certification choisie par le candidat" )
    , ( "certification"
      , maybeCertification
            |> Maybe.map (.label >> Form.Info "")
            |> Maybe.withDefault Form.Empty
      )
    , ( "organism", Form.Section "Accompagnement architecte de parcours" )
    , ( "diagnosis", Form.Title "Entretien(s) de faisabilité" )
    , ( keys.diagnosisHourCount, hourCountElement )
    , ( keys.diagnosisCost, costElement )
    ]


title : FormData -> String
title formData =
    let
        baseTitle : String
        baseTitle =
            "Demande de prise en charge"
    in
    Data.Form.get keys.numAction formData
        |> Maybe.map (\numAction -> baseTitle ++ " " ++ numAction)
        |> Maybe.withDefault baseTitle


keys =
    Data.Form.FundingRequest.keys


totalSection : ( String, Form.Element )
totalSection =
    ( "total", Form.Section "Total" )


totalCostSection : String -> FormData -> ( String, Form.Element )
totalCostSection sectionTitle formData =
    ( "totalCost"
    , Form.Info sectionTitle <|
        String.concat
            [ String.fromFloat (totalCost formData)
            , "€"
            ]
    )


confirmationSection : Candidacy -> ( String, Form.Element )
confirmationSection candidacy =
    if Candidacy.isStatusEqualOrAbove candidacy DemandeFinancementEnvoye then
        ( ""
        , Form.Empty
        )

    else
        ( keys.isFormConfirmed
        , Form.Checkbox "Je confirme ce montant de prise en charge. Je ne pourrai pas modifier cette demande de prise en charge après son envoi."
        )


saveLabel : String
saveLabel =
    "Envoyer"


hasAccessTrainingFunding : Referential -> Data.Candidate.Candidate -> Bool
hasAccessTrainingFunding referential candidate =
    let
        maybeBac =
            List.Extra.find (\d -> d.code == "N4_BAC") referential.degrees
    in
    case ( candidate.highestDegree, candidate.vulnerabilityIndicator, maybeBac ) of
        ( Just highestDegree, Just vulnerabilityIndicator, Just bac ) ->
            highestDegree.level <= bac.level || vulnerabilityIndicator.label /= "Vide"

        _ ->
            False


totalTrainingHourCount : FormData -> Int
totalTrainingHourCount formData =
    let
        decode =
            Data.Form.Helper.decode keys formData

        int f =
            decode.int f 0
    in
    int .mandatoryTrainingsHourCount
        + int .basicSkillsHourCount
        + int .certificateSkillsHourCount


totalCost : FormData -> Float
totalCost formData =
    let
        decode =
            Data.Form.Helper.decode keys formData

        float f =
            decode.float f 0

        roundCost =
            (\x -> x * 100)
                >> truncate
                >> toFloat
                >> (\x -> x / 100)

        cost =
            (float .diagnosisHourCount * float .diagnosisCost)
                + (float .postExamHourCount * float .postExamCost)
                + (float .individualHourCount * float .individualCost)
                + (float .collectiveHourCount * float .collectiveCost)
                + (float .mandatoryTrainingsHourCount * float .mandatoryTrainingsCost)
                + (float .basicSkillsHourCount * float .basicSkillsCost)
                + (float .certificateSkillsHourCount * float .certificateSkillsCost)
                + (float .examHourCount * float .examCost)
    in
    roundCost cost
