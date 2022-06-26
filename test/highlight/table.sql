CREATE TABLE mydataset.newtable
-- <- keyword
---     ^ keyword
---            ^ variable
(
  x INT64 OPTIONS(description="An optional INTEGER field"),
--^ variable
--  ^ type.builtin
--        ^ keyword
--                 ^variable.parameter
--                           ^operator
--                              ^string
  y STRUCT<
--   ^ type.builtin
    a ARRAY<STRING> OPTIONS(description="A repeated STRING field"),
--  ^ variable
--    ^ type.builtin
--          ^ type.builtin
--                  ^ keyword
    b BOOL
--  ^ variable
--    ^ type.builtin
  >
)
PARTITION BY _PARTITIONDATE
-- ^keyword
--           ^variable.system  
OPTIONS(
  expiration_timestamp=TIMESTAMP "2025-01-01 00:00:00 UTC",
--^variable.parameter
--                     ^type.builtin
--                               ^string
  partition_expiration_days=1,
--                          ^number
)


