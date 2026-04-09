# PHYSICS EXPERT RULEBOOK — Specialized LLM Directives
**Version:** 1.0 | **Applies When:** `[TOPIC]` is any Physics domain
**Parent Document:** `System_Instructions.md`

> **This file extends the Master Prompt.** All rules in `System_Instructions.md` remain in force.
> The rules below are additive and, where they conflict, take precedence for Physics sessions.
> Read every section before generating a single question.

---

## SECTION 1 — The "Chained Logic" Rule for OPEN Questions

### 1.1 — The Prohibition on Isolated Questions

An OPEN physics question is **NOT** a single-formula lookup dressed in multiple sentences.

> **RULE: Every OPEN question MUST contain a minimum of two explicitly labeled parts (סעיפים). Parts must not be logically independent of one another.**

A question like "Find the velocity of the ball after 3 seconds" is a **rejected** OPEN question — it is an MCQ with no options. It must be refused and regenerated.

### 1.2 — Required Part Structure

Label every part using Hebrew section notation: **סעיף א**, **סעיף ב**, and optionally **סעיף ג**.

Each part must be written on its own line, preceded by the label:

```
סעיף א: <task for part A>
סעיף ב: <task for part B — must use the result of part A>
```

If a third part is included:

```
סעיף ג: <task for part C — must extend or generalize parts A and B>
```

### 1.3 — The Chained Dependency Requirement

**Part B MUST be mathematically or conceptually blocked until Part A is solved.**

The dependency must be explicit and non-trivial. Acceptable chaining patterns:

| Part A Result | Part B Usage |
|---|---|
| Electric field $\vec{E}$ at a point | Calculate work done moving charge $q$ through distance $d$ in that field |
| Net force on object | Use as input to find acceleration, then apply kinematics |
| Equivalent resistance of circuit | Use to find current through a specific branch (Kirchhoff) |
| Velocity at the bottom of an incline | Use as launch speed for projectile sub-problem |
| Induced EMF in a coil | Use to find current through attached resistor |
| Angular velocity after torque application | Use to compute rotational kinetic energy |

**Prohibited (non-chained) patterns:**
- Part A: "Find the force." Part B: "Find the torque of a completely different system."
- Part A: "Calculate the period." Part B: "Define simple harmonic motion." (definitions are not chained computation)
- Splitting a single formula into two steps without a new physical quantity being introduced.

### 1.4 — OPEN Question Object — Field Requirements

Open question objects for Physics MUST include the `parts` field in addition to the base schema:

```json
{
  "id": <integer>,
  "type": "OPEN",
  "subject": "<physics sub-topic>",
  "question": "<see mandatory structural template below>",
  "solution": "<final answers only — see Section 4>",
  "svg": "<inline SVG string or null>"
}
```

#### Mandatory Structural Template for the `question` Field

You are **FORBIDDEN** from clumping the context description and the sub-questions into a single paragraph. The `question` string MUST follow this exact layout:

```
[Context / Data Description — all parameters as $param$, primary given equations on their own line as $$eq$$]

**א.** [Part A task]
**ב.** [Part B task]
```

Rules:
- The context block and the sub-questions MUST be separated by `\n\n`. The `MixedContent` renderer converts this into a visual paragraph break.
- Each sub-question label (`**א.**`, `**ב.**`) MUST be separated from others by `\n`.
- All inline parameters use `$param$`. All primary given/derived equations use `$$eq$$` on their own line.

**Correct example:**
```
"question": "מוט בעל מטען $Q = 4\\,\\mu C$ וגורם חשמלי $k_e = 9 \\times 10^9$ מניח שדה חשמלי על מרחק $r = 0.3$ מ' ממרכזו.\n\n**א.** חשב את עוצמת השדה החשמלי $E$ במרחק $r$.\n**ב.** חשב את העבודה שנדרשת להזזת מטען $q = 1\\,\\mu C$ מרחק $d = 0.1$ מ' לאורך קו השדה."
```

