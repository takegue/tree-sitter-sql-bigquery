/* eslint-disable no-unused-vars */

const multiplicative_operators = ["*", "/", "||"],
  shift_operators = ["<<", ">>"],
  comparative_operators = ["<", "<=", "<>", "=", ">", ">=", "!="],
  additive_operators = ["+", "-"],
  unary_operators = ["~", "+", "-"],
  unquoted_identifier = (_) => /[_a-zA-Z][_a-zA-Z0-9]*/,
  quoted_identifier = (_) => /`[a-zA-Z0-9._-]+`/;

module.exports = grammar({
  name: "sql_bigquery",
  extras: ($) => [/\s\n/, /\s/, $.comment, /[\s\f\uFEFF\u2060\u200B]|\\\r?\n/],

  // Reference:
  //   Operator Precedence: https://cloud.google.com/bigquery/docs/reference/standard-sql/operators#operator_precedence
  precedences: ($) => [
    [
      "unary_exp",
      "binary_times",
      "binary_plus",
      "binary_bitwise_shift",
      "binary_bitwise_and",
      "binary_bitwise_xor",
      "binary_bitwise_or",
      "operator_compare",
      "binary_relation",
      "binary_concat",
      "binary_and",
      "binary_or",
      "unary_not",
      "clause_connective",
    ],
  ],
  conflicts: ($) => [[$.query_expr]],

  word: ($) => $._unquoted_identifier,
  rules: {
    source_file: ($) => repeat($._statement),

    /**************************************************************************
     *                              Keywords
     ***************************************************************************/

    keyword_if_not_exists: (_) => kw("IF NOT EXISTS"),
    keyword_temporary: (_) => choice(kw("TEMP"), kw("TEMPORARY")),
    keyword_replace: (_) => kw("OR REPLACE"),
    _keyword_delete: (_) => kw("DELETE"),
    _keyword_begin: (_) => kw("BEGIN"),
    _keyword_end: (_) => kw("END"),
    _keyword_struct: (_) => kw("STRUCT"),
    _keyword_array: (_) => kw("ARRAY"),
    _keyword_returns: (_) => kw("RETURNS"),
    _keyword_between: (_) => kw("BETWEEN"),
    _keyword_case: (_) => kw("CASE"),
    _keyword_when: (_) => kw("WHEN"),
    _keyword_then: (_) => kw("THEN"),
    _keyword_else: (_) => kw("ELSE"),
    _keyword_is: (_) => kw("IS"),
    _keyword_in: (_) => kw("IN"),
    _keyword_not: (_) => kw("NOT"),
    _keyword_and: (_) => kw("AND"),
    _keyword_or: (_) => kw("OR"),
    _keyword_like: (_) => kw("LIKE"),
    _keyword_as: (_) => kw("AS"),

    /**************************************************************************
     *                              Statements
     ***************************************************************************/

    _statement: ($) =>
      seq(
        choice(
          $.create_schema_statement,
          $.create_table_statement,
          $.create_function_statement,
          $.query_statement,
          $.insert_statement,
          $.delete_statement,
          $.truncate_statement,
          $.update_statement,
          $.merge_statement
        ),
        optional(";")
      ),

    /*********************************************************************************
     *  DDL Statement
     *******************************************************************************/
    create_schema_statement: ($) =>
      seq(
        kw("CREATE SCHEMA"),
        optional($.keyword_if_not_exists),
        field("name", $.identifier),
        optional($.option_list)
      ),
    create_table_statement: ($) =>
      prec.right(
        seq(
          kw("CREATE"),
          optional($.keyword_replace),
          optional($.keyword_temporary),
          choice(kw("TABLE"), kw("VIEW"), kw("MATERIALIZED VIEW")),
          optional($.keyword_if_not_exists),
          field("name", $.identifier),
          optional($.create_table_parameters),
          optional($.table_partition_clause),
          optional($.table_cluster_clause),
          optional($.option_list),
          optional(seq($._keyword_as, $.query_statement))
        )
      ),

    create_table_parameters: ($) =>
      seq("(", commaSep1($.column_definition), ")"),
    option_item: ($) =>
      seq(field("key", $.identifier), "=", field("value", $._literal)),
    option_list: ($) =>
      seq(token(kw("OPTIONS")), "(", optional(sep1($.option_item, ",")), ")"),

    column_definition: ($) =>
      seq(
        field("name", $.identifier),
        field("type", $.column_type),
        optional(field("option", $.option_list))
      ),
    column_type: ($) =>
      choice(
        $._column_definition_type_array,
        $._unquoted_identifier,
        $._column_definition_type_struct
      ),
    _column_definition_type_array: ($) =>
      seq(
        $._keyword_array,
        "<",
        choice($._unquoted_identifier, $._column_definition_type_struct),
        ">"
      ),
    _column_definition_type_struct: ($) =>
      seq($._keyword_struct, "<", commaSep1($.column_definition, ","), ">"),

    partition_expression: ($) =>
      choice(
        kw("_PARTITIONDATE"),
        seq(kw("DATE"), "(", choice(kw("_PARTITIONTIME"), $.identifier), ")"),
        $.identifier,
        seq(
          choice(kw("DATETIME_TRUNC"), kw("TIMESTAMP_TRUNC"), kw("DATE_TRUNC")),
          "(",
          $.identifier,
          choice(kw("DAY"), kw("HOUR"), kw("HOUR"), kw("MONTH"), kw("YEAR")),
          ")"
        ),
        seq(
          kw("RANGE_BUCKET"),
          $.identifier,
          kw("GENERATE_ARRAY"),
          "(",
          commaSep1($._expression),
          ")"
        )
      ),
    table_partition_clause: ($) =>
      seq(kw("PARTITION BY"), $.partition_expression),
    table_cluster_clause: ($) =>
      seq(kw("CLUSTER BY"), sep1($._expression, ",")),

    create_function_statement: ($) =>
      prec.left(
        seq(
          kw("CREATE"),
          optional($.keyword_replace),
          optional($.keyword_temporary),
          kw("FUNCTION"),
          optional($.keyword_if_not_exists),
          field("name", $.identifier),
          $.create_function_parameters,
          optional($.option_list),
          choice(
            // SQL UDF
            seq(
              optional(alias(seq($._keyword_returns, $._type), "$.returns")),
              $._keyword_as,
              "(",
              choice($._expression),
              ")"
            ),
            // Javascript UDF
            seq(
              alias(seq($._keyword_returns, $._type), "$.returns"),
              $._function_language,
              $._keyword_as,
              $.string
            )
          )
        )
      ),

    create_table_function_function_statement: ($) =>
      prec.left(
        seq(
          kw("CREATE"),
          optional($.keyword_replace),
          kw("TABLE FUNCTION"),
          optional($.keyword_if_not_exists),
          field("name", $.identifier),
          alias(
            $.create_function_parameters,
            "$.create_table_function_parameters"
          ),
          optional($.column_type),
          optional($.option_list),
          seq(
            optional(
              alias(
                seq($._keyword_returns, kw("TABLE"), $.column_definition),
                "$.returns"
              )
            ),
            $._keyword_as,
            "(",
            choice(seq($._keyword_as, $.query_statement)),
            ")"
          )
        )
      ),

    create_function_parameters: ($) =>
      seq("(", commaSep1($.column_definition), ")"),
    _function_language: ($) =>
      seq(kw("LANGUAGE"), alias($._unquoted_identifier, $.language)),
    create_function_parameter: ($) =>
      seq(optional($.identifier), choice($._type)),
    create_function_parameters: ($) =>
      seq("(", commaSep1($.create_function_parameter), ")"),
    function_body: ($) =>
      seq(
        $._keyword_as,
        choice(
          seq("$$", $.query_statement, optional(";"), "$$"),
          seq("'", $.query_statement, optional(";"), "'")
        )
      ),

    /*********************************************************************************
     *  Query Statement
     *******************************************************************************/
    query_statement: ($) => $.query_expr,
    set_operation: ($) =>
      prec.right(
        seq(
          $.query_expr,
          field(
            "operator",
            choice(
              kw("UNION ALL"),
              kw("UNION DISTINCT"),
              kw("INTERSECT DISTINCT"),
              kw("EXCEPT DISTINCT")
            )
          ),
          $.query_expr
        )
      ),
    query_expr: ($) =>
      prec(
        10,
        seq(
          optional($.cte_clause),
          choice($.select, seq("(", $.query_expr, ")"), $.set_operation),
          optional($.order_by_clause),
          optional($.limit_clause)
        )
      ),
    select: ($) =>
      seq(
        kw("SELECT"),
        optional(choice("ALL", "DISTINCT")),
        optional(seq($._keyword_as, choice("STRUCT", "VALUE"))),
        $.select_list,
        optional($.from_clause),
        optional($.where_clause),
        optional($.group_by_clause),
        optional($.having_clause),
        optional($.qualify_clause)
      ),

    select_list: ($) =>
      prec.left(commaSep1(choice($.select_all, $._aliasable_expression))),
    select_all: ($) =>
      prec.right(
        seq(
          seq($.asterisk_expression),
          optional(
            seq(
              kw("EXCEPT"),
              "(",
              commaSep1(field("except_key", $.identifier)),
              ")"
            )
          ),
          optional(
            seq(
              kw("REPLACE"),
              "(",
              commaSep1(field("replace_exp", seq($._expression, $.as_alias))),
              ")"
            )
          )
        )
      ),
    select_expr: ($) => seq($._expression, $.as_alias),
    having_clause: ($) => seq(kw("HAVING"), $._expression),
    qualify_clause: ($) => seq(kw("QUALIFY"), $._expression),
    limit_clause: ($) =>
      seq(kw("LIMIT"), $._integer, optional(seq(kw("OFFSET"), $._integer))),
    group_by_clause_body: ($) => commaSep1($._expression),
    group_by_clause: ($) =>
      seq(
        kw("GROUP BY"),
        choice(
          $.group_by_clause_body,
          seq(kw("ROLLUP"), "(", $.group_by_clause_body, ")")
        )
      ),
    window_specification: ($) =>
      seq(
        $.identifier,
        optional(kw("PARTITION BY")),
        optional($.order_by_clause)
      ),
    named_window_expression: ($) =>
      seq(
        $.identifier,
        $._keyword_as,
        choice($.identifier, $.window_specification)
      ),
    window_clause: ($) => seq(kw("WINDOW"), $.named_window_expression),
    order_by_clause_body: ($) =>
      commaSep1(seq($._expression, optional($._direction_keywords))),
    _direction_keywords: (_) => field("order", choice(kw("ASC"), kw("DESC"))),
    order_by_clause: ($) => seq(kw("ORDER BY"), $.order_by_clause_body),
    where_clause: ($) => seq(kw("WHERE"), $._expression),
    _aliased_expression: ($) =>
      seq($._expression, optional($._keyword_as), $.identifier),
    _aliasable_expression: ($) =>
      choice($._expression, alias($._aliased_expression, $.alias)),

    as_alias: ($) =>
      seq(optional($._keyword_as), field("alias_name", $.identifier)),

    cte_clause: ($) =>
      seq(
        kw("WITH"),
        commaSep1(seq($.identifier, $._keyword_as, "(", $.query_expr, ")"))
      ),
    from_clause: ($) =>
      seq(
        kw("FROM"),
        seq(
          $.from_item,
          optional(choice($.pivot_operator, $.unpivot_operator)),
          optional($.tablesample_operator)
        )
      ),
    pivot_value: ($) => seq($.function_call, optional($.as_alias)),
    pivot_operator: ($) =>
      seq(
        kw("PIVOT"),
        "(",
        commaSep1($.pivot_value),
        kw("FOR"),
        alias($.identifier, $.input_column),
        kw("IN"),
        "(",
        commaSep1(alias($._aliasable_expression, $.pivot_column)),
        ")",
        ")",
        optional($.as_alias)
      ),
    unpivot_operator: ($) =>
      seq(
        kw("UNPIVOT"),
        optional(choice(kw("INCLUDE NULLS"), kw("EXCLUDE NULLS"))),
        "(",
        choice($.single_column_unpivot, $.multi_column_unpivot),
        ")",
        optional($.as_alias)
      ),
    single_column_unpivot: ($) =>
      seq(
        alias($.identifier, $.unpivot_value),
        kw("FOR"),
        alias($.identifier, $.name_column),
        kw("IN"),
        "(",
        commaSep1($.unpivot_column),
        ")"
      ),
    multi_column_unpivot: ($) =>
      prec.right(
        seq(
          "(",
          commaSep1(alias($.identifier, $.unpivot_value)),
          ")",
          kw("FOR"),
          alias($.identifier, $.name_column),
          kw("IN"),
          "(",
          commaSep1($.unpivot_column),
          ")"
        )
      ),
    unpivot_column: ($) =>
      seq(
        choice($.struct, $.identifier),
        optional(seq($._keyword_as, field("alias", $.string)))
      ),

    tablesample_operator: ($) =>
      seq(
        kw("TABLESAMPLE SYSTEM"),
        "(",
        field("sample_rate", choice($._integer, $.query_parameter)),
        kw("PERCENT"),
        ")"
      ),
    from_item: ($) =>
      seq(
        choice(
          seq(field("table_name", $.identifier), optional($.as_alias)),
          //TODO: add fucntion call subexpression
          seq($.select_subexpression, optional($.as_alias)),
          $.unnest_clause,
          $.join_operation,
          seq("(", $.join_operation, ")")
        )
      ),
    join_operation: ($) =>
      choice($._cross_join_operation, $._condition_join_operator),
    join_type: ($) =>
      seq(
        choice(
          kw("INNER"),
          seq(
            choice(kw("LEFT"), kw("RIGHT"), kw("FULL")),
            optional(kw("OUTER"))
          )
        )
      ),
    _cross_join_operation: ($) =>
      prec.left(
        "clause_connective",
        seq(
          $.from_item,
          field("operator", choice(kw("CROSS JOIN"), ",")),
          $.from_item
        )
      ),
    _condition_join_operator: ($) =>
      seq(
        $.from_item,
        optional($.join_type),
        kw("JOIN"),
        $.from_item,
        field(
          "join_condition",
          choice(
            seq(kw("ON"), $._expression),
            seq(kw("USING"), "(", repeat1(field("keys", $.identifier)), ")")
          )
        )
      ),

    select_subexpression: ($) => seq("(", $.query_statement, ")"),

    function_call: ($) =>
      // FIXME: precedence
      prec(
        10,
        seq(
          field("function", $.identifier),
          "(",
          optional(
            field(
              "arguments",
              commaSep1(choice($._expression, $.asterisk_expression))
            )
          ),
          ")"
        )
      ),

    unnest_operator: ($) =>
      choice(
        seq(kw("UNNEST"), "(", $.array, ")"),
        seq(kw("UNNEST"), "(", $._identifier, ")"),
        seq(kw("UNNEST"), "(", $.function_call, ")")
      ),
    unnest_clause: ($) =>
      prec.right(
        50,
        seq(
          $.unnest_operator,
          optional(seq($._keyword_as, $.identifier)),
          optional($.unnest_withoffset)
        )
      ),
    unnest_withoffset: ($) =>
      prec.left(
        2,
        seq(kw("WITH OFFSET"), optional(seq($._keyword_as, $._identifier)))
      ),

    /*********************************************************************************
     *  DML Statement
     *******************************************************************************/

    // INSERT
    insert_statement: ($) =>
      seq(
        kw("INSERT"),
        optional(kw("INTO")),
        field("table_name", $.identifier),
        optional($.insert_columns),
        $.values_clause
      ),
    insert_columns: ($) => seq("(", commaSep1($.identifier), ")"),
    values_clause: ($) =>
      choice(seq(kw("VALUES"), commaSep1($.value_element)), $.query_statement),
    value_element: ($) => seq("(", commaSep1($._expression), ")"),

    // DELETE
    delete_statement: ($) =>
      seq(
        $._keyword_delete,
        optional(kw("FROM")),
        field("table_name", $.identifier),
        optional($.as_alias),
        $.where_clause
      ),

    // TRUNCATE
    truncate_statement: ($) =>
      seq(kw("TRUNCATE TABLE"), field("table_name", $.identifier)),

    // UPDATE
    update_statement: ($) =>
      seq(
        kw("UPDATE"),
        field("table_name", $.identifier),
        optional($.as_alias),
        $.set_clause,
        optional($.from_clause),
        $.where_clause
      ),

    set_clause: ($) => seq(kw("SET"), commaSep1($.update_item)),
    update_item: ($) => $._assigment_expression,
    _assigment_expression: ($) => seq($.identifier, "=", $._expression),

    // MERGE statement
    merge_statement: ($) =>
      seq(
        kw("MERGE"),
        optional(kw("INTO")),
        field("table_name", $.identifier),
        optional($.as_alias),
        kw("USING"),
        choice(
          seq(field("source_name", $.identifier), optional($.as_alias)),
          seq($.select_subexpression, optional($.as_alias))
        ),
        optional($.as_alias),
        kw("ON"),
        alias($._expression, $.merge_condition),
        repeat1(
          choice(
            $.merge_matched_clause,
            $.merge_not_matched_by_target_clause,
            $.merge_not_matched_by_source_clause
          )
        )
      ),
    merge_matched_clause: ($) =>
      choice(
        seq(
          kw("WHEN MATCHED"),
          optional(
            seq($._keyword_and, alias($._expression, $.search_condition))
          ),
          kw("THEN"),
          choice($.merge_update_clause, $.merge_delete_clause)
        )
      ),
    merge_not_matched_by_target_clause: ($) =>
      seq(
        kw("WHEN NOT MATCHED"),
        optional(kw("BY TARGET")),
        optional(seq($._keyword_and, alias($._expression, $.search_condition))),
        kw("THEN"),
        choice($.merge_insert_clause)
      ),
    merge_not_matched_by_source_clause: ($) =>
      choice(
        seq(
          kw("WHEN NOT MATCHED BY SOURCE"),
          optional(
            seq($._keyword_and, alias($._expression, $.search_condition))
          ),
          kw("THEN"),
          choice($.merge_update_clause, $.merge_delete_clause)
        )
      ),
    merge_update_clause: ($) => seq(kw("UPDATE SET"), commaSep1($.update_item)),
    merge_delete_clause: ($) => $._keyword_delete,
    merge_insert_clause: ($) =>
      seq(
        kw("INSERT"),
        optional($.insert_columns),
        choice($.values_clause, kw("ROW"))
      ),

    insert_columns: ($) => seq("(", commaSep1($.identifier), ")"),

    /* *******************************************************************
     *                           Literals
     * ********************************************************************/
    _literal: ($) =>
      choice(
        $.query_parameter,
        $.array,
        $.struct,
        $.interval,
        $.time,
        $.string,
        $.TRUE,
        $.FALSE,
        $.NULL,
        $.number
      ),
    NULL: (_) => kw("NULL"),
    TRUE: (_) => kw("TRUE"),
    FALSE: (_) => kw("FALSE"),
    _integer: (_) => /[-+]?\d+/,
    _float: ($) =>
      choice(
        /[-+]?\d+\.(\d*)([eE][+-]?\d+)?/,
        /(\d+)?\.\d+([eE][+-]?\d+)?/,
        /\d+[eE][+-]?\d+/
      ),
    _float_or_integer: ($) => choice($._integer, $._float),
    numeric: ($) =>
      seq(
        choice(
          kw("NUMERIC"),
          kw("BIGNUMERIC"),
          kw("DECIMAL"),
          kw("BIGDECIMAL")
        ),
        choice(
          seq("'", $._float_or_integer, "'"),
          seq('"', $._float_or_integer, '"')
        )
      ),
    _number: ($) => choice($._integer, $._float, $.numeric),
    interval: ($) => seq(
        kw("INTERVAL"), $.string, alias($._unquoted_identifier, $.datetime_part),
        optional(seq(kw('TO'), alias($._unquoted_identifier, $.datetime_part)))
      ),
    time: ($) =>
      seq(
        choice(kw("DATE"), kw("TIME"), kw("DATETIME"), kw("TIMESTAMP")),
        $.string
      ),
    number: ($) => $._number,
    query_parameter: ($) =>
      choice($._named_query_parameter, $._positional_query_parameter),
    _named_query_parameter: (_) => /@+[_a-zA-Z][_a-zA-Z0-9]*/,
    _positional_query_parameter: (_) => /\?/,
    _type_struct: ($) =>
      seq(
        kw("STRUCT"),
        optional(
          seq(
            "<",
            commaSep1(
              seq(
                optional(/[a-zA-Z0-9]+/),
                choice(/[a-zA-Z0-9]+/, $._type_struct)
              )
            ),
            ">"
          )
        )
      ),
    _type_array: ($) =>
      seq(
        kw("ARRAY"),
        optional(seq("<", choice($._type_struct, $._unquoted_identifier), ">"))
      ),
    array: ($) =>
      seq(optional($._type_array), "[", optional(commaSep1($._literal)), "]"),
    struct: ($) =>
      seq(
        optional($._type_struct),
        "(",
        commaSep1($._aliasable_expression),
        ")"
      ),
    _unquoted_identifier: unquoted_identifier,
    _quoted_identifier: quoted_identifier,
    _identifier: ($) => choice($._quoted_identifier, $._unquoted_identifier),
    _dotted_identifier: ($) => seq($._identifier, token.immediate(".")),
    identifier: ($) =>
      prec.right(seq(repeat($._dotted_identifier), $._identifier)),
    type: ($) => seq($.identifier, optional(seq("(", $.number, ")"))),
    string: ($) =>
      alias(
        choice(
          seq(/[bB]?[rR]?'/, /[^']*/, "'"),
          seq(/[bB]?[rR]?"/, /[^"]*/, '"'),
          seq(/[bB]?[rR]?'''/, /[^']+/, "'''"), // FIXME: single quote included multi-line text
          seq(/[bB]?[rR]?"""/, /[^"]+/, '"""') // FIXME double quote included multi-line text
        ),
        "_string"
      ),
    ordered_expression: ($) => seq($._expression, $._direction_keywords),
    array_type: ($) => seq($._type, "[", "]"),
    _type: ($) => choice($.type, $.array_type),

    // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
    comment: ($) =>
      token(
        choice(
          seq("#", /.*/),
          seq("--", /.*/),
          seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")
        )
      ),

    /* *******************************************************************
     *                           Operators
     * ********************************************************************/
    _expression: ($) =>
      choice(
        $.unary_expression,
        $.conditional_expression,
        prec(1, $._literal),
        $.function_call,
        $.identifier,
        $.unnest_clause,
        $._parenthesized_expression,
        $.binary_expression,
        $.array_element_access,
        $.argument_reference,
        $.select_subexpression
      ),

    _parenthesized_expression: ($) => prec(20, seq("(", $._expression, ")")),
    array_element_access: ($) =>
      seq(choice($.identifier, $.argument_reference), "[", $._expression, "]"),

    unary_expression: ($) =>
      choice(
        prec.left(
          "unary_not",
          seq(field("operator", $._keyword_not), field("value", $._expression))
        ),
        prec.left(
          "unary_exp",
          seq(field("operator", choice(...unary_operators)), $._expression)
        ),
        prec.left(
          "unary_exp",
          seq(field("operator", kw("EXISTS")), $.select_subexpression)
        ),
        prec.left(
          "operator_compare",
          seq(
            $._expression,
            $._keyword_is,
            optional($._keyword_not),
            choice($.NULL, $.TRUE, $.FALSE)
          )
        )
      ),
    casewhen_clause: ($) =>
      seq(
        $._keyword_when,
        field("match_condition", $._expression),
        $._keyword_then,
        field("match_result", $._expression)
      ),
    caseelse_clause: ($) =>
      seq($._keyword_else, field("else_result", $._expression)),
    conditional_expression: ($) =>
      choice(
        prec.left(
          "operator_compare",
          seq(
            field("exp1", $._expression),
            optional($._keyword_not),
            field("operator", $._keyword_between),
            field("exp2", $._expression),
            $._keyword_and,
            field("exp3", $._expression)
          )
        ),
        prec.left(
          "clause_connective",
          seq(
            $._keyword_case,
            optional(field("expr", $._expression)),
            repeat1($.casewhen_clause),
            optional($.caseelse_clause),
            $._keyword_end
          )
        )
      ),
    binary_expression: ($) => {
      const table = [
        ["binary_times", choice(...multiplicative_operators)],
        ["binary_plus", choice(...additive_operators)],
        ["operator_compare", choice(...comparative_operators)],
        ["binary_bitwise_shift", choice(...shift_operators)],
        ["binary_bitwise_and", "&"],
        ["binary_bitwise_xor", "^"],
        ["binary_bitwise_or", "|"],
        ["binary_and", $._keyword_and],
        ["binary_or", $._keyword_or],
        ["operator_compare", seq(optional($._keyword_not), $._keyword_in)],
        ["operator_compare", seq(optional($._keyword_not), $._keyword_like)],
        [
          "operator_compare",
          seq($._keyword_is, optional($._keyword_not), kw("DISTINCT FROM")),
        ],
      ];

      return choice(
        ...table.map(([precedence, operator]) =>
          prec.left(
            precedence,
            seq(
              field("left", $._expression),
              field("operator", operator),
              field("right", $._expression)
            )
          )
        )
      );
    },

    asterisk_expression: ($) => seq(optional($._dotted_identifier), "*"),
    argument_reference: ($) => seq("$", /\d+/),
  },
});

