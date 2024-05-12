from tree_sitter import Language, Parser
import tree_sitter_sql_bigquery as tssql

def test_binding():
    SQL_LANGUAGE = Language(ts_sql_bigquery.language(), "sql")
    assert language is not None
