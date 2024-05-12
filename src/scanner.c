// The MIT License (MIT)
// Copyright (c) 2016 Max Brunsfeld
// https://github.com/tree-sitter/tree-sitter-python/blob/master/LICENSE
//
// This file is forked from: https://github.com/tree-sitter/tree-sitter-python

#include "tree_sitter/array.h"
#include "tree_sitter/parser.h"
#include <assert.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

enum TokenType {
    STRING_START,
    STRING_CONTENT,
    STRING_END,
};

typedef enum {
    SingleQuote = 1 << 0,
    DoubleQuote = 1 << 1,
    BackQuote = 1 << 2,
    Raw = 1 << 3,
    Triple = 1 << 5,
    Bytes = 1 << 6,
} Flags;

typedef struct {
    char flags;
} Delimiter;

static inline Delimiter new_delimiter() { return (Delimiter){0}; }

static inline bool is_raw(Delimiter *delimiter) {
    return delimiter->flags & Raw;
}

static inline bool is_triple(Delimiter *delimiter) {
    return delimiter->flags & Triple;
}

static inline bool is_bytes(Delimiter *delimiter) {
    return delimiter->flags & Bytes;
}

static inline int32_t end_character(Delimiter *delimiter) {
    if (delimiter->flags & SingleQuote)
        return '\'';
    if (delimiter->flags & DoubleQuote)
        return '"';
    return 0;
}

static inline void set_raw(Delimiter *delimiter) { delimiter->flags |= Raw; }

static inline void set_triple(Delimiter *delimiter) {
    delimiter->flags |= Triple;
}

static inline void set_bytes(Delimiter *delimiter) {
    delimiter->flags |= Bytes;
}

static inline void set_end_character(Delimiter *delimiter, int32_t character) {
    switch (character) {
    case '\'':
        delimiter->flags |= SingleQuote;
        break;
    case '"':
        delimiter->flags |= DoubleQuote;
        break;
    default:
        assert(false);
    }
}

typedef struct {
    Array(uint16_t) indents;
    Array(Delimiter) delimiters;
} Scanner;

static inline void advance(TSLexer *lexer) { lexer->advance(lexer, false); }

static inline void skip(TSLexer *lexer) { lexer->advance(lexer, true); }

bool tree_sitter_sql_bigquery_external_scanner_scan(void *payload,
                                                    TSLexer *lexer,
                                                    const bool *valid_symbols) {
    Scanner *scanner = (Scanner *)payload;

    if (valid_symbols[STRING_CONTENT] && scanner->delimiters.size > 0) {
        Delimiter *delimiter = array_back(&scanner->delimiters);
        int32_t end_char = end_character(delimiter);
        bool has_content = false;

        while (lexer->lookahead) {

            if (lexer->lookahead == end_char) {
                if (is_triple(delimiter)) {
                    lexer->mark_end(lexer);
                    advance(lexer);
                    if (lexer->lookahead == end_char) {
                        advance(lexer);
                        if (lexer->lookahead == end_char) {
                            if (has_content) {
                                lexer->result_symbol = STRING_CONTENT;
                            } else {
                                advance(lexer);
                                lexer->mark_end(lexer);
                                array_pop(&scanner->delimiters);
                                lexer->result_symbol = STRING_END;
                            }
                            return true;
                        } else {
                            lexer->mark_end(lexer);
                            lexer->result_symbol = STRING_CONTENT;
                            return true;
                        }
                    } else {
                        lexer->mark_end(lexer);
                        lexer->result_symbol = STRING_CONTENT;
                        return true;
                    }
                } else {
                    if (has_content) {
                        lexer->result_symbol = STRING_CONTENT;
                    } else {
                        advance(lexer);
                        array_pop(&scanner->delimiters);
                        lexer->result_symbol = STRING_END;
                    }
                    lexer->mark_end(lexer);
                    return true;
                }
            } else if (lexer->lookahead == '\n' && has_content &&
                       !is_triple(delimiter)) {
                return false;
            }
            advance(lexer);
            has_content = true;
        }
    }

    lexer->mark_end(lexer);

    bool found_end_of_line = false;
    uint32_t indent_length = 0;
    while (true) {
        if (lexer->lookahead == '\n') {
            found_end_of_line = true;
            indent_length = 0;
            skip(lexer);
        } else if (lexer->lookahead == ' ') {
            indent_length++;
            skip(lexer);
        } else if (lexer->lookahead == '\r') {
            indent_length = 0;
            skip(lexer);
        } else if (lexer->lookahead == '\t') {
            indent_length += 8;
            skip(lexer);
        } else if (lexer->lookahead == '#') {
            while (lexer->lookahead && lexer->lookahead != '\n') {
                skip(lexer);
            }
            skip(lexer);
            indent_length = 0;
        } else if (lexer->lookahead == '\\') {
            skip(lexer);
            if (lexer->lookahead == '\r') {
                skip(lexer);
            }
            if (lexer->lookahead == '\n' || lexer->eof(lexer)) {
                skip(lexer);
            } else {
                return false;
            }
        } else if (lexer->eof(lexer)) {
            indent_length = 0;
            found_end_of_line = true;
            break;
        } else {
            break;
        }
    }

    if (valid_symbols[STRING_START]) {
        Delimiter delimiter = new_delimiter();

        bool has_flags = false;
        while (lexer->lookahead) {

            if (lexer->lookahead == 'r' || lexer->lookahead == 'R') {
                set_raw(&delimiter);
            } else if (lexer->lookahead == 'b' || lexer->lookahead == 'B') {
                set_bytes(&delimiter);
            } else {
                break;
            }
            has_flags = true;
            advance(lexer);
        }

        if (lexer->lookahead == '\'') {
            set_end_character(&delimiter, '\'');
            advance(lexer);
            lexer->mark_end(lexer);
            if (lexer->lookahead == '\'') {
                advance(lexer);
                if (lexer->lookahead == '\'') {
                    advance(lexer);
                    lexer->mark_end(lexer);
                    set_triple(&delimiter);
                }
            }
        } else if (lexer->lookahead == '"') {
            set_end_character(&delimiter, '"');
            advance(lexer);
            lexer->mark_end(lexer);
            if (lexer->lookahead == '"') {
                advance(lexer);
                if (lexer->lookahead == '"') {
                    advance(lexer);
                    lexer->mark_end(lexer);
                    set_triple(&delimiter);
                }
            }
        }

        if (end_character(&delimiter)) {
            array_push(&scanner->delimiters, delimiter);
            lexer->result_symbol = STRING_START;
            return true;
        }
        if (has_flags) {
            return false;
        }
    }

    return false;
}