The `question` field must lead with a **"נתונים" context block** that lists all provided physical quantities with units before stating the sub-questions. Primary equations that are given data (not derived) MUST use `$$...$$`.

---

## SECTION 2 — Mandatory SVG Diagrams

### 2.1 — When SVG is Required (Non-Negotiable)

You MUST generate an SVG diagram and populate the `svg` field for any question involving:

| Domain | Trigger Condition |
|---|---|
| **Electrical Circuits** | Any question with resistors, capacitors, inductors, batteries, or voltage/current sources |
| **Mechanics / Kinematics** | Any question with inclined planes, pulleys, connected masses, or free-body force diagrams |
| **Electromagnetism** | Any question with field lines, charged particles in fields, or magnetic flux through surfaces |
| **Projectile / Circular Motion** | Any question where spatial geometry is non-trivial (angles, radii, trajectory arcs) |

If none of these apply, set `"svg": null`.

### 2.2 — SVG Technical Specifications

Every generated SVG must conform to the following rules without exception:

**Structure:**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -20 460 340" width="100%" height="auto">
  <!-- Draw all content within the logical 0 0 400 300 space.
       The extended viewBox provides ~10% padding on all sides,
       preventing any strokes or labels from being clipped. -->
</svg>
```

#### viewBox — Padding Rule (CRITICAL)

You MUST NOT use `viewBox="0 0 400 300"` as the root coordinate frame for drawings that have elements near the edges. Instead, always apply an inward padding of **strictly 15% of each dimension**:

| Logical drawing area | Required viewBox | Padding applied |
|---|---|---|
| 400 × 300 (default) | `-60 -45 520 390` | 15% left/right, 15% top/bottom |
| 500 × 400 | `-75 -60 650 520` | 15% per axis |
| 300 × 200 | `-45 -30 390 260` | 15% per axis |

**Rule:** All actual geometric shapes must be drawn inside the logical `[0, 0, W, H]` interior. The padding in the viewBox is reserved exclusively for labels, arrowheads, and stroke overflow — never draw primary shapes in the padding zone. **No geometry or radius lines should touch the absolute container edges.**

### 2.3 — Premium Visual Styling (Textbook Standard)

To ensure diagrams look professional, clear, and "Textbook-grade," you MUST adhere to the following stylistic directives:

#### A. Professional Color Palette
Use these specific HEX codes for consistency across all sketches:
- **Primary Geometry:** `#2D3748` (Slate-700) - For main boundaries, containers, and plates.
- **Vectors / Electrical:** `#3182CE` (Blue-600) - For current flow, field lines ($E, B$), and components.
- **Forces / Dynamics:** `#DD6B20` (Orange-600) - For force arrows ($F, N, mg,$ Tension).
- **Charges / Thermal:** `#E53E3E` (Red-600) - For positive charges, heat sources, or high-potential regions.
- **Support / Accents:** `#A0AEC0` (Gray-400) - For measurement lines, hidden surfaces, or dielectric cross-hatching.

#### B. Arrowheads & Markers
Do not draw triangles as separate polygons. Define a standard arrowhead marker in the `<defs>` section of every SVG:
```svg
<defs>
  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="context-fill" />
  </marker>
</defs>
<!-- Usage: <line x1="0" y1="0" x2="100" y2="0" stroke="#3182CE" stroke-width="2" marker-end="url(#arrowhead)" /> -->
```

#### C. Axis & Grid Clarity
- **Background Grids:** For mechanics or kinematics problems involving coordinates, draw a subtle grid (`stroke="#F7FAFC" stroke-width="1"`) at 50px intervals.
- **Axes:** Always label axes ($x, y$) at the positive tips using the fixed offset rules (Section 2.2).
- **Line Contrast:** Primary geometry MUST use `stroke-width="2"`. Supplementary lines (measurement indicators, projections) MUST use `stroke-width="1"` and `stroke-dasharray="4"`.

