-- Example select query
SELECT foo, bar, t.col1 AS baz
FROM table1, table2 AS t
WHERE foo > t.col1
GROUP BY lower(foo);

-- Example nested select query
SELECT t.a, (SELECT 1) AS baz, (SELECT 2)
FROM table1, (SELECT a FROM foo WHERE b > 100) AS t;

-- Example nested select query
with ctx1 as (
  select * from `gcp_project_args.sandbox.hoge`
  where col1 = hoge
)
, ctx2 as (
  with subctx as (
    select * from ctx1
  )
  , pivoted as (
    select * from subctx 
    pivot (any_value(col1) for col2 in ('a', 'b', 'c'))
  )
  select * from subctx
)

select * from ctx2
