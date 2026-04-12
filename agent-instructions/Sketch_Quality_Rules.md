# SKETCH QUALITY RULES — SHARED DRAWING CONTRACT

These rules are mandatory for every subject that allows `python_drawer`.

This file does not define course content.
It defines when a sketch should be used, how it should be drawn, and how it must satisfy the viewer runtime contract.

---

## 1. Core Principle
A sketch is not decorative.

A sketch must materially improve the student's understanding of:
- geometry
- symmetry
- direction
- bounds
- region selection
- axis of rotation
- circuit layout
- other setup-critical structure

If a sketch does not materially improve clarity, use:

```json
"python_drawer": null
```

---

## 2. When To Draw
Use `python_drawer` only when at least one of the following is central to the problem:
- geometry
- symmetry
- direction
- region or bound selection
- axis of rotation
- shaded target area
- circuit topology
- spatial layout needed for reasoning

Do not generate a sketch merely because one is possible.

---

## 3. Null-First Safety Rule
If the model cannot confidently generate a clear, accurate, and viewer-compatible sketch, it must use:

```json
"python_drawer": null
```

A missing sketch is better than a misleading, cluttered, or broken sketch.

---

## 4. Template-First Rule
Prefer standard visual templates for recurring sketch types.

Do not improvise a custom free-form layout when a known visual pattern already exists.

Examples of standard template families include:
- Gaussian surface diagrams
- concentric sphere or cylinder diagrams
- parallel-plate capacitor diagrams
- standard circuit diagrams
- area-between-curves diagrams
- disk and washer-method diagrams
- shell-method diagrams
- polar-region diagrams
- parametric-curve diagrams

---

## 5. Monochrome-First Rule
- Default to black or grayscale for geometry, boundaries, axes, labels, Gaussian surfaces, shaded regions, and helper lines.
- Dark gray fill is allowed when it improves readability and does not create visual confusion.
- Do not use color for ordinary geometric distinction.
- Use color only when it materially helps distinguish physical vectors or forces, such as `$\\vec{F}$`, `$\\vec{B}$`, or `$\\vec{v}$`.
- If color is used for physical vectors, keep the rest of the sketch mostly black.

---

## 6. Shared Visual Quality Rules
Every generated sketch must be:
- clean
- centered
- uncluttered
- readable at normal viewer size
- tightly related to the question

Avoid:
- decorative elements
- unnecessary labels
- unnecessary arrows
- crowded text
- excessive shading
- legends unless absolutely necessary
- chart titles
- repeated helper objects that add no value

---

## 7. Layout Rules
- Keep the figure visually centered.
- Leave enough margin so labels are not clipped.
- Choose plot limits based on readability, not maximum coverage.
- Do not place labels directly on top of important lines, boundaries, or curves.
- Use whitespace intentionally so the important structure is easy to see.
- Keep the main object or region visually dominant.

---

## 8. Labeling Rules
- Label only quantities that help solve the problem.
- Keep labels short, standard, and readable.
- Place labels near the relevant object, but not on top of it.
- Spread labels so they do not collide.
- Do not overload the figure with symbolic detail already obvious from the question text.
- Do not restate the full mathematics of the solution inside the sketch.

---

## 9. Question Consistency Rule
- Labels, geometry, and marked directions must match the variable names and conventions used in the question text.
- Do not introduce symbols in the sketch that conflict with the wording of the question.
- Do not rename quantities between the question and the sketch.
- Do not add extra symbolic structure unless it is necessary for clarity.

---

## 10. Radius Helper Rule
- When a radius is part of the setup, draw it as a dashed helper segment from the center or axis to the relevant boundary.
- Every shown radius must end with a small arrowhead.
- Do not draw a radius as a plain line without an arrowhead.
- Place the radius label near the dashed segment without overlapping the boundary.
- If multiple radii appear in the problem, each one must be drawn as its own helper segment and labeled directly.

---

## 11. Named Radii Completeness Rule
- If the problem statement includes named radii such as `$a$`, `$b$`, `$r$`, `$R$`, `$R_1$`, or `$R_2$`, include all relevant named radii in the sketch when they are structurally important to the setup.
- Each named radius must be visually associated with the correct boundary or helper segment.
- Do not leave the identity of a named radius implicit.

---

