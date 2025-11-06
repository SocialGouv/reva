insert into region (label, code) values ('Saint-Barthélemy', '977');

update department set region_id = (select id from region where code = '977') where code = '977';

update department set elligible_vae = true where code = '977';
