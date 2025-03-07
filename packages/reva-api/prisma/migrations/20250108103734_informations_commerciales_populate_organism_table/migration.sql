-- AlterTable
ALTER TABLE "organism"
ADD COLUMN     "adresse_code_postal" VARCHAR(255),
ADD COLUMN     "adresse_informations_complementaires" VARCHAR(255),
ADD COLUMN     "adresse_numero_et_nom_de_rue" VARCHAR(255),
ADD COLUMN     "adresse_ville" VARCHAR(255),
ADD COLUMN     "conforme_norme_accessibilite" "ConformiteNormeAccessibilite",
ADD COLUMN     "email_contact" VARCHAR(255),
ADD COLUMN     "nom_public" TEXT,
ADD COLUMN     "site_internet" VARCHAR(255),
ADD COLUMN     "telephone" TEXT;

-- Populate new columns with data from the old table
UPDATE organism SET (
    nom_public, 
    telephone, 
    site_internet, 
    email_contact, 
    adresse_numero_et_nom_de_rue, 
    adresse_informations_complementaires, 
    adresse_code_postal, 
    adresse_ville,
    conforme_norme_accessibilite
)
= (  
    oic.nom, 
    oic.telephone, 
    oic.site_internet, 
    oic.email_contact, 
    oic.adresse_numero_et_nom_de_rue, 
    oic.adresse_informations_complementaires, 
    oic.adresse_code_postal, 
    oic.adresse_ville,
    oic."conformeNormesAccessbilite"
  )
FROM organism_informations_commerciales oic
WHERE oic.organism_id = organism.id;