unsigned tree_sitter_sql_bigquery_external_scanner_serialize(void *payload,
                                                             char *buffer) {
    Scanner *scanner = (Scanner *)payload;

    size_t size = 0;

    size_t delimiter_count = scanner->delimiters.size;
    if (delimiter_count > UINT8_MAX) {
        delimiter_count = UINT8_MAX;
    }
    buffer[size++] = (char)delimiter_count;

    if (delimiter_count > 0) {
        memcpy(&buffer[size], scanner->delimiters.contents, delimiter_count);
    }
    size += delimiter_count;

    uint32_t iter = 1;
    for (; iter < scanner->indents.size &&
           size < TREE_SITTER_SERIALIZATION_BUFFER_SIZE;
         ++iter) {
        buffer[size++] = (char)*array_get(&scanner->indents, iter);
    }

    return size;
}

void tree_sitter_sql_bigquery_external_scanner_deserialize(void *payload,
                                                           const char *buffer,
                                                           unsigned length) {
    Scanner *scanner = (Scanner *)payload;

    array_delete(&scanner->delimiters);
    array_delete(&scanner->indents);
    array_push(&scanner->indents, 0);

    if (length > 0) {
        size_t size = 0;

        size_t delimiter_count = (uint8_t)buffer[size++];
        if (delimiter_count > 0) {
            array_reserve(&scanner->delimiters, delimiter_count);
            scanner->delimiters.size = delimiter_count;
            memcpy(scanner->delimiters.contents, &buffer[size],
                   delimiter_count);
            size += delimiter_count;
        }

        for (; size < length; size++) {
            array_push(&scanner->indents, (unsigned char)buffer[size]);
        }
    }
}

void *tree_sitter_sql_bigquery_external_scanner_create() {
#if defined(__STDC_VERSION__) && (__STDC_VERSION__ >= 201112L)
    _Static_assert(sizeof(Delimiter) == sizeof(char), "");
#else
    assert(sizeof(Delimiter) == sizeof(char));
#endif
    Scanner *scanner = calloc(1, sizeof(Scanner));
    array_init(&scanner->indents);
    array_init(&scanner->delimiters);
    tree_sitter_sql_bigquery_external_scanner_deserialize(scanner, NULL, 0);
    return scanner;
}

void tree_sitter_sql_bigquery_external_scanner_destroy(void *payload) {
    Scanner *scanner = (Scanner *)payload;
    array_delete(&scanner->indents);
    array_delete(&scanner->delimiters);
    free(scanner);
}