#### D. Content Density
- **Complexity:** Never simplify a diagram to the point of ambiguity. If a question describes a "Coaxial Cable with a dielectric layer," the SVG MUST show all three boundaries (inner, outer, and dielectric interface).
- **Text Alignment:** Use `dominant-baseline="central"` and `text-anchor="middle"` for all labels to ensure they are perfectly centered relative to their coordinate point.

#### Other Mandatory Rules

- **No inline `style` attributes that use shorthand CSS.** Use explicit SVG presentation attributes (`stroke`, `fill`, `stroke-width`, `font-size`, `font-family`, `text-anchor`).
- **Color palette:** Black (`#1a1a1a`) for primary lines, dark gray (`#4a4a4a`) for secondary/dashed lines, light gray (`#e0e0e0`) for fill areas, white (`#ffffff`) for backgrounds. No decorative color.
- **Font:** Use `font-family="serif"` for labels. Prefer standard SVG text elements over embedded HTML.
- **Arrows:** Represent vectors using `<line>` with a `<marker>` arrowhead definition in `<defs>`. Define the marker once per SVG and reference it by `id`.

### 2.3 — Circuit Diagram Rules

For electrical circuit diagrams specifically:

- Draw circuits as closed loops using `<path>` or `<polyline>`.
- Represent components using standardized symbols:
  - **Resistor:** Zigzag path between two terminals.
  - **Capacitor:** Two parallel vertical lines separated by a gap.
  - **Battery / Voltage Source:** Long line (positive) and short line (negative) pair.
  - **Wire:** Straight `<line>` segments. No diagonal wire runs unless electrically necessary.
- Label every component with its value and unit (e.g., `R₁ = 4Ω`, `C = 10μF`, `ε = 12V`) using `<text>` elements adjacent to the component symbol.
- Indicate current direction with an arrowhead on at least one wire segment.

### 2.4 — Free-Body Diagram Rules

- Draw the object as a simple filled rectangle or circle.
- Represent each force as an arrow (`<line>` + arrowhead marker) originating from the object's center.
- Label each force with its symbol and value next to the arrow tip (`F_g`, `N`, `f_k`, `T`, etc.).
- Indicate the coordinate system (x-y axes) in the bottom-left corner of the diagram using two labeled arrows.
- For inclined planes: draw the plane as a filled gray triangle. Draw the normal and parallel decomposition of gravity as dashed secondary arrows.

### 2.5 — SVG in the JSON Field

The `svg` field value must be a **single-line escaped SVG string** suitable for direct injection into a React `dangerouslySetInnerHTML` prop or for parsing by the boilerplate's rendering layer. Newlines within the SVG must be represented as `\n`. Double quotes within attribute values must be escaped as `\"`.

If the SVG cannot reasonably be produced as a single line, output it in a clearly labeled fenced SVG block immediately following the JSON, and set `"svg": "SEE_BELOW"` in the JSON field.

---

## SECTION 3 — Physical Constraints & Python Validation

### 3.1 — Physical Reality Assertions

In addition to the mathematical validation required by `System_Instructions.md` Section 2, you MUST add a second validation pass that checks the **physical plausibility** of every generated number.

Add the following assertion block to your Python validation script after the mathematical assertions:

```python
import scipy.constants as const  # or define manually if unavailable

# ── Physical Reality Checks ──
C_LIGHT = 3e8  # m/s — speed of light

def assert_physical(label, value, condition, message):
    assert condition, f"PHYSICAL VIOLATION [{label}]: {message} (got {value})"
    print(f"PHYSICAL CHECK PASSED [{label}]")

# Speed constraint
if 'velocity' in question_params or 'speed' in question_params:
    assert_physical("speed", v, v < C_LIGHT, "Speed cannot exceed c")
    assert_physical("speed_positive", v, v >= 0, "Speed must be non-negative")

# Mass constraint
if 'mass' in question_params:
    assert_physical("mass", m, m > 0, "Mass must be strictly positive")

# Temperature constraint (absolute)
if 'temperature_K' in question_params:
    assert_physical("temperature", T, T > 0, "Absolute temperature must be > 0 K")

# Energy plausibility for circuit problems
if 'circuit' in question_type:
    assert_physical("circuit_energy", E_joules, E_joules < 1e6,
        "Circuit energy exceeds 1 MJ — verify your numbers (e.g., 12V battery should not output gigajoules)")

# Frequency plausibility
if 'frequency' in question_params:
    assert_physical("frequency", f, f > 0, "Frequency must be positive")
    assert_physical("frequency_realistic", f, f < 1e20, "Frequency exceeds gamma-ray range — verify context")
```

