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
        [ ( "candidate-info", Form.Title2 "1. Informations du candidat" )
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
        , ( "selected-organism", Form.Title2 "2. Choix du candidat" )
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
        , ( "companion", Form.Title2 "3. Parcours personnalisé" )
        , ( "individual", Form.Title3 "Accompagnement" )
        , ( "collective", Form.Title4 "Individuel" )
        , ( keys.individualHourCount, hourCountElement )
        , ( keys.individualCost, costElement )
        , ( "collective", Form.Title4 "Collectif" )
        , ( keys.collectiveHourCount, hourCountElement )
        , ( keys.collectiveCost, costElement )
        , ( "training", Form.Title2 "4. Compléments formatifs" )
        , ( "mandatory-training", Form.Title3 "Formation obligatoire" )
        , ( keys.mandatoryTrainingIds
          , Form.ReadOnlyElement <|
                Form.CheckboxList "Formations obligatoires sélectionnées" <|
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
        , ( "skills", Form.Title3 "Bloc de compétences" )
        , ( keys.certificateSkills, Form.ReadOnlyElement <| Form.Textarea "" Nothing )
        , ( keys.certificateSkillsHourCount, hourCountElement )
        , ( keys.certificateSkillsCost, costElement )
        , ( "other", Form.Title3 "Autres" )
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
