# Improve complex mechanical/illustrative diagram quality

## Problem

When users ask questions like "how do cars work?" or "how do airplanes work?", the agent generates SVG/HTML diagrams via the `widgetRenderer` component that are **functional but lack precision and intentionality**.

### Screenshots

**Car diagram** — rough silhouette, floating component boxes, crude annotations, oversimplified pedal sub-diagram:

![car-diagram](./assets/car-diagram-screenshot.png)

**Airplane diagram** — imprecise plane shape, rough control surfaces mini-diagram, adequate force arrows but weak airfoil representation:

![airplane-diagram](./assets/airplane-diagram-screenshot.png)

### Root causes

1. **No planning step** — the agent generates complex illustrative diagrams in a single pass with no composition planning (what to emphasize, where components sit spatially, how controls map to visuals)
2. **Thin illustrative guidance** — the existing skill files give strong rules for flowcharts and structural diagrams but only **9 lines** to illustrative diagrams (`svg-diagram-skill.txt` lines 157-165)
3. **No shape construction method** — the LLM generates freehand SVG paths that produce rough, unrecognizable silhouettes
4. **No control-to-visual binding pattern** — interactive elements (sliders, presets) are architecturally disconnected from the SVG elements they should modify

### Specific deficiencies

- Object silhouettes (car body, airplane fuselage) are rough freehand paths rather than recognizable shapes
- Internal components (engine, transmission, control surfaces) are colored boxes floating over the outline without spatial accuracy
- Annotations use crude arrows/lines without a clear visual hierarchy (primary vs secondary labels)
- Sub-diagrams (pedal arrangement, control surface detail) are oversimplified rectangles
- Interactive controls don't visually update the diagram — no feedback loop

---

## Proposed PRs

All changes are to **skill/prompt files only** — no runtime code changes needed. New `.txt` files are auto-discovered by `load_all_skills()` in `apps/agent/skills/__init__.py`.

### PR 1: Expand illustrative diagram rules in `svg-diagram-skill.txt`

**Scope:** `apps/agent/skills/svg-diagram-skill.txt` lines 157-165 (+ MCP mirror)

The current "Illustrative Diagram" section is only 9 lines. Expand with:
- **Composition grid rule**: divide 680px viewBox into zones — main illustration (x=40-480), annotation margin (x=490-640), optional sub-diagram zone (bottom 25%)
- **Depth layering order**: background -> silhouette -> internals -> connectors -> labels
- **Shape construction rule**: build recognizable objects from 4-8 geometric primitives, not a single complex path
- **Force/motion arrow conventions**: larger arrowheads (`markerWidth=8`), color-coded by type (warm = resistance, cool = propulsion, gray = gravity)
- **Cross-section vs side-view guidance**: when to use each and how to indicate cut planes

**Impact:** Immediate quality improvement for all illustrative diagrams. Smallest change, do first.

---

### PR 2: Add diagram planning protocol (pre-generation thinking step)

**Scope:** `apps/agent/skills/svg-diagram-skill.txt` (+ MCP mirror)

Before generating any illustrative diagram, the agent must complete a structured plan:

1. **Subject decomposition** — identify 3-5 key subsystems, classify as primary (prominent) vs secondary (annotation-level)
2. **Spatial layout** — assign components to a coordinate grid before writing SVG
3. **Educational priority** — what is the single most important thing to convey?
4. **Composition sketch** — define bounding rectangles for illustration, annotations, controls, sub-diagrams
5. **Control-to-visual mapping** — list which SVG element IDs each interactive control will modify
6. **Shape fidelity check** — list 4-6 defining visual features that make the subject recognizable (e.g., for a car: wheel wells, hood slope, windshield angle, roof line)

Pure prompt enhancement — no code changes. **Highest single-item impact.**

---

### PR 3: Add progressive rendering pattern for interactive diagrams

**Scope:** `apps/agent/skills/master-agent-playbook.txt`, `apps/agent/skills/svg-diagram-skill.txt` (+ MCP mirrors)

