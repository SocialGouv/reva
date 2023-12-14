DO $$

BEGIN 

    DELETE FROM organism_on_degree;
    INSERT INTO organism_on_degree ("organism_id","degree_id") 
        SELECT organism.id,degree.id from organism,degree where organism.typology != 'experimentation';



END $$;