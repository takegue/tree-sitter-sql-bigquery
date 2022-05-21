[![Node.js CI](https://github.com/TKNGUE/tree-sitter-sql-bigquery/actions/workflows/node.js.yml/badge.svg)](https://github.com/TKNGUE/tree-sitter-sql-bigquery/actions/workflows/node.js.yml)
[![Rust](https://github.com/TKNGUE/tree-sitter-sql-bigquery/actions/workflows/rust.yml/badge.svg)](https://github.com/TKNGUE/tree-sitter-sql-bigquery/actions/workflows/rust.yml)

# tree-sitter for BigQuery's SQL

This project supports StandardSQL in BigQuery.
You could try out the demo on [Github Pages](https://tkngue.github.io/tree-sitter-sql-bigquery/)

## Development


File describing grammar is [grammar.js](./grammar.js)

Every time the grammar file changes code generation needs to be run by invoking `npm run gen`

`npm test` command automatically performs code generation

Tests files are located in [test/corpus](./test/corpus)

[Here](https://tree-sitter.github.io/tree-sitter/creating-parsers#command-test) is the documentation on test file syntax

### Running tests

```
npm install --also=dev
npm test
```

### Debbuging

- `npm run parse <file.sql>` outputs a syntax tree

# Supported BigQuery SQL feature

- [ ] Basic Literals/Expressions

  - [x] Literals
  - [x] Architemic operators
  - [x] Logical operators
  - [x] Query Paramter
  - [x] Comments
  - [x] Struct
  - [x] Array
  - [x] CASE expr
  - [x] CASE
  - [x] BETWEEN Operator
  - [ ] INTERVAL types

- [ ] Query Statement

  - [x] SELECT
  - [x] JOIN
  - [x] CTEs
  - [x] TABLESAMPLE Operator
  - [x] Typical syntax Function Calls
  - [ ] Special syntax Function Calls
    - [ ] EXTRACT
  - [x] Pivot/Unpivot Operator
  - [ ] Analytics functions
  - [ ] Pre-GA features
    - [ ] Collation

- [ ] DML Statements

  - [x] INSERT
  - [x] UPDATE
  - [x] TRUNCATE TABLE
  - [x] DELETE
  - [x] MERGE

- [ ] DDL Statements

  - [x] CREATE syntax for TABLE/VIEW/MATERIALIZED_VIEW
  - [x] CREATE synteax for FUNCTION
  - [x] CREATE syntax for TABLE FUNCTION
  - [ ] DELETE syntax for any
  - [ ] ALTER sytnax for any

- [ ] DCL Statements
- [ ] Procedural Lalnguage
- [ ] BigQuery ML

### Other projects

- https://github.com/m-novikov/tree-sitter-sql
- https://github.com/DerekStride/tree-sitter-sql
- https://github.com/dhcmrlchtdj/tree-sitter-sqlite
- https://github.com/google/zetasql
