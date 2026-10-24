# MTH 322: Discrete Mathematics — Spring Hill College

Prepared by **Priyojit Palit** for **MTH 322: Discrete Mathematics** at **Spring Hill College**.

**Website:** https://priyojitpalit.github.io/discrete-visual-lab/

This faculty-prepared course resource includes seven interactive mathematics topics:

- Logical equivalence — truth assignments, counterexamples, and equivalence.
- Graph coloring — graph editing, valid colorings, and chromatic number.
- Euler trails — edge-by-edge routes, parity, and trail completion.
- Lattice paths — obstacle placement and dynamic-programming counts.
- Towers of Hanoi — legal moves and shortest solutions.
- Function composition — editable mappings, injectivity, and surjectivity.
- Euclidean algorithm — square tiling, remainders, and Bézout coefficients.

## Problem generation

Every topic has **New problem**, a difficulty selector (Easy / Medium / Hard), and **Reset problem**. New problems use reproducible, seeded generators. **Copy problem link** copies a URL containing the topic, seed, difficulty, and problem type, so a student can reopen the same initial problem without creating an account.

- **Logic:** equivalent, nearly equivalent, and inequivalent formula pairs.
- **Graph coloring:** connected graphs with a verified chromatic number (planted lower bound, solver-checked).
- **Euler trails:** connected graphs with exactly 0, 2, or 4 odd-degree vertices.
- **Lattice paths:** grids with no route, exactly one route, or several routes (DP-verified).
- **Hanoi:** different numbers of disks and legal intermediate states.
- **Functions:** constructed injective, surjective, bijective, and neither cases.
- **Euclid:** coprime pairs, shared-factor pairs, and long-remainder chains.

Resetting restores the original generated configuration, including its random seed. Existing preset examples remain available.

The mathematical activities, deterministic generators, and interaction controls are consolidated into `app.js`; the problem controls are styled by `practice.css`. No external APIs or server are required.

## Deployment

Static HTML, CSS, and one JavaScript application bundle (`app.js`). Before deploying each change, the GitHub Actions workflow checks JavaScript syntax and runs the regression suite in `tests/site.test.cjs`. No build process or server is required.

## Textbook reference

Oscar Levin, *Discrete Mathematics: An Open Introduction*, 4th edition:
https://discrete.openmathbooks.org/dmoi4/frontmatter.html

These are original visualizations corresponding to selected mathematical topics; they do not reproduce the textbook's text, figures, or code. The textbook is separately licensed under CC BY-NC-SA 4.0.

This repository is a faculty-prepared course resource, not an official Spring Hill College institutional website.
