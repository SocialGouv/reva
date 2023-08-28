module Page.Form.FundingRequestUniFvae exposing (form)

import Admin.Enum.Gender exposing (Gender(..))
import Data.Candidacy exposing (Candidacy)
import Data.Candidate
import Data.Certification exposing (Certification)
import Data.Form exposing (FormData)
import Data.Form.FundingRequestUniFvae exposing (keys)
import Data.Form.Helper
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


form : Maybe Certification -> FormData -> ( Candidacy, Referential ) -> Form
form maybeCertification formData ( candidacy, referential ) =
    let
        genders =
            [ Undisclosed
            , Man
            , Woman
            ]
                |> List.map (\el -> ( Data.Candidate.genderToString el, Data.Candidate.genderToString el ))
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
        , ( "individual", Form.Title2 "Accompagnement" )
        , ( "collective", Form.TitleInlined "Individuel" )
        , ( keys.individualHourCount, hourCountElement )
        , ( keys.individualCost, costElement )
        , ( "collective", Form.TitleInlined "Collectif" )
        , ( keys.collectiveHourCount, hourCountElement )
        , ( keys.collectiveCost, costElement )
        , ( "sum-companion", Form.TitleInlined "Sous-total des accompagnements" )
        , ( "-h"
          , Form.Info "Nombre d'heures total accompagnement" <|
                String.fromFloat (totalCompanionHourCount formData)
          )
        , ( "-€"
          , Form.Info "Coût des heures d'accompagnement" <|
                String.fromFloat (totalCompanionCost formData)
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
                Form.CheckboxList "Formations savoirs de base sélectionnées" <|
                    Data.Form.Helper.toIdList referential.basicSkills
          )
        , ( keys.basicSkillsHourCount, hourCountElement )
        , ( keys.basicSkillsCost, costElement )
        , ( "skills", Form.TitleInlined "Bloc de compétences" )
        , ( keys.certificateSkills, Form.ReadOnlyElement <| Form.Textarea "" Nothing )
        , ( keys.certificateSkillsHourCount, hourCountElement )
        , ( keys.certificateSkillsCost, costElement )
        , ( "other", Form.TitleInlined "Autres" )
        , ( keys.otherTraining, Form.ReadOnlyElement <| Form.Textarea "" Nothing )
        , ( keys.otherTrainingHourCount, hourCountElement )
        , ( keys.otherTrainingCost, costElement )
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

        roundCost =
            (\x -> x * 100)
                >> truncate
                >> toFloat
                >> (\x -> x / 100)

        cost =
            (float .individualHourCount * float .individualCost)
                + (float .collectiveHourCount * float .collectiveCost)
    in
    roundCost cost



-- cost
