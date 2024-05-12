package tree_sitter_sql_bigquery_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-sql_bigquery"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_sql_bigquery.Language())
	if language == nil {
		t.Errorf("Error loading SqlBigquery grammar")
	}
}
