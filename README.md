[![Build/Test](https://github.com/TKNGUE/tree-sitter-sql-bigquery/actions/workflows/ci.yml/badge.svg)](https://github.com/TKNGUE/tree-sitter-sql-bigquery/actions/workflows/ci.yml)

# tree-sitter for GoogleSQL (SQL dialect in BigQuery)

GoogleSQL(formerly known as StandardSQL) parser available in many programming language such as Rust, Node and so on. You
could try out the demo on [Github Pages](https://takegue.github.io/tree-sitter-sql-bigquery/)

### References

- ZetaSQL: https://github.com/google/zetasql/blob/master/docs/README.md

- Other SQL Dialect Projects:
  - MySQL: https://github.com/DerekStride/tree-sitter-sql
  - PostgreSQL: https://github.com/m-novikov/tree-sitter-sql
  - SQLite: https://github.com/dhcmrlchtdj/tree-sitter-sqlite

## Development

### Running tests

```
npm install --also=dev
npm test
```

### Debbuging

- `npm run parse <your sql file.sql>` outputs a syntax tree
