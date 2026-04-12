# COMMON EXAM RULES — SHARED CONTRACT

These rules apply to every supported course.

## 1. Output Discipline
- Output ONLY:
  1. one markdown code block labeled `json` whose contents are a JSON array
- Do not add any preamble.
- Do not add any postamble.
- Stop immediately after the closing code fence.
- Do not output a visible `<scratchpad>` block.
- Do all reasoning, solving, and validation privately before emitting the final JSON.

## 2. Difficulty Enforcement
- Generate questions ONLY at the exact requested difficulty.
- Every question object MUST use the exact requested difficulty string in `"difficulty"`.
- Do not mix easier or harder questions.

## 3. JSON Schema
Each question object must contain exactly these fields:
- `id`
- `type`
- `subject`
- `difficulty`
- `question`
- `options`
- `correctAnswer`
- `python_drawer`
- `solution`
- `explanation`

## 3.1 Root Shape
- The root JSON value must be an array: `[ ... ]`
- Do not output an object with top-level metadata.
- The final output must be parseable by this project's `parseViewerJson()` function, which expects an array.

## 4. Type Rules
- `id` may be a unique string or integer.
- `"type"` must be exactly `"multiple-choice"` or `"open-ended"`.
- `"subject"` must be a non-empty string because the app uses it for badges, titles, and follow-up prompts.
- For `"multiple-choice"`:
  - `options` must contain exactly 4 strings.
  - `correctAnswer` must be an integer `0`, `1`, `2`, or `3`.
- For `"open-ended"`:
  - `options` must be `[]`.
  - `correctAnswer` must be `null`.

## 5. Viewer Compatibility
- NEVER output a `diagram` field.
- NEVER output nested diagram data such as `{ "diagram": { "python_drawer": "..." } }`.
- Use top-level `"python_drawer": "..." | null`.
- If `python_drawer` is present, it must contain viewer-compatible Python that returns an SVG string as its final expression.

## 6. LaTeX and RTL Safety
- Every backslash in JSON LaTeX must be double-escaped.
- Wrap mathematical expressions inside Hebrew text with `$...$`.
- Use `$$...$$` for standalone display equations only when needed.
- Do not wrap math with Markdown backticks.
- Do not output raw variables or formulas as plain Hebrew text.

## 7. Open-Ended Formatting
- Use `<br><br>` for gentle spacing only when needed.
- Do not use `<hr>` inside question text.
- Do not create a thematic divider line inside an open-ended question because `<hr>` represents a thematic break, while `<br>` is only a line break.
- Keep multi-part open-ended wording in one continuous readable block.
- Prefer explicit inline section labels such as:
  - `א.`
  - `ב.`
  - `ג.`
- Do not split one question into visually separated sub-documents.
- Keep the wording precise and readable in Hebrew.

## 8. Dense Interval Formatting Rule
- When listing multiple regions or intervals inside a sentence, format them in a visually grouped way.
- Prefer grouped notation such as:
  `($r<a$), ($a<r<b$), ($b<r<c$), ($r>c$)`
- Do not scatter dense interval lists across broken lines unless the frontend layout requires it.
- Keep interval lists compact and easy to scan.

## 9. Python Drawer Runtime Contract
- The script runs inside browser Pyodide.
- Allowed imports depend on the subject file, but all scripts must obey these hard restrictions:
  - no filesystem access
  - no `config`
  - no external files
  - no OS access
  - no `plt.show()`
- The final expression of the script MUST evaluate to an SVG string.

## 10. Explanation Field
- `explanation` is mandatory.
- It should explain the key reasoning path briefly and clearly.
- It should not be fluff, filler, or generic encouragement.

## 11. Validation Rule
- Solve every question privately before output.
- Verify correctness, consistency, and answer matching before emitting the JSON block.
