(string) @string
(number) @number
(comment) @comment

; types
(struct) @type.builtin
(array) @type.builtin
(interval) @type.builtin
(type_identifier) @type.builtin

(type) @type.builtin
(identifier) @variable

(as_alias 
  alias_name: (identifier) @property) 

[
  ";"
  "."
] @punctuation.delimiter


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
 "OR"
 "OUTER"
 "OVER"
 "PRECEDING"
 "OR_REPLACE"
 "PARTITION_BY"
 "IF_NOT_EXISTS"
 "IF_EXISTS"
 "QUALIFY"
 "RANGE"
 "RIGHT"
 "ROLLUP"
 "ROWS"
 "SELECT"
 "SET"
 "THEN"
 "TO"
 "TRUE"
 "UNNEST"
 "USING"
 "WHEN"
 "WHERE"
 "WINDOW"
 "WITH"
] @keyword
