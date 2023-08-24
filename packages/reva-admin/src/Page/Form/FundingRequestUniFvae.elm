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
form maybeCertification _ ( candidacy, referential ) =
    let
        genders =
            [ Undisclosed
            , Man
            , Woman
            ]
                |> List.map (\el -> ( Data.Candidate.genderToString el, Data.Candidate.genderToString el ))
    in
    { elements =
        [ ( "candidate-info", Form.Section "Informations du candidat" )
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
        , ( keys.candidateSecondname, Form.Input "2ième prénom" )
        , ( keys.candidateThirdname, Form.Input "3ième prénom" )
        , ( keys.candidateGender, Form.Select "Genre" genders )
        , ( "selected-certification", Form.Section "Certification choisie" )
        , ( "certification"
          , maybeCertification
                |> Maybe.map (.label >> Form.Info "")
                |> Maybe.withDefault Form.Empty
          )
        , ( "selected-organism", Form.Section "Accompagnateur choisi" )
        , ( "certification"
          , candidacy.organism
                |> Maybe.map (.label >> Form.Info "")
                |> Maybe.withDefault Form.Empty
          )
        , ( "companion", Form.Section "Accompagnement" )
        , ( "individual", Form.Title "Accompagnement individuel" )
        , ( keys.individualHourCount, hourCountElement )
        , ( keys.individualCost, costElement )
        , ( "collective", Form.Title "Accompagnement collectif" )
        , ( keys.collectiveHourCount, hourCountElement )
        , ( keys.collectiveCost, costElement )
        , ( "training", Form.Section "Compléments formatifs" )
        , ( "mandatory-training", Form.Title "Formation obligatoire" )
        , ( keys.mandatoryTrainingIds
          , Form.ReadOnlyElement <|
                Form.CheckboxList "Formations obligatoires sélectionnées" <|
                    Data.Form.Helper.toIdList referential.mandatoryTrainings
          )
        , ( keys.mandatoryTrainingsHourCount, hourCountElement )
        , ( keys.mandatoryTrainingsCost, costElement )
        , ( "basic-skills", Form.Title "Savoir de base" )
        , ( keys.basicSkillsIds
          , Form.ReadOnlyElement <|
                Form.CheckboxList "Formations savoirs de base sélectionnées" <|
                    Data.Form.Helper.toIdList referential.basicSkills
          )
        , ( keys.basicSkillsHourCount, hourCountElement )
        , ( keys.basicSkillsCost, costElement )
        , ( "skills", Form.Title "Bloc de compétences" )
        , ( keys.certificateSkills, Form.ReadOnlyElement <| Form.Textarea "" Nothing )
        , ( keys.certificateSkillsHourCount, hourCountElement )
        , ( keys.certificateSkillsCost, costElement )
        , ( "other", Form.Title "Autres" )
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
    Form.Number "Nombre d'heures"
