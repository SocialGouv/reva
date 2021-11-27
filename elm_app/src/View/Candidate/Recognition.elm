module View.Candidate.Recognition exposing (view)

import Candidate exposing (Candidate)
import Html.Styled exposing (Html, h3, p, text)
import Html.Styled.Attributes exposing (class)


view : Candidate -> List (Html msg)
view _ =
    [ h3
        [ class "mb-4 text-lg font-semibold text-gray-800" ]
        [ text "Reconnaissance de méta-compétences" ]
    , p []
        [ text "Bientôt, vous pourrez démarrer ici une démarche de reconnaissance. Accompagné du candidat, vous sélectionnerez une ou plusieurs méta-compétences à reconnaître."
        ]
    , p
        [ class "mt-2" ]
        [ text "Pour chaque méta-compétence, vous ajouterez du contexte et chargerez les éventuels fichiers de preuves. A l'issue de ce processus, vous pourrez générer un livret de reconnaissance."
        ]
    , p
        [ class "mt-2" ]
        [ text "D'ici la mise à disposition du module de reconnaissance, vous pouvez nous poser vos questions via le chat en bas à droite de cette page." ]
    ]
