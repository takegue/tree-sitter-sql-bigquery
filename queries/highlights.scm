; constant

[
    "NULL"
    "TRUE"
    "FALSE"
] @constant
(string) @string
(number) @number
(comment) @comment


; functions
(function_call function: (identifier) @function)
((argument (identifier) @variable.parameter))

(call_statement routine_name: (identifier) @function)

; types
(struct) @type.builtin
(array) @type.builtin
(interval) @type.builtin
(type_identifier) @type.builtin

(option_item key: (identifier) @variable.parameter)
(type) @type.builtin
(column_type) @type.builtin
(identifier) @variable

(as_alias
  alias_name: (identifier) @property)

[
  ";"
  "."
] @punctuation.delimiter


(system_variable) @variable.system

[
    "_PARTITIONDATE"
    "_PARTITIONTIME"
    "_TABLE_SUFFIX"
] @variable.builtin

[
  "DATE"
  "TIME"
  "DATETIME"
  "TIMESTAMP"

  "NUMERIC"
  "BIGNUMERIC"
  "DECIMAL"
  "BIGDECIMAL"

  "INTERVAL"
] @type.builtin

; operators
[
  "-"
  "*"
  "/"
  "^"
  "+"
  "<"
  "="
  "!="
  ">"
  ">>"
  "<<"
  "||"
  "~"
] @operator


; keywords
[
 "ALL"
 "AND"
 "AS"
 "ASC"
 "BETWEEN"
 "CASE"
 "CAST"
 "CREATE"
 "CREATE_SCHEMA"
 "DROP_SCHEMA"
 "ALTER_SCHEMA"
 "ALTER"
 "TABLE"
 "VIEW"
 "DESC"
 "DISTINCT"
 "ELSE"
 "END"
 "EXCEPT"
 "FALSE"
 "FOLLOWING"
 "FOR"
 "FROM"
 "FULL"
 "HAVING"
 "IF_EXISTS"
 "IF_NOT_EXISTS"
 "IN"
 "INNER"
 "INTERVAL"
 "INTO"
 "IS"
 "JOIN"
 "LEFT"
 "LIKE"
 "LIMIT"
 "MERGE"
 "NOT"
 "NULL"
 "ON"
 "OPTIONS"
 "OR"
 "OR_REPLACE"
 "OUTER"
 "OVER"
 "PARTITION_BY"
 "PRECEDING"
 "QUALIFY"
 "RANGE"
 "RIGHT"
 "ROLLUP"
 "ROWS"
 "SELECT"
 "SET"
 "TABLE"
 "THEN"
 "TO"
 "TRUE"
 "UNNEST"
 "USING"
 "WHEN"
 "WHERE"
 "GROUP_BY"
 "ORDER_BY"
 "WINDOW"
 "WITH"
] @keyword
