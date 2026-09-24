# New Tab

A small, local-first new-tab page built with React, Vite, TypeScript, Tailwind CSS, and shadcn/ui.

## Development

```bash
npm install
npm run dev
```

The development server is available at `http://localhost:5173`.

## Build For Local Use

```bash
npm run lint
npm run build
```

After the build completes, open `dist/index.html` directly in the browser or use it as the local new-tab page target. Vite is configured with relative asset paths for `file://` usage. Remote favicon lookup needs network access; bookmarks still render with a generic icon when the lookup is unavailable.

## Using The Page

- Normal mode opens bookmarks when they are clicked.
- Edit mode adds, edits, deletes, and rearranges bookmarks and categories.
- Drag category and bookmark handles to reorder them or move bookmarks between categories.
- Use the edit toolbar to choose the number of columns and bookmark height.
- Changes are stored in localStorage under `newtab.bookmarks.v1`.

The first launch includes a few example bookmarks. Replace or remove them as needed.
