; constant
["NULL" "TRUE" "FALSE"] @constant
(string) @string
(number) @number
(comment) @comment

; types
(struct) @type.builtin
(array) @type.builtin
(interval) @type.builtin
(type_identifier) @type.builtin
(system_variable) @variable.system

(type) @type.builtin
(column_type) @type.builtin
(identifier) @variable

(option_item key: (identifier) @variable.parameter)

(as_alias alias_name: (identifier) @property)
[";" "."] @punctuation.delimiter

; functions
(function_call function: (identifier) @function)
((argument (identifier) @variable.parameter))

(call_statement routine_name: (identifier) @function)

"_PARTITIONDATE" @variable.builtin
((identifier) @variable.builtin
 (#match? @variable.builtin "^_[pP][aA][rR][tT][iI][tT][iI][oO][nN][tT][iI][mM][eE]$"))
((identifier) @variable.builtin
 (#match? @variable.builtin "^_[tT][aA][bB][lL][eE]_[sS][uU][fF][fF][iI][xX]$"))

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
  "SCHEMA"
  "ADD"
  "DROP"
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
  "FOR_SYSTEM_TIME_AS_OF"
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
