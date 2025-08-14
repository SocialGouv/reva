update candidacy set derniere_date_activite = now() where derniere_date_activite is null;
alter table candidacy alter column derniere_date_activite set not null;