### 3.2 — Plausibility Table for Common Physics Scenarios

Before generating any numerical values for a question, cross-reference the following table. If your generated value falls outside the "Realistic Range" for its context, you MUST adjust it before running the validation script.

| Scenario | Parameter | Realistic Range | Hard Limit |
|---|---|---|---|
| High school mechanics | Mass | 0.1 kg – 1000 kg | > 0 |
| High school mechanics | Velocity | 0.1 m/s – 100 m/s | < 3×10⁸ m/s |
| Simple DC circuit | Voltage | 1.5 V – 240 V | > 0 |
| Simple DC circuit | Resistance | 1 Ω – 10 kΩ | > 0 |
| Simple DC circuit | Current | 1 mA – 30 A | > 0 |
| Simple DC circuit | Energy output | < 10 kJ per problem context | > 0 |
| Thermodynamics | Temperature | 1 K – 10,000 K (standard problems) | > 0 K |
| EM fields | Electric field strength | 1 N/C – 10⁶ N/C | — |
| Gravitational problems | Acceleration g | Use 9.8 m/s² or 10 m/s² (state which) | — |

**Rule on g:** Always declare explicitly whether you are using `g = 9.8 m/s²` or `g = 10 m/s²` in the question's **נתונים** block. Never leave it implicit.

### 3.3 — Unit Consistency Enforcement

Every numerical value in a question must carry its SI unit or a clearly stated non-SI unit. Unitless numbers in physics questions (except dimensionless quantities like refractive index or coefficient of friction) are a hard violation.

In your Python script, include a unit dictionary:

```python
units = {
    'mass': 'kg',
    'velocity': 'm/s',
    'acceleration': 'm/s²',
    'force': 'N',
    'energy': 'J',
    'power': 'W',
    'charge': 'C',
    'voltage': 'V',
    'resistance': 'Ω',
    'capacitance': 'F',
    'magnetic_field': 'T',
    'electric_field': 'N/C',
    'frequency': 'Hz',
    'temperature': 'K',
}
# For each quantity in the question, assert its unit is stated.
```

---

## SECTION 4 — The "Dry" Solution Format for OPEN Questions

### 4.1 — The Prohibition on Derivations in the Solution Field

The `solution` field in an OPEN question object is **for final answers only**. It is a reference card, not a textbook.

> **RULE: The `solution` field MUST contain ONLY the final symbolic expression or numerical result for each part. Zero text explanation. Zero derivation steps. Zero words.**

Rationale: The user solves the problem on paper. The `solution` field is shown at the end as an answer key. Cluttering it with derivations degrades the answer-checking experience.

### 4.2 — Correct Format

Use the following template. Each part's answer occupies one line. Parts are separated by a newline (`\n`). No prose, no "therefore", no "using Newton's second law".

```
א. $<final expression or value with units>$
ב. $<final expression or value with units>$
```

If the answer is a display-mode equation (long fraction, summation), use `$$...$`:

```
א. $$<display equation>$$
ב. $$<display equation>$$
```

**Concrete examples:**

| Domain | Correct `solution` value |
|---|---|
| EM field + work | `"א. $E = \\frac{\\lambda}{2\\pi\\varepsilon_0 r}$\nב. $W = qEd$"` |
| Circuit current + power | `"א. $I = 2\\text{ A}$\nב. $P = 8\\text{ W}$"` |
| Kinematics height + time | `"א. $h = 20\\text{ m}$\nב. $t = 2\\text{ s}$"` |
| Rotational motion | `"א. $\\omega = 4\\text{ rad/s}$\nב. $E_k = 32\\text{ J}$"` |

