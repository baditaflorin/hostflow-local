# 0041 - Input robustness and normalization policy

## Status

Accepted

## Context

Host inputs arrive as pasted HTML, copied text, CSV exports, partial documents, and malformed data. Real CSV exports vary by delimiter, encoding, language, and decimal conventions.

## Decision

Normalize inputs at the boundary:

- Strip UTF-8 BOM.
- Normalize NBSP and smart whitespace to spaces.
- Normalize CRLF/CR line endings to LF.
- Sniff CSV delimiters among comma, semicolon, tab, and pipe.
- Preserve quoted CSV fields with embedded delimiters and newlines.
- Treat decimal commas as decimals only in locale-like numeric fields.
- Treat comma groups as thousands separators when followed by three digits.
- Keep raw input fingerprint for reproducibility.

## Consequences

- Parser behavior is deterministic and documented.
- Locale and encoding weirdness becomes testable.
- Inputs that still cannot be parsed produce typed recoverable errors.

## Alternatives Considered

- Keep v1 comma-only parsing: rejected because it fails normal European and export CSVs.
