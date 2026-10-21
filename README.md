# Discrete Visual Lab

A free, independent, static website containing **32 original interactive visualizations across all seven chapters (0–6)** of *Discrete Mathematics: An Open Introduction*, 4th edition, by Oscar Levin.

**Open `index.html` in a browser to start.** No Python, Node, server, build process, API key, paid subscription, web access, or registration is required. Keep the project files together in one folder.

This is a chapter-aligned visualization library, **not a copy of every pre-existing illustration, exercise, or animation in the textbook**. It provides one original animated exploration for each of the book's 32 numbered topical sections (excluding chapter summaries).

## What's included

| Chapter | Topic | Visualizations |
| --- | --- | ---: |
| 0 | Introduction and Preliminaries | 2 |
| 1 | Logic and Proofs | 5 |
| 2 | Graph Theory | 7 |
| 3 | Counting | 8 |
| 4 | Sequences | 6 |
| 5 | Discrete Structures Revisited | 2 |
| 6 | Additional Topics | 2 |
| **Total** | | **32** |

Every visualization includes step-by-step and automatic playback, a timeline scrubber, a discussion question, a mathematical relationship, and a link to its corresponding textbook section. Most have sliders that change the example. Users can search concepts, navigate chapter-by-chapter, save the current image as PNG, and continue where they left off using browser-local viewed indicators (no account).

## Publish for free with GitHub Pages

1. Create a free account at [github.com](https://github.com/) if needed.
2. Select **New repository** and name it, for example, `discrete-visual-lab`.
3. Set its visibility to **Public**. GitHub Pages on the GitHub Free plan supports public repositories.
4. Choose **Add file → Upload files**. Upload the **extracted contents of this folder** (`index.html`, `app.js`, `data.js`, `visualizations.js`, `styles.css`, `favicon.svg`, `README.md`, `LICENSE`). All files should appear at the root of the repository, not inside another nested folder.
5. Commit the files.
6. Open **Settings → Pages**. Under **Build and deployment**, select **Deploy from a branch**; choose branch **main** and folder **/(root)**; click **Save**.
7. After publication, the site will be accessible at `https://YOUR-USERNAME.github.io/discrete-visual-lab/` (replace `YOUR-USERNAME` and the repository name with yours). The Pages settings section should display the actual link when ready.

**Zero hosting costs:** no custom domain is required. You can continue uploading improved files to the same public repository.

## Use without GitHub

For students or a laptop without a web connection, use the included standalone `Discrete_Visual_Lab_Standalone.html` file (available separately). It contains all JavaScript and CSS in one file. Double-click to open it in a modern browser. The multi-file website also works locally if its files are kept in the same folder.

## Project files

- `index.html` – page layout and semantic interface
- `styles.css` – responsive visual design
- `data.js` – chapter and experiment descriptions
- `visualizations.js` – all 32 Canvas drawing engines and algorithms
- `app.js` – navigation, playback, controls, local progress, PNG export
- `favicon.svg` – original favicon
- `LICENSE` – rights and attribution

## Keys

- **Space**: start or pause animation
- **← / →**: one step backward or forward
- **/**: search the library
- **Escape**: close the navigation drawer

## Attribution and reuse

The textbook *Discrete Mathematics: An Open Introduction*, 4th ed. (© 2025 Oscar Levin) is available at https://discrete.openmathbooks.org/dmoi4/frontmatter.html and is licensed **CC BY-NC-SA 4.0**. Its chapter and section ordering is credited here for educational navigation. The site's animation code, visualizations, and instructional descriptions are original and were independently created. It is not endorsed by or affiliated with the textbook author or publisher.

The new visualization source code is released under the MIT License (see `LICENSE`). This does **not** change the licensing of the original book, and no rights to the book's text or graphics are granted here.