package tree_sitter_sql_bigquery_test

import (
	"testing"

	tree_sitter_sql_bigquery "github.com/takegue/tree-sitter-sql-bigquery/bindings/go"
	tree_sitter "github.com/tree-sitter/go-tree-sitter"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_sql_bigquery.Language())
	if language == nil {
		t.Errorf("Error loading SqlBigquery grammar")
	}
}
