# PHYSICS II EXPERT RULEBOOK
**Parent Documents:** `Common_Exam_Rules.md`, `Sketch_Quality_Rules.md`

These rules apply when the course is Physics 2.

## 1. Scope
Treat Physics 2 as primarily:
- electrostatics
- electric fields and flux
- Gauss's law
- electric potential and capacitance
- DC circuits
- magnetic fields and magnetic force
- current-carrying wires, loops, solenoids, toroids
- electromagnetic induction
- basic RC/RL transients when requested
- geometrically meaningful optics or wave setups when requested

## 2. Difficulty Guidance
- Easy:
  direct physical interpretation or one-step formula usage
- Medium:
  multi-step setup with symmetry, field, circuit, or direction reasoning
- Hard:
  multi-concept synthesis, nontrivial geometry, layered physical logic, or parameterized reasoning

## 3. Diagram Policy
- Use `python_drawer` whenever geometry, symmetry, direction, or layout is central to solving the question.
- `python_drawer` is strongly recommended or mandatory for:
  - conducting shells, spheres, and cylinders
  - Gaussian surfaces
  - infinite sheets and parallel plates
  - dipoles and point-charge layouts
  - capacitor geometry
  - circuit topology questions
  - magnetic field direction questions
  - current-carrying wire or loop setups
  - induction setups with moving bars, loops, or changing flux
  - optics setups where the geometry is the problem
- Use `"python_drawer": null` only when the problem is mainly algebraic and a sketch adds no real pedagogical value.
- Follow `Sketch_Quality_Rules.md` for all shared drawing-quality and runtime constraints.
- If the sketch cannot be generated clearly and contract-safely, set `"python_drawer": null`.

## 4. Tool Selection
- Use `schemdraw` for:
  - batteries
  - resistors
  - capacitors
  - switches
  - clear loop and branch circuit layouts
- Use `matplotlib` and optionally `numpy` for:
  - electrostatics geometry
  - Gaussian surfaces
  - field direction sketches
  - magnetic force geometry
  - induction setups
  - optics and coordinate-based layouts
- Use the simplest tool that fits the sketch type.
- Prefer standard sketch templates over improvised layouts.

## 5. What a Good Physics 2 Sketch Must Show

### Electrostatics and Gauss
- relevant charged object geometry
- center, axis, or symmetry cue when needed
- Gaussian surface if used
- labeled radii or distances such as `$r$`, `$R$`, `$a$`, `$b$`, `$R_1$`, `$R_2$`
- field direction arrows when relevant

### Parallel Plates and Capacitors
- plate positions
- charge signs
- field direction
- spacing or dielectric region if central to the problem

### Circuits
- standardized readable circuit symbols
- component labels and values
- current direction if relevant
- uncluttered branch structure

### Magnetism and Induction
- current direction
- wire, loop, or bar geometry
- velocity, magnetic field, and force directions when relevant
- changing area or changing flux cue when appropriate

## 6. Physics 2 Sketch Families And Visual Rules

### General Physics Sketch Principle
A Physics 2 sketch must clarify geometry, symmetry, direction, or layout.
It should look like a clean textbook schematic, not a decorative illustration.

### Spherical Gauss-Law Setups
- draw the charged object boundary with a solid line
- draw the Gaussian surface with a dashed line
- use equal aspect ratio
- keep the geometry mostly black or grayscale
- dark gray fill is allowed for the physical body when helpful
- draw each radius as a dashed helper segment with a small arrowhead
- include all named radii such as `$r$`, `$R$`, `$a$`, `$b$`, `$R_1$`, `$R_2$` when relevant
- place each radius label next to its own helper segment, not loosely in the figure
- do not leave radius identity implicit
- include field direction arrows only when they help the reasoning

### Cylindrical Gauss-Law Or Line-Charge Setups
- draw the physical boundary with a solid line
- draw the Gaussian cylinder or helper boundary with a dashed line
- show the axis when it helps symmetry interpretation
- use equal aspect ratio when the geometry is shown in cross-section
- include dashed radius markers with small arrowheads when radius is part of the setup
- label each named radius directly next to its own helper segment
- keep field arrows sparse and meaningful

### Infinite Sheet Or Parallel-Plate Setups
- show plates as clean, separated boundaries
- keep the geometry mostly black
- mark charge signs only when relevant
- use a small number of clear field arrows
- show spacing only if it matters to the problem

### Capacitors
- make plate or shell geometry clear
- distinguish dielectric regions when present
- include all named distances or radii that are part of the setup
- keep helper lines dashed and physical boundaries solid
- when multiple radii appear, label each one explicitly
- avoid decorative detail

### Circuits
- prefer `schemdraw` for standard circuit topology
- use standard component symbols
- label components clearly and briefly
- keep loop and branch structure readable
- do not create unnecessarily stretched or crowded layouts
- include current direction only when it matters to the question
- keep the circuit mostly monochrome
- the final return must be decoded SVG text only

### Straight Wire, Loop, And Magnetic-Force Setups
- clearly show wire or loop geometry
- label current direction clearly
- show `$\\vec{B}$`, velocity, or force directions only when relevant
- use color only if it materially helps distinguish physical vectors
- keep vector directions spatially unambiguous
- avoid too many arrows in the same region

### Induction Setups
- show the moving bar, loop, or changing area clearly
- indicate the changing-flux cue the student is supposed to reason about
- keep the setup visually simple
- use color only for physical vectors when needed

### Optics Or Wave Geometry When Used
- show only the geometric relationships needed for the question
- keep rays or wavefront cues minimal and readable
- avoid decorative detail

### Physics 2 Sketch Rejection Rule
Set `"python_drawer": null` if:
- the geometry is not central
- the layout cannot be drawn clearly
- the code would likely produce a cluttered or ambiguous figure
- valid SVG output is not certain
- a named radius is not clearly identified
- the sketch adds no real pedagogical value

## 7. Python Drawer Runtime
- Allowed imports:
  - `io`
  - `math`
  - `numpy`
  - `matplotlib`
  - `matplotlib.pyplot`
  - `matplotlib.patches`
  - `schemdraw`
  - `schemdraw.elements`
- Forbidden:
  - `config`
  - filesystem paths
  - `plt.show()`
  - saving to disk

## 8. Required Export Patterns

### Schemdraw
End the script with:

```python
d.get_imagedata('svg').decode('utf-8')
```

### Matplotlib
End the script with the equivalent of:

```python
import io
buf = io.BytesIO()
fig.savefig(buf, format='svg', bbox_inches='tight', transparent=True)
plt.close(fig)
buf.getvalue().decode('utf-8')
```

## 9. Visual Quality Rules
- Make sketches clean, centered, and textbook-like.
- Use equal aspect ratio for radial or circular geometry.
- Leave enough margin so labels are not clipped.
- Show direction clearly for fields, currents, and vectors.
- Label only quantities that help solve the problem.
- Avoid decorative clutter.
- Ensure the sketch notation matches the question notation.
- Keep geometry mostly black or grayscale unless vector color is truly useful.
- Dark gray fill is acceptable for physical bodies when it improves readability.

## 10. Validation Guidance
- Solve every question privately before output.
- Verify:
  - signs
  - units
  - vector directions
  - symmetry logic
  - current or voltage consistency
  - flux reasoning
  - induction direction by Lenz's law
  - consistency between the sketch and the actual setup
  - valid SVG output with no leading non-SVG text
  - every shown radius has a small arrowhead
  - every named radius is explicitly identified

## 11. Explanation Style
- Explanations should emphasize the key physical law or symmetry argument.
- Keep them concise, correct, and physically meaningful.