// Generate case insentitive match for SQL keyword
// In case of multiple word keyword provide a seq matcher
function kw(keyword) {
  if (keyword.toUpperCase() != keyword) {
    throw new Error(`Expected upper case keyword got ${keyword}`);
  }
  const words = keyword.split(" ");
  const regExps = words.map(createCaseInsensitiveRegex);

  if (regExps.length == 1) {
    return alias(regExps[0], keyword);
  } else {
    return alias(seq(...regExps), keyword.replace(/ /g, "_"));
  }
}

function createOrReplace(item) {
  if (item.toUpperCase() != item) {
    throw new Error(`Expected upper case item got ${item}`);
  }
  return alias(
    seq(
      createCaseInsensitiveRegex("CREATE"),
      field("replace", optional(createCaseInsensitiveRegex("OR REPLACE"))),
      createCaseInsensitiveRegex(item)
    ),
    `CREATE_OR_REPLACE_${item}`
  );
}

function createCaseInsensitiveRegex(word) {
  return new RegExp(
    word
      .split("")
      .map((letter) => `[${letter.toLowerCase()}${letter.toUpperCase()}]`)
      .join("")
  );
}

function commaSep1(rule) {
  return sep1(rule, ",");
}

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

function sep2(rule, separator) {
  return seq(rule, repeat1(seq(separator, rule)));
}
