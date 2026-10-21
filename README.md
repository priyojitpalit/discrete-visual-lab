# Discrete Visual Lab — Interactive Studios

A curated collection of seven substantial, independent discrete-mathematics explorations inspired by the topics in Oscar Levin’s *Discrete Mathematics: An Open Introduction*, 4th edition.

## Studios

- Counterexample Engine — manipulate logical inputs, compare truth tables, find counterexamples.
- Graph Coloring Studio — drag vertices, edit edges, color vertices, compute exact chromatic number, find an optimal coloring.
- Euler Trail Challenge — click edges to construct a trail, test parity, get a legal completion from the current partial route, undo and autoplay.
- Lattice Path Workshop — place obstacles, fill the DP table cell by cell, construct paths.
- Towers of Hanoi Lab — play legally, undo, obtain a shortest-path hint from an arbitrary configuration via BFS, and auto-solve.
- Function Composition Workbench — rewire functions f:A→B and g:B→C, assess injectivity/surjectivity and trace g∘f.
- Euclidean Tiling Studio — choose integer rectangle dimensions, step through the square tiling, calculate Euclidean quotients and Bézout coefficients.

## Deploy

Publish `index.html`, `styles.css`, and `app.js` into a GitHub Pages repository, or use the single-file `Discrete_Visual_Lab_Interactive.html` renamed to `index.html`. No build step, libraries, npm, or API keys. Deployment happens automatically through `.github/workflows/deploy.yml` on commits to `main`.

## Credits

These are original educational implementations aligned with selected concepts in Oscar Levin, *Discrete Mathematics: An Open Introduction*, 4th ed. (the original book is licensed CC BY-NC-SA 4.0 and its copyright remains with the author). The book's words, images, and exercises have not been reproduced. See https://discrete.openmathbooks.org/dmoi4/frontmatter.html.