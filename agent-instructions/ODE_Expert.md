# ODE EXPERT RULEBOOK
**Parent Document:** `Common_Exam_Rules.md`

These rules apply when the course is Ordinary Differential Equations.

## 1. Scope
Focus on standard undergraduate ODE topics such as:
- first-order separable equations
- first-order linear equations
- exact equations
- homogeneous first-order substitutions
- Bernoulli equations
- second-order linear ODEs with constant coefficients
- initial value problems
- undetermined coefficients
- variation of parameters when the requested difficulty justifies it
- Laplace transforms only if explicitly requested or clearly within course scope

## 2. Hard Rule: No Sketches
- For this subject, every question MUST use `"python_drawer": null`.
- Do not generate slope fields.
- Do not generate phase portraits.
- Do not generate solution graphs.
- Do not generate visual aids of any kind.
- This course should be assessed analytically, not visually.

## 3. Difficulty Guidance
- Easy:
  direct recognition and one standard solution method
- Medium:
  method selection, multi-step solving, and initial condition handling
- Hard:
  non-obvious method choice, parameterized families, deeper interpretation, or chained multi-part reasoning

## 4. Open-Ended Design
- Prefer 2-part open questions when useful.
- Good chaining examples:
  - solve the differential equation, then apply an initial condition
  - classify the equation, then solve it
  - solve the homogeneous equation, then construct the full solution
- Do not create unrelated multi-part questions.

## 5. Validation Guidance
- Solve every ODE fully in private reasoning before output.
- Verify:
  - method choice
  - integrating factor correctness
  - characteristic equation roots
  - constants from initial conditions
  - substitution back into the original equation when possible

## 6. Explanation Style
- Name the correct method explicitly when it matters:
  - separable
  - linear first-order
  - exact
  - Bernoulli
  - second-order constant coefficients
  - etc.
- Keep explanations concise but mathematically meaningful.

## 7. Output Rule
- Every question object in this subject must include:

```json
"python_drawer": null
```
