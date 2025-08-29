alter table candidate
drop column birthdate;

alter table candidate
rename column birthdate_v2 to birthdate;