## 12. Radius Label Binding Rule
- Every named radius must be labeled directly next to its own dashed helper segment.
- Do not place a radius label loosely in the figure.
- If multiple radii appear, each radius must have its own dashed helper segment, its own small arrowhead, and its own nearby label.
- The viewer should be able to tell immediately which helper segment corresponds to `$a$`, `$b$`, `$r$`, `$R$`, `$R_1$`, or `$R_2$`.

---

## 13. Axis Rules
- Show axes only when they help interpretation.
- Label axes only when axes are relevant to the setup.
- Do not include axes in purely schematic geometry unless they improve understanding.
- For coordinate-based plots, ensure the visible range supports the intended interpretation.

---

## 14. Aspect Ratio Rules
- Use equal aspect ratio for circular, radial, spherical, cylindrical, or otherwise geometry-sensitive figures.
- Do not distort shapes whose geometry matters.
- For curve plots, choose an aspect ratio that preserves readability of the target region.

---

## 15. Shading Rules
- Shade only the mathematically or physically relevant region.
- Keep shading visually subordinate to the main boundaries.
- Do not shade multiple regions unless the problem specifically requires comparison.
- Make the target region visually obvious.

---

## 16. Arrow Rules
- Use arrows only when direction matters.
- Every arrow must represent something meaningful, such as:
  - electric field
  - magnetic field
  - current direction
  - force direction
  - velocity direction
  - traversal direction
- Do not use decorative arrows.
- Prefer a small number of clear arrows over many tiny arrows.

---

## 17. Curve and Boundary Rules
- Main objects and boundaries should be visually clear.
- Distinguish helper geometry from primary geometry.
- Use dashed lines for auxiliary or conceptual objects when appropriate.
- Use solid lines for physical or mathematical boundaries unless subject-specific rules say otherwise.

---

## 18. Tool Selection Rule
- Use the simplest tool that best matches the sketch type.
- Prefer `schemdraw` for standard circuit diagrams.
- Prefer `matplotlib` for geometry, regions, curves, surfaces, and vector-based layouts.
- Do not use a more complex tool when a simpler one would produce a clearer result.

---

## 19. Runtime Contract
All sketches must obey the viewer runtime contract:
- no filesystem access
- no external files
- no OS access
- no `config`
- no `plt.show()`
- final expression must evaluate to an SVG string

---

## 20. SVG Return Validation Rule
- The final evaluated result of `python_drawer` must be a UTF-8 string containing valid SVG markup.
- The returned value must begin with `<svg` or with a valid XML declaration followed by `<svg`.
- Do not print explanatory text, debug text, markdown, or any non-SVG output.
- Do not return bytes.
- Return decoded SVG text only.
- Do not use `print(...)` as the final step of the script.
- If valid SVG cannot be produced confidently, use `"python_drawer": null`.

---

## 21. Matplotlib Export Rule
Every matplotlib-based sketch must end with logic equivalent to:

```python
import io
buf = io.BytesIO()
fig.savefig(buf, format='svg', bbox_inches='tight', transparent=True)
plt.close(fig)
buf.getvalue().decode('utf-8')
```

Requirements:
- `format='svg'`
- `bbox_inches='tight'`
- `transparent=True`
- close the figure
- final expression returns SVG text

---

## 22. Schemdraw Export Rule
Every schemdraw-based sketch must end with:

```python
d.get_imagedata('svg').decode('utf-8')
```

---

## 23. Radius Annotation Implementation Rule
- In matplotlib, prefer `annotate(..., arrowprops=...)` or an equivalent arrow-capable method for radius markers.
- A radius helper line should remain dashed even when a small arrowhead is added.
- The radius label should be placed adjacent to that same helper line so the correspondence is visually unambiguous.

---

## 24. Pre-Emission Sketch Checklist
Before emitting a sketch, verify privately:
- the sketch matches the question setup
- the important object or region is clearly visible
- labels are readable
- no labels are clipped
- no unnecessary elements are included
- the chosen tool fits the sketch type
- the final expression returns an SVG string
- the returned text starts with valid SVG markup
- every shown radius has a small arrowhead
- every named radius is explicitly identified

If any of these checks fail, use:

```json
"python_drawer": null
```

---

## 25. Role Of Subject Files
This file defines general drawing quality and runtime discipline only.

Subject-specific files define how recurring sketch types should look for that course.

Examples:
- Gaussian surfaces belong in `Physics2_Expert.md`
- shell and washer sketches belong in `Calculus2_Expert.md`
