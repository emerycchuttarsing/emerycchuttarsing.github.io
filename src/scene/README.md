# Scene boundary

Milestone 1 defines the contract and starting configuration. The renderer and
interaction state machine are implemented in subsequent milestones.

- `types.ts`: shared scene data, named states and lifecycle contract.
- `config.ts`: camera poses, independent camera/reveal timing and media budgets.
- `../lib/projects.ts`: `toSceneProject()` derives scene data from the content collection.

Load the future renderer with a browser-only dynamic import on the home page.
Never import `astro:content` or the filesystem helper into browser modules.
Keep one scene for the terrain and all seven panels. HTML owns the titles,
links, focus and fallback content. Derive panels from the supplied project array.

The implementation must respect reduced motion; support poster-only rendering;
pause outside the viewport or in hidden tabs; limit simultaneous videos; and
release listeners, observers, animation callbacks and GPU resources in `dispose()`.
Camera values are provisional and need visual validation at milestone 2.

Sources: `docs/references/ING_TIAN.md`, `STUDIO_MIRAGE_3D.md` and
`STUDIO_MIRAGE_REA_DEEP.md` in the same references directory.
