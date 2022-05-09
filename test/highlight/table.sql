CREATE TABLE accounts (
-- <- keyword
---    ^ keyword
---          ^ variable
user_id serial,
-- <- variable
--        ^ type.builtin
username VARCHAR,
-- <- variable
--       ^ type.builtin
password VARCHAR,
-- <- variable
--       ^ type.builtin
email VARCHAR,
-- <- variable
--    ^ type.builtin
created_on TIMESTAMP,
-- <- variable
--         ^ type.builtin
last_login TIMESTAMP,
-- <- variable
--         ^ type.builtin
created_at TIMESTAMP
-- <- variable
--         ^ type.builtin
updated_at TIMESTAMP
);
