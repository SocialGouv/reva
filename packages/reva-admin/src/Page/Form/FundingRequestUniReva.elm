module Page.Form.FundingRequestUniReva exposing (droppedOutForm, form, totalCostSection, totalTrainingHourCount)

import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep(..))
import Data.Candidacy as Candidacy exposing (Candidacy)
import Data.Certification exposing (Certification)
import Data.Form exposing (FormData)
import Data.Form.FundingRequestUniReva
import Data.Form.Helper
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)
import String exposing (String)
import View.Form


form : Maybe Certification -> FormData -> ( Candidacy, Referential ) -> Form
form maybeCertification formData ( candidacy, referential ) =
    let
        availableCompanions : List ( String, String )
        availableCompanions =
            candidacy.availableCompanions
                |> Data.Form.Helper.toIdList

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

        displayInfo key =
            ( key
            , Data.Form.get key formData
                |> Maybe.map (Form.StaticHtml << View.Form.summary)
                |> Maybe.withDefault Form.Empty
            )
    in
    { elements =
        commonFields availableCompanions maybeCertification
            ++ [ ( "post-exam", Form.TitleInlined "Entretien post jury" )
               , ( keys.postExamHourCount, hourCountElement )
               , ( keys.postExamCost, costElement )
               , ( "companion", Form.Title2 "Accompagnement" )
               , ( "individual", Form.TitleInlined "Individuel" )
               , ( keys.individualHourCount, hourCountElement )
               , ( keys.individualCost, costElement )
               , ( "collective", Form.TitleInlined "Collectif" )
               , ( keys.collectiveHourCount, hourCountElement )
               , ( keys.collectiveCost, costElement )
               , ( "training", Form.Title2 "Actes formatifs" )
               , ( "mandatory", Form.Title3 "Formations obligatoires" )
               , ( keys.mandatoryTrainingIds
                 , Form.ReadOnlyElement <|
                    Form.CheckboxList "" <|
                        Data.Form.Helper.toIdList referential.mandatoryTrainings
                 )
               , ( keys.mandatoryTrainingsHourCount
                 , hourCountElement
                    |> withCheckedRequired referential.mandatoryTrainings
                 )
               , ( keys.mandatoryTrainingsCost
                 , costElement
                    |> withCheckedRequired referential.mandatoryTrainings
                 )
               , ( "basic-skills", Form.Title3 "Savoirs de base" )
               , ( keys.basicSkillsIds
                 , Form.ReadOnlyElement <|
                    Form.CheckboxList "" <|
                        Data.Form.Helper.toIdList referential.basicSkills
                 )
               , ( keys.basicSkillsHourCount
                 , hourCountElement
                    |> withCheckedRequired referential.basicSkills
                 )
               , ( keys.basicSkillsCost
                 , costElement
                    |> withCheckedRequired referential.basicSkills
                 )
               , ( "skills", Form.Title3 "Bloc de compétences certifiant" )
               , displayInfo keys.certificateSkills
               , ( keys.certificateSkillsHourCount
                 , hourCountElement
                    |> withRequired hasCertificateSkills
                 )
               , ( keys.certificateSkillsCost
                 , costElement
                    |> withRequired hasCertificateSkills
                 )
               , ( "other", Form.Title3 "Autres" )
               , displayInfo keys.otherTraining
               , ( keys.otherTrainingHourCount, hourCountElement )
               , ( keys.otherTrainingCost, costElement )
               , ( "", Form.Break )
               , ( "companionSubTotal"
                 , Form.StaticHtml <|
                    View.Form.intermediateTotal "Nombre d'heures total actes formatifs"
                        (String.fromInt (totalTrainingHourCount formData))
                        ""
                 )
               , ( "jury", Form.Title2 "Prestation jury" )
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
        commonFields [] maybeCertification
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


commonFields : List ( String, String ) -> Maybe Certification -> List ( String, Form.Element )
commonFields availableCompanions maybeCertification =
    [ ( "heading", Form.Title1 "1 - Choix du candidat" )
    , ( "certification"
      , maybeCertification
            |> Maybe.map (.label >> Form.Info "Certification choisie")
            |> Maybe.withDefault (Form.Info "Certification choisie" "Aucune certification choisie")
      )
    , ( keys.companionId, Form.Select "Accompagnateur choisi" availableCompanions )
    , ( "companion", Form.Title1 "2. Parcours personnalisé" )
    , ( "companion", Form.Title2 "Entretien(s)" )
    , ( "diagnosis", Form.TitleInlined "Entretien(s) de faisabilité" )
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
    Data.Form.FundingRequestUniReva.keys


totalSection : ( String, Form.Element )
totalSection =
    ( "total", Form.Title1 "Total" )


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
        + int .otherTrainingHourCount


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
                + (float .otherTrainingHourCount * float .otherTrainingCost)
                + (float .examHourCount * float .examCost)
    in
    roundCost cost