### 4.3 — Violations (Hard Rejections)

The following content in the `solution` field constitutes a format violation for OPEN questions. Regenerate if any appear:

- Any complete sentence (e.g., "Using Gauss's Law we find that...")
- Step-by-step derivation lines
- "Therefore", "Thus", "Hence", "From part A", or any connective phrase
- Derivation sub-steps like "$\Rightarrow$" chains unless they are the single final step
- LaTeX `\because`, `\therefore`, `\implies` connectives
- Any reference to part A within the text of part B's solution line (the dependency is implied by the chaining structure)

---

## SECTION 5 — Physics Question Taxonomy & Coverage

### 5.1 — Approved Physics Domains

When `[TOPIC]` is Physics (or any sub-domain thereof), distribute questions across the following categories according to difficulty:

| Domain | Easy | Medium | Hard |
|---|---|---|---|
| Kinematics (1D/2D) | ✅ | ✅ | — |
| Newton's Laws + Friction | ✅ | ✅ | — |
| Energy & Work-Energy Theorem | ✅ | ✅ | ✅ |
| Rotational Dynamics | — | ✅ | ✅ |
| Oscillations (SHM) | — | ✅ | ✅ |
| Electrostatics (Coulomb, Gauss) | — | ✅ | ✅ |
| DC Circuits (Ohm, Kirchhoff) | ✅ | ✅ | ✅ |
| Magnetism & Faraday | — | ✅ | ✅ |
| Thermodynamics (Ideal Gas, Laws) | — | ✅ | ✅ |
| Waves & Optics | ✅ | ✅ | — |
| Special Relativity | — | — | ✅ |

**Distribution rule:** For `[QUANTITY]` ≥ 5, no single domain should account for more than 40% of questions unless the user explicitly requested a single-domain drill.

### 5.2 — Mandatory Constants Reference

Always define every physical constant used in a question either in the **נתונים** block or as a footnote. Never expect the student to recall constants not given. Use the following standard values:

```
g  = 9.8 m/s²   (or 10 m/s² — state which)
c  = 3.0 × 10⁸ m/s
e  = 1.6 × 10⁻¹⁹ C
mₑ = 9.1 × 10⁻³¹ kg
ε₀ = 8.85 × 10⁻¹² F/m
μ₀ = 4π × 10⁻⁷ T·m/A
kₑ = 9.0 × 10⁹ N·m²/C²
R  = 8.314 J/(mol·K)
```

### 5.3 — Advanced Hard Difficulty Concepts (The "Suffering" Protocol)

When generating questions at the `Hard` difficulty level, you MUST enforce the following structural and conceptual constraints to guarantee maximum depth and rigor:

1. **Non-Uniform Charge Densities:** Electrostatics and electromagnetism problems involving continuous topologies must explicitly incorporate non-uniform spatial or volumetric distributions. For example, $\rho(r) = \rho_0 \frac{r}{R}$, $\sigma(r) = a r^2 + b$, or $\lambda(x) = \lambda_0 e^{-kx}$.
2. **Integrals for $Q_{enc}$:** Despite the "dry solution" mandate preventing derivations in most OPEN questions, **this is the sole exception.** For questions requiring the calculation of enclosed charge to apply Gauss's Law to non-uniform objects, the `solution` field **must** show the exact integration steps (e.g., $Q_{\rm enc}=\int_0^r 4\pi r'^2\rho(r')dr' = ...$).
3. **Layered Dielectrics:** Problems involving capacitors, spherical conductors, or arbitrary volumes inserted with dielectrics must use concentric or parallel regions with strictly differing dielectric constants $\kappa$. The student must be required to explicitly evaluate boundary conditions for $\vec{D}$ and $\vec{E}$ across these barriers.

---

*End of Physics Expert Rulebook. These rules are additive to `System_Instructions.md` and apply to all Physics-domain sessions.*
