# CALCULUS II EXPERT RULEBOOK
**Parent Documents:** `Common_Exam_Rules.md`, `Sketch_Quality_Rules.md`

These rules apply when the course is Calculus 2.

## 1. Scope
Focus on standard undergraduate Calculus II topics such as:
- techniques of integration
- improper integrals
- area between curves
- volumes of revolution
- disk, washer, and shell methods
- arc length and surface area when appropriate
- parametric curves
- polar coordinates
- sequences and series
- power series and Taylor series when requested or clearly in scope

## 2. Difficulty Guidance
- Easy:
  direct setup and execution using one familiar technique
- Medium:
  nontrivial setup, method selection, or multi-step geometric reasoning
- Hard:
  subtle setup, multi-concept integration, parameterized reasoning, convergence logic, or deeper structural understanding

## 3. Diagram Policy
- Use `python_drawer` when the sketch materially improves understanding.
- `python_drawer` is strongly recommended or mandatory for:
  - area between curves
  - bounded regions
  - volumes of revolution
  - disk method
  - washer method
  - shell method
  - polar curves
  - shaded polar regions
  - parametric curves when geometry matters
  - improper integrals with geometric interpretation
  - setup-heavy region/bounds questions
- Use `"python_drawer": null` for primarily symbolic questions such as:
  - straightforward integration by parts
  - standard partial fractions
  - routine trig substitution
  - purely algebraic sequence/series manipulation
  - convergence questions where a picture adds little value
- Follow `Sketch_Quality_Rules.md` for all shared drawing-quality and runtime constraints.
- If the sketch cannot be generated clearly and contract-safely, set `"python_drawer": null`.

## 4. What a Good Calc 2 Sketch Must Show
- Area between curves:
  - both curves
  - axes when relevant
  - intersection points or bounds
  - shaded target region
- Volume of revolution:
  - original region
  - axis of rotation
  - representative shell or washer when helpful
  - labels for radius or height if central to the problem
- Polar:
  - the polar curve shape
  - angle bounds when relevant
  - shaded enclosed region when area is asked
- Parametric:
  - the traced curve
  - key points or endpoints
  - direction of traversal when relevant

## 5. Calculus 2 Sketch Families And Visual Rules

### General Calculus Sketch Principle
A Calculus 2 sketch must clarify region, bounds, curve shape, axis of rotation, or geometric interpretation.
It should support setup selection, not decorate the question.

### Area Between Curves
- plot only the relevant curves
- keep the geometry mostly black or grayscale
- show the target bounded region clearly
- mark intersection points or bounds when relevant
- use light shading only for the target region
- do not add extra labels unrelated to the setup
- choose a plot range that makes the bounded region easy to read

### Bounded Region With Intersections
- show only the curves and bounds needed for the problem
- indicate the relevant intersection points if they drive the setup
- avoid plotting extra reference objects

### Disk Method
- show the original region clearly
- make the axis of rotation visually distinct
- include a single representative disk only when it helps method selection
- keep helper construction minimal

### Washer Method
- show the original region clearly
- make the axis of rotation visually distinct
- include a single representative washer only when useful
- make the inner and outer radii visually understandable
- if named radii are part of the setup, include them clearly

### Shell Method
- show the original region clearly
- make the axis of rotation visually distinct
- include a single representative shell only when useful
- make shell radius and shell height visually understandable
- do not clutter the figure with repeated shells

### Parametric Curves
- show the traced curve clearly
- mark key points or endpoints when relevant
- show direction of traversal only when it matters
- avoid unnecessary annotations

### Polar Curves
- choose a plot range that makes the curve shape readable
- show the target enclosed region clearly when area is requested
- indicate angle bounds when relevant
- do not add unnecessary grid detail unless it materially helps interpretation

### Improper Integral Geometry When Used
- include a sketch only if the geometric interpretation is genuinely helpful
- keep the visual focus on the relevant region or asymptotic behavior
- otherwise use `"python_drawer": null`

### Arc Length Or Surface-Area Geometry When Used
- include a sketch only if it helps clarify the path, region, or axis of rotation
- otherwise use `"python_drawer": null`

### Calculus 2 Sketch Rejection Rule
Set `"python_drawer": null` if:
- the problem is primarily symbolic
- the sketch does not materially improve setup clarity
- the region or geometry cannot be shown clearly in a simple figure
- the code would likely produce a cluttered or low-value sketch

## 6. Python Drawer Runtime
- Allowed imports:
  - `io`
  - `math`
  - `numpy`
  - `matplotlib`
  - `matplotlib.pyplot`
  - `matplotlib.patches`
- Forbidden:
  - `config`
  - filesystem paths
  - `plt.show()`
  - saving to disk

## 7. Required Matplotlib Export Pattern
Every matplotlib-based `python_drawer` must end with the equivalent of:

```python
import io
buf = io.BytesIO()
fig.savefig(buf, format='svg', bbox_inches='tight', transparent=True)
plt.close(fig)
buf.getvalue().decode('utf-8')
```

## 8. Visual Quality Rules
- Use clean textbook-style plots.
- Label axes when present.
- Use grid only when it helps interpretation.
- Shade only the mathematically relevant region.
- Mark important bounds or intersections when they matter.
- Choose a plot range that makes the geometry readable.
- Avoid decorative titles and irrelevant labels.
- Ensure sketch notation matches the question notation.
- Keep geometry mostly black or grayscale.

## 9. Validation Guidance
- Solve every question privately before output.
- Verify:
  - bounds
  - intersections
  - sign/orientation
  - region correctness
  - convergence logic
  - the consistency between the sketch and the actual setup

## 10. Explanation Style
- Explain the key setup choice or method choice.
- Keep explanations concise but mathematically meaningful.
