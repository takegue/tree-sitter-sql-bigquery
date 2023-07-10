SELECT a, b;
-- <- keyword
--     ^ variable
--        ^ variable
SELECT foo(args)
-- <- keyword
--      ^ function
--         ^ variable.parameter

FROM table1
-- <- keyword
--   ^ variable
LEFT JOIN table2 ON table1.a = table2.a
-- <- keyword
--    ^ keyword
--               ^ keyword
WHERE a = b
-- <- keyword
--      ^ operator
GROUP BY a, b
-- <- keyword
--    ^ keyword
ORDER BY lower(a), b
-- <- keyword
--    ^ keyword
--        ^ function
;

SELECT (SELECT 1), a
-- <- keyword
--         ^ keyword
--             ^ number
FROM (SELECT a FROM table) AS b;
-- <- keyword
--     ^ keyword
--             ^ keyword
--                         ^ keyword
