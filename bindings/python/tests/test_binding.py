import unittest

from tree_sitter import Language, Parser
import tree_sitter_sql_bigquery as tssql

class TestTS(unittest.TestCase):
    def test_binding(self):
        language = Language(tssql.language())
        assert language is not None