Replace scattered `oninput` handlers with a structured architecture:

- **Explicit HTML sections** via comments: `<!-- SECTION 1: Main SVG -->`, `<!-- SECTION 2: Sub-diagrams -->`, `<!-- SECTION 3: Stats -->`, `<!-- SECTION 4: Controls -->`, `<!-- SECTION 5: JS state + bindings -->`
- **Centralized state-and-render pattern**:
  ```js
  const state = { throttle: 50, gear: 3, mode: 'city' };
  function updateState(key, value) { state[key] = value; render(); }
  function render() { /* update ALL visual elements from state */ }
  ```
- **Element ID convention**: `viz-{component}-{property}` (e.g., `viz-engine-fill`, `viz-speed-text`)
- **Preset pattern**: presets as calls to `updateState` with multiple values

Ensures controls and visuals are architecturally connected rather than accidentally coupled.

---

### PR 4: Create dedicated `mechanical-illustration-skill.txt`

**Scope:** New file `apps/agent/skills/mechanical-illustration-skill.txt` (+ MCP mirror)

Comprehensive skill for mechanical/illustrative diagrams:

- **Shape construction method** — decompose objects into geometric primitives (body = rounded rect, wheels = circles, windows = trapezoids)
- **Spatial accuracy rules** — grid overlay technique for component placement
- **Annotation hierarchy** — primary (14px/500 weight, solid leader lines), secondary (12px/400, dashed leaders), tertiary (11px/400, inline)
- **Sub-diagram quality standards** — minimum 150x100px, visually connected to main diagram via callout
- **Interactive control binding template** — reusable JS pattern for slider/button -> SVG element updates
- **Two worked reference compositions** — car drivetrain and airfoil cross-section with full SVG examples

Auto-loaded by the existing `load_all_skills()` glob — no code changes.

---

### PR 5: Add SVG shape library with reusable path fragments

**Scope:** New file `apps/agent/skills/svg-shape-library.txt` (+ MCP mirror)

Pre-designed SVG path fragments the agent can reference and adapt:

- **Vehicles**: sedan side profile, airplane side profile, airplane top-down
- **Mechanical parts**: gear/cog, piston, spring, valve, wheel with spokes
- **Physics shapes**: airfoil cross-section (NACA-style), force arrow with proper head
- **Annotation elements**: zoom callout box, dimension line with tick marks
- **Control surfaces**: rudder, aileron, elevator (neutral and deflected)

Each entry includes normalized coordinates (0-100 units), transform instructions for positioning, and customization notes.

**Note:** Adds ~30-50KB to system prompt. Monitor context budget. Consider including only 6-8 most common shapes initially.

---

## Recommended sequencing

| Order | PR | Effort | Impact |
|-------|-----|--------|--------|
| 1 | PR 1: Expand illustrative rules | Small | Medium |
| 2 | PR 2: Diagram planning protocol | Small | **High** |
| 3 | PR 3: Progressive rendering | Medium | Medium |
| 4 | PR 4: Mechanical illustration skill | Medium | High |
| 5 | PR 5: SVG shape library | Large | High |

PRs 1 and 2 can be merged independently. PR 4 builds on conventions from PR 1. PR 3 and PR 5 are independent of each other.

## Verification

After each PR, test with these prompts and compare before/after:
- "how do cars work?"
- "can you explain how airplanes fly? I'm a visual person"
- "explain how a combustion engine works"
- Verify dark mode compatibility
- Check system prompt token count stays within model context budget

## Key files

- `apps/agent/skills/svg-diagram-skill.txt` — primary skill to expand (illustrative section at lines 157-165)
- `apps/agent/skills/master-agent-playbook.txt` — interactive widget templates (Part 2)
- `apps/agent/skills/__init__.py` — auto-discovers new `.txt` skill files (line 23, glob pattern)
- `apps/agent/main.py` — injects skills into system prompt (line 49)
- `apps/mcp/skills/` — MCP mirrors of all skill files
